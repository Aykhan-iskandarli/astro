// `npm start`: brings up the whole stack for local development.
//   1. API in Docker (built on first run), waits until /api/health answers
//   2. Web dev server (Vite) in the foreground, proxying /api to the container
// Ctrl+C stops the web server and the API container.
import {spawn, spawnSync} from 'node:child_process';
import {connect} from 'node:net';

const API_HEALTH = 'http://localhost:8000/api/health';
const WEB_URL = 'http://localhost:3000';
const isWin = process.platform === 'win32';

const run = (cmd, args) => spawnSync(cmd, args, {stdio: 'inherit', shell: isWin});

const dockerOk = spawnSync('docker', ['info'], {stdio: 'ignore', shell: isWin}).status === 0;
if (!dockerOk) {
    console.error('\n✖ Docker is not running. Start Docker Desktop and run `npm start` again.\n');
    process.exit(1);
}

// Plain `docker build` (cached, seconds when nothing changed). Docker Compose v5 builds through "bake", which
// stops with an fs.read entitlement prompt on this setup, so the image is built here and compose only runs it.
console.log('▶ Building the API image (first run also downloads the city index)…');
if (run('docker', ['build', '-q', '-f', 'apps/api/Dockerfile', '-t', 'astra-api:dev', '.']).status !== 0) {
    console.error('\n✖ Could not build the API image.\n');
    process.exit(1);
}
console.log('▶ Starting API container…');
if (run('docker', ['compose', 'up', '-d', '--no-build', 'api']).status !== 0) {
    console.error('\n✖ Could not start the API container.\n');
    process.exit(1);
}

process.stdout.write('▶ Waiting for the API');
const started = Date.now();
for (;;) {
    try {
        const res = await fetch(API_HEALTH);
        if (res.ok) break;
    } catch {
        // not up yet
    }
    if (Date.now() - started > 120_000) {
        console.error('\n✖ API did not become healthy within 2 minutes. Logs: `docker compose logs api`\n');
        process.exit(1);
    }
    process.stdout.write('.');
    await new Promise((r) => setTimeout(r, 1000));
}
console.log(' ready');

// A second `npm start` while one is already running: Vite would fail on the taken port (strictPort), and the
// exit handler below would then stop the API that the first instance is still using. Leave everything running.
const webRunning = await new Promise((resolve) => {
    const socket = connect(3000, 'localhost');
    socket.once('connect', () => { socket.destroy(); resolve(true); });
    socket.once('error', () => resolve(false));
});
if (webRunning) {
    console.log(`\n✔ The web app is already running → ${WEB_URL} (another \`npm start\`). API is up; nothing else to do.\n`);
    process.exit(0);
}

console.log(`▶ Starting web app → ${WEB_URL}\n`);
const web = spawn('npm', ['run', 'dev', '-w', 'apps/web'], {stdio: 'inherit', shell: isWin});

let stopping = false;
const stop = () => {
    if (stopping) return;
    stopping = true;
    console.log('\n▶ Stopping…');
    web.kill();
    run('docker', ['compose', 'stop', 'api']);
    process.exit(0);
};
process.on('SIGINT', stop);
process.on('SIGTERM', stop);
web.on('exit', stop);
