# Phase 1 report — Western natal chart (MVP)

Date: 2026-11-10 · Status: **waiting for owner approval** before Phase 2

## What was built

| Deliverable | Where | Notes |
|---|---|---|
| Monorepo + README (setup, run, test, build, license) | `/`, `README.md` | npm workspaces (web, content) + Docker for Python |
| Spike report (Step 0) | `docs/spike-report.md` | Approved: kerykeion 6.0.5 + swisseph backend, Docker, 1800–2999 |
| Engine module `western.natal` | `packages/engine` | 15 points (10 planets, true nodes, mean Lilith, Chiron, Part of Fortune), ASC/MC/DC/IC, 12 cusps in Placidus/Koch/Whole Sign/Equal, 9 aspects with orbs and applying/separating, 7 pattern types, dignities, element/modality/polarity balance, lunar phase, sect, time-unknown mode, DST notes, polar fallback detection |
| API | `apps/api` | `POST /api/charts/natal`, `GET /api/places` (offline GeoNames, ~70k places), `GET /api/health`; stateless, no access log |
| Interpretation content (az, en) | `packages/content` | Point + sign + house sentences, aspects, patterns, dignities, elements; **AI-written drafts** |
| Natal chart page | `apps/web/src/pages/natal-chart` | Form (date, time, "time unknown", place search, house system) → animated wheel (houses → signs → planets → aspects; hover/focus highlights aspects) → interpretation panel, planets table, angles & cusps, triangular aspect grid, patterns, balance; opt-in "save on this device" |
| Landing page | `apps/web/src/pages/home` | Hero with parallax starfield/nebulae/orbit lines; scroll-driven solar-system journey (R3F, 10 planets with archetype cards, dot navigation); features; CTA with orbit-line drawing |
| Website basics | `apps/web` | SEO component (title/description/canonical/OG/JSON-LD per page), prerendered public routes, sitemap, robots, llms.txt, favicon, manifest, OG image, 404, privacy policy (draft), AGPL source link, GeoNames attribution, AZ/EN switch, ambient sound toggle (off by default) |
| Third-party licenses | `THIRD_PARTY_LICENSES.md` | Each verified from its LICENSE file |
| Architecture, roadmap | `docs/architecture.md`, `docs/roadmap.md` | |

## What was tested (all run on 2026-11-10, all passing)

| Suite | Result | Command |
|---|---|---|
| Engine: golden tests vs raw pyswisseph (4 births × all points, angles, 12 cusps × 4 systems, Part of Fortune day/night), UTC/DST resolution, validation, pure functions (aspects, patterns, dignities, balance, lunar phase, house/sign maths), polar fallback, time unknown, determinism | **79 passed** | `docker compose run --rm -w /app/packages/engine api pytest -q` |
| API: end-to-end natal request, time unknown, validation errors, place search (normalisation of ə/ǝ/ı, ranking, Cyrillic) | **7 passed** | `docker compose run --rm api pytest -q` |
| Content: identical keys in az/en, no empty strings, expected counts | **pass** (224 keys × 2) | `npm test -w packages/content` |
| Web: wheel geometry (screen angles, glyph spreading incl. 0° Aries wrap) | **8 passed** | `npm test -w apps/web` |
| Web typecheck + production build + prerender | **pass** | `npm run build` |

Browser checks (Playwright driving the installed Edge, scripts not committed):

- Full flow: form → place search "Bakı" → chart. The values match the spike reference (Sun Gemini 24°01′, 9th house; Mars Aries 10°57′, 7th house, domicile; UTC 09:30).
- Hovering a planet dims the 46 unrelated elements. Keyboard: Tab reaches each planet and Enter shows its interpretation.
- Language switch updates the text, `<html lang>` and `<title>`.
- No horizontal overflow at 360 px and 390 px. The mobile header fits.
- Reduced motion: no WebGL canvas and no parallax. The journey becomes a static list and all content stays.
- No console errors. The only warning is a `THREE.Clock` deprecation that comes from inside R3F.

Lighthouse (mobile, production build with prerender, Edge):

| Page | Throttling | Perf | A11y | Best practices | SEO | FCP | LCP | TBT | CLS |
|---|---|---|---|---|---|---|---|---|---|
| `/` | devtools (applied) | 73 | 100 | 100 | 100 | 2.1 s | **2.1 s** | 1.16 s | **0** |
| `/` | simulate (Lantern) | 49 | 100 | 100 | 100 | 4.0 s | 5.2 s | 1.08 s | 0 |
| `/natal-chart` | devtools (applied) | 77 | 100 | 100 | 100 | 1.9 s | **1.9 s** | 0.97 s | **0** |
| `/natal-chart` | simulate (Lantern) | 59 | 100 | 100 | 100 | 3.3 s | 5.5 s | 0.52 s | 0 |

With applied throttling, LCP is under the 2.5 s target and nothing shifts. Lantern's simulated LCP stays at about 5 s because it puts the ~290 KB (gzip) of high-priority module JS on the critical path, even though the prerendered HTML paints without it.

## Decisions made during the phase (owner delegated "choose what fits")

- framer-motion for all animation; no GSAP/Lenis (native scroll is more robust for a11y and mobile).
- The wheel is drawn in React from engine JSON. Kerykeion SVG is kept for reference and future PDFs.
- Aspects, patterns, dignities and balance are our own tested pure functions. Library output is used for positions only.
- Orbs: 8/7/5° for major aspects (+2° for the Sun and Moon), 2–3° for minor ones, 5° majors only for ASC/MC. True node, mean Lilith.
- Languages: az (default) + en, as in the brief. Russian was not added.
- UI strings live in `apps/web/src/assets/lang`. Interpretations live in `packages/content`.
- City data: GeoNames `cities5000` (covers district centres in Azerbaijan).
- Prerender with `playwright-core` (new dev dependency) and metric-matched fallback fonts. Both were needed to meet LCP/CLS.

## Known gaps

1. **Interpretation texts are AI-written drafts** (az and en). They need review by an astrologer and a native Azerbaijani editor. Aspect texts are per aspect type, not per planet pair.
2. **Privacy policy is a placeholder draft.** It needs a lawyer and real contact details.
3. **Main-thread work:** TBT is about 1 s on emulated mid-range mobile (React + antd + framer-motion boot). Next step: trim the landing bundle (antd is only needed for one button there) and defer non-critical work.
4. **60 fps for the 3D journey is not verified on a real phone.** It was only checked in headless Edge with software rendering.
5. **Hosting:** unknown paths must return HTTP 404 with `spa.html` (nginx example in the README). `vite preview` cannot show this.
6. **Placeholders before launch:** `astra.example` domain (robots, sitemap, llms.txt, `VITE_SITE_URL`) and the source repository URL (`VITE_SOURCE_URL`, `ASTRA_SOURCE_URL`).
7. **Places:** only towns over ~5000 people (plus admin seats). Coordinates cannot be entered by hand yet.
8. **Time unknown:** the Moon range is shown as text. The wheel shows the noon Moon.
9. **No rate limiting on the API** (needed before public launch).
10. **Browser checks are not in CI.** They were scripted ad hoc. A committed Playwright smoke test is suggested.
11. Kerykeion installs `libephemeris` as a hard dependency. It is unused at runtime and the swisseph backend is enforced at import.
12. **Not committed:** the repository is initialised (`git init`) but nothing is committed. The owner decides when.

## Waiting for approval

Please review the running app and this report. On approval, Phase 2 (Destiny Matrix) starts with the SoulMatrix
license check described in `docs/roadmap.md`.
