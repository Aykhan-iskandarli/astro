# Architecture

## Data flow

```
Browser (apps/web)                         API (apps/api, Docker)                 Engine (packages/engine)
───────────────────                        ──────────────────────                 ────────────────────────
Birth form ── GET /api/places?q=… ───────▶ PlaceIndex (GeoNames, in memory)
           ◀── [{name, lat, lng, tz}] ────
           ── POST /api/charts/natal ─────▶ validate (pydantic) ─────────────────▶ BirthData
                                                                                  resolve_utc (zoneinfo, DST)
                                                                                  kerykeion (swisseph backend)
                                                                                  aspects / patterns / dignities /
                                                                                  balance / lunar phase (own code)
           ◀── chart JSON ────────────────  (nothing stored, no access log) ◀──── calculate() -> dict
NatalChartModel → wheel (SVG) + tables + interpretation (packages/content)
```

## Engine (`packages/engine`)

Every module has the same interface: `calculate(birth_data, **options) -> dict` — pure, deterministic and
JSON-serialisable. Modules are registered in `astra_engine.MODULES` by id (`western.natal` in Phase 1).

| File | Responsibility |
|---|---|
| `_backend.py` | Forces kerykeion onto the **swisseph** backend with the bundled `.se1` files and fails at import if it is not active. Kerykeion 6 defaults to libephemeris, whose Chiron is a Keplerian approximation (2.3′ error measured in the spike). |
| `common/birth.py` | `BirthData` validation (1800–2999, coordinates, IANA zone) and `resolve_utc`: local time → UTC with historical DST. Ambiguous times take the first occurrence; non-existent times shift forward. Both are flagged in `dstNote`. |
| `common/zodiac.py` | Signs, elements, modalities, polarity; truncating degree/minute split (never rounds into the next sign); `house_of`. |
| `western/natal.py` | Orchestration. Kerykeion is called with the resolved **UTC** time, so time-zone logic lives in one tested place. Detects the silent Placidus/Koch → Porphyry fallback above the polar circles and reports it. |
| `western/aspects.py` | 9 aspects, orbs (luminaries +2°, angles major-only at 5°), applying/separating. |
| `western/patterns.py` | Grand trine, T-square, grand cross, yod, kite, mystic rectangle, stellium (sign and house). Ten planets only. |
| `western/dignities.py` | Domicile, exaltation, detriment, fall (traditional + modern rulers; exaltations for the seven classical planets only). |
| `western/balance.py`, `western/lunar.py` | Element/modality/polarity counts over ten planets; eight-phase lunar cycle. |

| `western/cycles.py` | Jupiter, Saturn and Chiron returns over 100 years (all exact passes: 1, 3 or 5 with retrograde loops; adaptive scan bounded by each body's maximum speed, bisection to under a second) and whole-sign annual profections with the traditional lord of the year. |
| `sky/moon.py` | Moon calendar for a city: lunar days (day 1 at the exact New Moon, then each moonrise at the place), Moon sign changes, calendar phase (centred on the exact lunations) and void-of-course periods (last exact Ptolemaic aspect to Sun–Pluto until the next sign). Positions are sampled once on a 2-hour grid and refined by bisection. |
| `vedic/chart.py` → `sadeSati` | Sidereal (Lahiri) Saturn over the sign before, of and after the natal Moon, for 100 years; each phase from first entry to last exit, periods merged across short retrograde exits. |
| `western/details.py`, `western/timing.py` | Declinations (out of bounds vs true obliquity), antiscia (1.5°), prenatal eclipses (Swiss Ephemeris backward search); receptions, dominants, firdaria and zodiacal releasing via kerykeion; solar arc = progressed Sun − natal Sun, aspects within 1°. |
| `vedic/match.py` | Ashtakoota (36 points) and Manglik; conventions in the module docstring. |
| `other/systems.py`, `sky/day.py` | Tarot birth cards (Greer), Tzolkin (GMT 584283), Kua (Eight Mansions); Panchang at sunrise (Lahiri) and planetary hours (kerykeion). |

Conventions: tropical zodiac, true node, mean Lilith, sect-aware Part of Fortune and Part of Spirit.
`extraPoints` (Ceres, Pallas, Juno, Vesta, Vertex, Part of Spirit) are returned separately: they are not drawn on the
wheel and take no part in aspects, patterns or balance.
Time unknown → noon chart, no houses/angles/Part of Fortune, plus the Moon's range over the day.

**Tests:** golden tests compare every point, ASC/MC/DC/IC and all cusps in four house systems against raw
`pyswisseph` with the same ephemeris files, for four births: Baku 1990 (historical +05), London 2000,
Sydney 1985 (southern DST) and a New York night birth (night Part of Fortune formula). Pure functions have
their own unit tests.

## API (`apps/api`)

Thin FastAPI layer. Stateless: no database, no request logging (`--no-access-log`; query strings could
contain personal data). The GeoNames index (`cities5000`, ~70k places, all alternate names) is built at
image build time and searched by normalised prefix (handles ə/ǝ, ı, diacritics, Cyrillic), ranked by
exact-with-diacritics → exact → prefix, then population.

## Content (`packages/content`)

`az.json` / `en.json` with identical keys (checked by `npm test`). A placement interpretation is composed
from three **standalone sentences** — point, sign, house — so no grammatical inflection is needed in
Azerbaijani, and 19 + 12 + 12 texts cover every placement. Specific overrides (e.g. `sun.aries`) can be
added later without changing callers. All texts are marked as AI-written drafts that need editorial review.

UI strings (buttons, labels) live in the web app's `assets/lang/` (project standard); interpretation
content lives here.

## Web app (`apps/web`)

Follows the team's frontend standard (folder structure, `.d.ts` interfaces, JSS `useXxxStyles`, `useCallback`
handlers, model classes with `_setX` setters and `??` defaults, `Routes` enum, `useLocalization`).

