# Astra

A free, open-source astrology platform: Western, Vedic and Chinese astrology, numerology and the Destiny
Matrix, calculated with Swiss Ephemeris precision and presented in a calm, immersive web app in
Azerbaijani and English (Russian is being added: untranslated parts show in English).

- **Accurate**: positions come from the Swiss Ephemeris (via kerykeion); golden tests compare every
  planet, node, Lilith, Chiron, angle and house cusp against raw `pyswisseph` (< 1′ tolerance).
- **Private**: birth data is never stored or logged on the server. Saving a chart is opt-in and stays in
  the browser.
- **Free**: AGPL-3.0. The core chart will stay free.

## What it does

**Natal chart** (`/natal-chart`), one result screen with tabs:

- **Natal**: wheel, planets and points, houses with rulers, aspect grid, aspect patterns, element/modality
  balance, the "Big Three" summary and interpretations (planet in sign, planet in house, aspect pairs).
  Extra points: Ceres, Pallas, Juno, Vesta, Vertex, Part of Spirit, Selena. Details: dominants, mutual
  receptions, out-of-bounds, antiscia, prenatal eclipses, 18 fixed stars, Hellenistic lots, harmonic charts
  H5/H7/H9.
- **Destiny Matrix**: 22 arcana (Ladini method), purposes, health map, love/money lines, age timeline.
- **Karmic path**: lunar node axis, Chiron, Lilith.
- **Transits**: any date and time, bi-wheel.
- **Full readings**: every placement keeps its short text and has a "Read in full" section underneath (the planet, the sign,
  the house, the aspect types it makes and, for the Sun, Moon and Ascendant, a text written for that sign); the same on the
  transformation cards.
- **Chart portrait**: under the Big Three, the first things an astrologer counts: the chart ruler by house, the sect, the halves
  of the chart, stelliums, retrograde planets and a planet that rules several of the Big Three.
- **Forecast**: transit timeline (exact dates for 12 months), life timeline (the years Jupiter-Pluto spend in each
  of your houses), retrograde calendar (with the natal house of each station), solar and lunar returns (with relocation),
  secondary progressions, life cycles (Jupiter/Saturn/Chiron returns, profections), firdaria, zodiacal
  releasing, solar arc. The solar and lunar returns come with a short reading (house of the Sun / Moon, Ascendant sign).
- **Vedic**: sidereal (Lahiri) D1/D9 and D3/D7/D10/D12, nakshatras, Vimshottari dasha, yogas, Ashtakavarga,
  Sade Sati.
- **Numerology**: core numbers, pinnacles and challenges, personal year/month/day, Lo Shu grid, Pythagoras
  square (psychomatrix), compatibility.
- **Chinese**: BaZi four pillars, luck pillars and annual pillars, Zi Wei Dou Shu, Chinese zodiac compatibility.
- **Compatibility**: synastry with a score, composite and Davison charts, Guna Milan + Manglik, summary.
- **Other systems**: Tarot birth cards, Maya Tzolkin, Kua number.
- **Astrocartography**: planet lines on a world map (bundled Natural Earth outline, no external requests).

**Other pages**

- `/today`: the sky now (Moon phase, sign and Moon mansion, void-of-course Moon, retrogrades, planet positions,
  coming lunations and stations), Panchang and planetary hours, and for your chart: the Moon's day (its natal
  house, house and sign changes and exact aspects to natal points in the next 24 hours), today's transits and
  the coming Moon phases with the natal house each falls in.
- `/calendar`: astro calendar for a year (lunations, eclipses, ingresses, stations, retrograde periods) and a
  moon calendar (lunar days, phase, void-of-course Moon) for a chosen city, plus the year's lunations and
  eclipses read in your chart (natal house and natal points touched).
- `/name-analysis`: numerology from a full name alone; the birth date is optional.
- `/year-forecast`: one chosen year read in your chart: the annual profection(s), the solar return, the firdaria
  sub-periods, the busiest months (exact aspects from Jupiter-Pluto, month by month), the slow planets' houses,
  New/Full Moons and eclipses with their natal houses, and the year's retrogrades.
- `/choose-day`: choosing days. For one month and a topic (career, money, relationships, communication and travel, home,
  yourself) and an intention (begin or finish): the days and hours when the Moon is in the houses of that topic, outside
  its void-of-course hours, with a fitting phase, and with Mercury retrograde flagged where it matters.
- `/transformations`: what a birth date points to in a chosen year. Only the birth date is needed. The long transits of
  Jupiter-Pluto to the natal planets grouped as life cycles (Saturn return, Uranus opposition, ...), major changes and
  other contacts, each with its exact dates, the age, a short line and a full reading to expand.
- `/glossary`: plain-language explanations of the terms used on the site (also shown as tooltips).
- `/profiles`: saved charts as people (relation, "my chart"), with a JSON backup and restore; the data stays in
  the browser.
- `/privacy-policy`.

The result can be downloaded as a PNG, or as a share card (1080×1350).

Interpretation texts are AI-written drafts and still need editorial review (see `packages/content`).
The full list of phases, methods and how each was verified is in [docs/roadmap.md](docs/roadmap.md).

## Repository layout

```
apps/
  web/        Vite + React 19 + TypeScript front end (Ant Design, Redux Toolkit, React Query, React-JSS,
              framer-motion, React Three Fiber)
  api/        FastAPI service: /api/charts/* (one endpoint per engine module), /api/numerology*, /api/sky*,
              /api/places (offline GeoNames index); full list at http://localhost:8000/api/docs
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
docker compose run --rm -w /app/packages/engine api pytest -q   # engine: unit + golden tests (375)
docker compose run --rm api pytest -q                           # API (35)
npm test                                                        # content consistency (2165 keys) + web unit tests (59)
npm run typecheck -w apps/web
```

## Build

```bash
npm run build                     # typecheck → vite build → prerender public routes into dist/
npm run build:spa -w apps/web     # same without the prerender step
```

The prerender step writes static HTML for `/`, `/natal-chart`, `/name-analysis`, `/glossary` and `/privacy-policy` (fast first paint,
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
