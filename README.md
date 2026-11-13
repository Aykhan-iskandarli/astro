# Astra

A free, open-source astrology platform. Phase 1 delivers an accurate Western natal chart
(Swiss Ephemeris precision, astro-seek level of detail) with a calm, immersive web experience in
Azerbaijani and English.

- **Accurate**: positions come from the Swiss Ephemeris (via kerykeion); golden tests compare every
  planet, node, Lilith, Chiron, angle and house cusp against raw `pyswisseph` (< 1′ tolerance).
- **Private**: birth data is never stored or logged on the server. Saving a chart is opt-in and stays in
  the browser.
- **Free**: AGPL-3.0. The core chart will stay free.

## Repository layout

```
apps/
  web/        Vite + React 19 + TypeScript front end (Ant Design, Redux Toolkit, React Query, React-JSS,
              framer-motion, React Three Fiber)
  api/        FastAPI service: /api/charts/natal, /api/places (offline GeoNames index)
packages/
  engine/     Python calculation modules — common interface calculate(birth_data) -> JSON
  content/    Interpretation texts (az, en) as structured JSON + a small TS helper
docs/         Spike report, architecture, roadmap, phase reports
spike/        Step 0 library comparison scripts (kerykeion vs stellium vs pyswisseph)
```

See [docs/architecture.md](docs/architecture.md) for how the pieces fit together.

## Requirements

- **Docker** (Desktop) — runs the API. `pyswisseph` has no prebuilt wheels and needs a C toolchain; the
  image provides it, so no local Python setup is needed.
- **Node.js ≥ 20** and npm — runs the web app.
- For the production build's prerender step: an installed **Microsoft Edge or Google Chrome**
  (`PRERENDER_CHANNEL=chrome` to use Chrome, or `PRERENDER_BROWSER=/path/to/browser`).

## Run locally

```bash
npm install
npm start                         # API in Docker + web app → http://localhost:3000
```

`npm start` checks that Docker is running, starts the API container (the first run builds the image and
downloads the GeoNames city index, ~6 MB), waits until `/api/health` answers, then starts the Vite dev
server, which proxies `/api` to `:8000`. Ctrl+C stops both. The API docs are at http://localhost:8000/api/docs.

To run the parts separately: `docker compose up -d api` and `npm run dev`.

## Test

```bash
docker compose run --rm -w /app/packages/engine api pytest -q   # engine: unit + golden tests (277)
docker compose run --rm api pytest -q                           # API (25)
npm test                                                        # content consistency + web unit tests
npm run typecheck -w apps/web
```

## Build

```bash
npm run build                     # typecheck → vite build → prerender public routes into dist/
npm run build:spa -w apps/web     # same without the prerender step
```

The prerender step writes static HTML for `/`, `/natal-chart` and `/privacy-policy` (fast first paint,
route-specific meta/OG tags for social previews and crawlers) as both `dist/<route>.html` and
`dist/<route>/index.html`, and keeps the untouched SPA shell as `dist/spa.html`.
**Hosting must serve the prerendered file when it exists and fall back to `dist/spa.html` with HTTP 404
for unknown paths — never to `dist/index.html` (that is the prerendered home page).** Example (nginx):

```nginx
root /srv/astra/dist;
access_log off;   # the privacy policy promises no request logs (query strings can hold personal data)
location /api/ { proxy_pass http://api:8000; }
location /assets/ { add_header Cache-Control "public, max-age=31536000, immutable"; }
location / {
    try_files $uri $uri.html $uri/index.html =404;
    error_page 404 /spa.html;   # React Router renders the 404 page
}
```

`vite preview` is only an approximation of this (it falls back to `index.html`).

## Configuration

| Variable | Where | Default | Purpose |
|---|---|---|---|
| `VITE_SITE_URL` | web build | `https://astra.example` | Canonical URLs, OG tags |
| `VITE_SOURCE_URL` | web build | placeholder | AGPL §13 source link in the footer |
| `VITE_API_URL` | web build | same origin | API base URL |
| `ASTRA_SOURCE_URL` | API | placeholder | Reported by `/api/health` |
| `ASTRA_CORS_ORIGINS` | API | none | Comma-separated origins, only if the API is served cross-origin |
| `ASTRA_CITIES_PATH` | API | `/data/cities.json` | Offline city index |
| `VITE_PRIVACY_EMAIL` | web build | none (shown as "to be set") | Contact address in the privacy policy |
| `VITE_HOSTING_LOCATION` | web build | none (shown as "to be set") | Hosting provider and country in the privacy policy |

The privacy policy text is in `apps/web/src/pages/privacy-policy/privacy-policy.data.ts`; it describes what the code does and must be updated together with any change to data handling.

Before launch, replace the `astra.example` domain in `apps/web/public/robots.txt`, `sitemap.xml` and
`llms.txt`.

## License

[AGPL-3.0-only](LICENSE). Third-party components and data, and how their licenses were verified:
[THIRD_PARTY_LICENSES.md](THIRD_PARTY_LICENSES.md). City data © GeoNames (CC BY 4.0).
