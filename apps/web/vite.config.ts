/// <reference types="vitest/config" />
import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
import {fileURLToPath, URL} from 'node:url';

const src = (dir: string) => fileURLToPath(new URL(`./src/${dir}`, import.meta.url));

export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            assets: src('assets'),
            core: src('core'),
            pages: src('pages'),
            router: src('router'),
            store: src('store'),
        },
    },
    server: {
        port: 3000,
        strictPort: true, // project rule: the web app always runs on 3000
        proxy: {
            '/api': 'http://localhost:8000',
        },
    },
    // No manualChunks: forcing vendor chunks made three.js and all of antd load on the landing page.
    // Route- and scene-level lazy() imports already split them where they are used.
    build: {
        chunkSizeWarningLimit: 700,
        sourcemap: true, // open source (AGPL): ship readable maps
    },
    test: {
        environment: 'node',
        include: ['src/**/*.test.ts'],
    },
});
