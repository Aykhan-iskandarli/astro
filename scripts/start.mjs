// `npm start`: brings up the whole stack for local development.
//   1. API in Docker (built on first run), waits until /api/health answers
//   2. Web dev server (Vite) in the foreground, proxying /api to the container
// Ctrl+C stops the web server and the API container.
import {spawn, spawnSync} from 'node:child_process';

const API_HEALTH = 'http://localhost:8000/api/health';
const WEB_URL = 'http://localhost:3000';
const isWin = process.platform === 'win32';

const run = (cmd, args) => spawnSync(cmd, args, {stdio: 'inherit', shell: isWin});

const dockerOk = spawnSync('docker', ['info'], {stdio: 'ignore', shell: isWin}).status === 0;
if (!dockerOk) {
    console.error('\n✖ Docker is not running. Start Docker Desktop and run `npm start` again.\n');
    process.exit(1);
}

console.log('▶ Starting API container (first run builds the image and downloads the city index)…');
if (run('docker', ['compose', 'up', '-d', 'api']).status !== 0) {
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
