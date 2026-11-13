// Build-time prerender of public routes into static HTML (fast LCP, social previews, AI crawlers).
// Runs after `vite build`: serves dist/, opens each route in a headless browser, saves the DOM.
// Browser: system Edge/Chrome via PRERENDER_CHANNEL (msedge | chrome) or PRERENDER_BROWSER (path).
import {copyFile, mkdir, writeFile} from 'node:fs/promises';
import {dirname, join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {preview} from 'vite';
import {chromium} from 'playwright-core';

const ROUTES = ['/', '/natal-chart', '/name-analysis', '/privacy-policy']; // keep in sync with publicRoutes (src/router/routes.ts)
const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dist = join(root, 'dist');

// Keep the untouched SPA shell for unknown paths (404) — hosting must fall back to /spa.html, not /index.html
await copyFile(join(dist, 'index.html'), join(dist, 'spa.html'));

const server = await preview({root, preview: {port: 4319, strictPort: true}, logLevel: 'error'});
const base = 'http://localhost:4319';
const browser = await chromium.launch(process.env.PRERENDER_BROWSER
    ? {executablePath: process.env.PRERENDER_BROWSER}
    : {channel: process.env.PRERENDER_CHANNEL ?? 'msedge'});

const pages = [];
try {
    for (const route of ROUTES) {
        const page = await browser.newPage({viewport: {width: 1280, height: 800}, reducedMotion: 'no-preference'});
        await page.goto(base + route, {waitUntil: 'networkidle'});
        await page.waitForTimeout(3500); // let intro animations settle into their final state
        const html = await page.evaluate(() => {
            const head = document.head;
            // Route-specific tags hoisted by React (title/meta/canonical/OG/JSON-LD) replace the site defaults
            head.querySelectorAll('[data-default-meta]').forEach((el) => el.remove());
            head.querySelectorAll('style, title, meta[name=description], meta[property^="og:"], meta[name^="twitter:"], meta[name=robots], link[rel=canonical], script[type="application/ld+json"]')
                .forEach((el) => el.setAttribute('data-prerender', ''));
            // Drop anything injected at runtime that points at this temporary server (e.g. lazy-chunk modulepreloads)
            document.querySelectorAll('link[href^="http://localhost:4319"], script[src^="http://localhost:4319"]').forEach((el) => el.remove());
            // Canvas pixels are not serialisable: drop canvases, React recreates them on load
            document.querySelectorAll('#root canvas').forEach((c) => c.remove());
            // Preload the heading/body fonts this page actually used, so the LCP text paints in its final font
            // (avoids a late font swap that re-lays out the hero and moves LCP/CLS)
            const fonts = performance.getEntriesByType('resource').map((e) => new URL(e.name).pathname)
                .filter((u) => /(playfair-display-latin(-ext)?-500|inter-latin(-ext)?-wght)-normal.*\.woff2$/.test(u));
            for (const href of [...new Set(fonts)]) {
                const l = document.createElement('link');
                Object.assign(l, {rel: 'preload', as: 'font', type: 'font/woff2', href, crossOrigin: 'anonymous'});
                head.prepend(l);
            }
            // <meta charset> must stay within the first 1024 bytes (CSS-in-JS styles were injected above it)
            const charset = head.querySelector('meta[charset]');
            if (charset) head.prepend(charset);
            document.documentElement.setAttribute('data-prerendered', '');
            return '<!doctype html>\n' + document.documentElement.outerHTML;
        });
        pages.push({route, html});
        await page.close();
    }
} finally {
    await browser.close();
    await new Promise((resolve) => server.httpServer.close(resolve));
}

// Write only after every route was captured from the clean build, so no page is rendered from another's output
// Each route is written as both /route.html and /route/index.html, so hosts that resolve either
// (".html" extension lookup or directory index) serve the prerendered page for "/route".
for (const {route, html} of pages) {
    const files = route === '/'
        ? [join(dist, 'index.html')]
        : [join(dist, `${route.slice(1)}.html`), join(dist, route.slice(1), 'index.html')];
    for (const file of files) {
        await mkdir(dirname(file), {recursive: true});
        await writeFile(file, html, 'utf8');
    }
    console.log(`prerendered ${route} -> ${files.map((f) => f.replace(root, '.')).join(', ')} (${Math.round(html.length / 1024)} kB)`);
}