Phase-1 specific decisions:

| Topic | Decision |
|---|---|
| Layout | Only `layout='open'` (no accounts yet). Auth/payment axios instances are not created until the paid layer exists. |
| HTTP | One `axiosPublic` instance; errors are toasted in the interceptor and re-thrown. |
| Store | `birthInput` is **not** persisted. `savedCharts` (opt-in) and `locale` are persisted through a small `localStorage` adapter that never throws. |
| Wheel | Drawn in React SVG from the engine JSON (kerykeion's SVG is kept for reference/PDF). Draw-in animation: rings → signs → houses → planets → aspects. Hover/focus lights up a point's aspects and dims the rest; keyboard: Tab + Enter. Glyph collision avoidance in `chart-wheel.geometry.ts` (unit-tested). |
| Animation | framer-motion everywhere (no GSAP/Lenis). `MotionConfig reducedMotion="user"`; under reduced motion the 3D scene and parallax are not rendered at all and the journey becomes a static list. |
| 3D | React Three Fiber scene code-split and loaded only near the journey section; render loop paused off-screen; procedural shaders (no textures); DPR capped at 1.75. |
| Fonts | Self-hosted (no Google requests). Playfair Display uses `font-display: block` + preload so the prerendered headline paints once in its final face (swap/optional caused a second, later LCP and CLS 0.12). |
| Performance | Build-time prerender of public routes (`scripts/prerender.mjs`); the route chunk is preloaded before React replaces the static HTML, so there is no loader flash (CLS 0). |
| Sound | Ambient drone synthesised with the Web Audio API — no audio file to license; off by default. |

### Colour contrast (WCAG AA ≥ 4.5:1)

Computed with the WCAG 2 relative-luminance formula; worst case is the raised surface `#1C1C38`.

| Token | Hex | on `#0B0B1E` (page) | on `#14142B` (card) | on `#1C1C38` (raised) |
|---|---|---|---|---|
| text | `#F1F0FA` | 17.2 | 16.0 | 14.6 |
| textMuted | `#A7A6C2` | 8.2 | 7.6 | 7.0 |
| textSubtle | `#8A89A8` | 5.8 | 5.3 | 4.9 |
| gold | `#E2C275` | 11.3 | 10.5 | 9.6 |
| violet | `#9D8CFF` | 7.1 | 6.6 | 6.0 |
| tense / error | `#F28B8B` / `#FF8A8A` | 8.2 / 8.6 | 7.6 / 7.9 | 6.9 / 7.3 |
| harmonious | `#7FD1E8` | 11.3 | 10.5 | 9.6 |

Primary button label `#0B0B1E` on gold `#E2C275`: 11.3:1.

Lighthouse accessibility score: 100 on `/` and `/natal-chart`.

## Paid-layer hooks (designed, not implemented)

- **Engine:** new modules register in `MODULES`; an `ai.interpretation` module can take a chart JSON as input.
- **API:** the chart response is self-contained JSON, so a PDF renderer (kerykeion SVG + content) or an AI
  service can consume it without recomputation.
- **Web:** `AuthProtectedComponent` already switches on `layout`; adding `'auth'` / `'public'` (token-gated)
  layouts and token-bearing axios instances follows the team standard without touching existing pages.
