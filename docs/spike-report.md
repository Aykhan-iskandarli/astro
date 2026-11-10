# Step 0 — Library spike report

Date: 2026-11-10 · Status: **approved by the owner (2026-11-10)** — kerykeion 6.0.5 + swisseph, Docker, 1800–2999

## TL;DR

**Recommendation: `kerykeion` 6.0.x with the Swiss Ephemeris backend (`KERYKEION_BACKEND=swisseph`)**,
pinned to an exact version. Keep raw `pyswisseph` as the golden reference in tests.
The web UI draws its own wheel from JSON. Kerykeion's SVG is used for reference renders and future PDF reports.

All three libraries resolved historical DST correctly, including Baku 1990 → 09:30 UTC.
On the Swiss Ephemeris backend, all of them match raw `pyswisseph` exactly.
The only failure: kerykeion's **default** `libephemeris` backend computes Chiron by Keplerian approximation.
For the Sydney birth it is 2.29′ off, which exceeds the 1′ tolerance.

## Setup

| Item | Value |
|---|---|
| Runtime | Docker, `python:3.12-slim` + `build-essential` (one image per library, isolated) |
| Why Docker | `pyswisseph` ships no Windows/3.12 wheels (needs a C compiler), and Windows Application Control blocks venv launchers on this machine. Linux containers also match the production target. |
| Versions | kerykeion 6.0.5 · libephemeris 3.2.2 · stellium 0.22.0 · pyswisseph 2.10.3.2 · tzdata 2026.6 |
| Ephemeris files | Swiss Ephemeris `.se1` files (sepl/semo 18+24: planets and Moon 1800–2999; seas 12/18/24: asteroids incl. Chiron 1200–2999), mounted read-only. The reference asserts `FLG_SWIEPH` was used, not the Moshier fallback. |
| Network | All calculation runs with `--network none` (fully offline) |
| Scripts | `spike/` → `births.py`, `ref.py`, `kery.py`, `stel.py`, `compare.py`. Raw output is in `spike/out/`. |

### Test births

| ID | Local time | Place | IANA tz | Resolved UTC | Expected |
|---|---|---|---|---|---|
| baku-1990 | 1990-06-15 14:30 | 40.4093 N, 49.8671 E | Asia/Baku (+05) | 09:30 | 09:30 ✅ |
| london-2000 | 2000-01-01 12:00 | 51.5074 N, 0.1278 W | Europe/London (GMT) | 12:00 | 12:00 ✅ |
| sydney-1985 | 1985-11-03 08:15 | 33.8688 S, 151.2093 E | Australia/Sydney (AEDT, +11, southern DST) | 1985-11-02 21:15 | ✅ |

## Accuracy vs raw `pyswisseph`

Compared: 10 planets, true and mean node, mean Lilith, Chiron, Part of Fortune, ASC, MC,
and the 12 cusps in Placidus, Koch, Whole Sign and Equal. Tolerance is < 1′.

| Library / backend | Max Δ, planets + nodes + Lilith | Chiron Δ | ASC / MC / all cusps Δ | Result |
|---|---|---|---|---|
| kerykeion / **swisseph** | 0″ | 0″ | 0″ | ✅ all 3 births |
| kerykeion / libephemeris (default) | 0.03″ (JPL DE440 vs SE, negligible) | 0.16′ / 0.83′ / **2.29′** | 0″ | ❌ Sydney (Chiron) |
| stellium | 0″ | 0″ | 0″ | ✅ all 3 births* |

\* Stellium does not calculate the mean node by default. The true node matches exactly.

Part of Fortune uses the sect-aware formula (day: ASC + Moon − Sun) and matched exactly in every case.
**Gap:** all three test births are daytime births, so the night formula was not exercised yet.
The Phase 1 golden tests will add a night birth.

Full table: `spike/out/compare.md`.

## Feature fit (spec modules → library)

| Need | kerykeion 6 | stellium 0.22 |
|---|---|---|
| Natal: planets, houses (P/K/W/A + more), angles, retrograde | ✅ | ✅ |
| Nodes, Lilith (mean/true), Chiron, Part of Fortune | ✅ all built-in | ✅ (PoF via `ArabicPartsCalculator`) |
| Aspects, orbs, element/modality distribution | ✅ | ✅ |
| Aspect patterns (grand trine, T-square…) | ❌ not found → we implement in `packages/engine` | ✅ `AspectPatternAnalyzer` |
| Dignities | ✅ | ✅ (+ accidental) |
| Transits, synastry, relationship score | ✅ | ✅ (`Comparison`) |
| Composite, returns, secondary progressions, solar arc | ✅ | ✅ returns, multi-wheel |
| Sidereal/Lahiri, nakshatras | ✅ | ✅ (`draw_vedic`) |
| BaZi | ❌ | ✅ (`bazi`) |
| Unknown birth time mode | manual | ✅ `time_unknown=True` |
| SVG output quality | **astro-seek level**: wheel, aspect lines, aspect grid, planet and cusp tables, element/quality summary, dark theme | Clean minimal wheel. The default render has **no aspect lines or grid**. |
| Python | ≥ 3.12 | ≥ 3.11 |
| Speed (per natal chart, 4 house systems) | ~12 ms (libephemeris) / ~20 ms (swisseph) | ~5 ms |

Renders (Baku 1990): `spike/out/kerykeion-swisseph.png`, `spike/out/stellium.png`.

## Maintenance and licenses (checked 2026-11-10)

| | kerykeion | stellium | libephemeris | pyswisseph |
|---|---|---|---|---|
| License (repo LICENSE file) | AGPL-3.0 ✅ | AGPL-3.0 (PyPI: or-later) ✅ | AGPL-3.0-only ✅ | AGPL-3.0 ✅ |
| GitHub | 730★, 198 forks, 6 open issues | 74★, 18 forks, 4 open issues | — | — |
| Last push / release | 2026-11-06 / 6.1.0b5 (2026-11-07) | 2026-10-13 / 0.22.0 (2026-07-14) | 4.0.0b4 (2026-11-06) | 2.10.3.2 (2023-06) |
| Releases in last 12 months | 140 | 30 | 60 | 0 |
| Maturity | "Production/Stable", large user base | "Beta", single maintainer | — | Stable, slow-moving C binding |

## Findings and risks

1. **Kerykeion's default backend changed.** v6 uses `libephemeris` (JPL DE440 via a sealed `.leb` file) and treats Swiss Ephemeris as opt-in.
   The `.leb` file has no Chiron, so Chiron falls back to a "not ephemeris-grade" approximation.
   → Force `KERYKEION_BACKEND=swisseph`, ship the `.se1` files, and add a startup assertion on `BACKEND_NAME`.
2. **Very fast release cadence.** 140 releases a year, v5 → v6 broke the API, and 6.1 is in beta.
   → Pin `kerykeion==6.0.5` exactly. Golden tests catch regressions on upgrade.
3. **`pyswisseph` needs a C compiler.** It has no Windows wheels and its last release was in 2023.
   → The API always runs in Docker. Local dev on Windows also goes through Docker.
4. **Cosmetic bug:** offline kerykeion prints "Location: Greenwich, GB" in its SVG unless `city`/`nation` are passed.
   We pass them. This does not matter for our own React wheel anyway.
5. **Lunar phase naming differs between libraries.** For Baku 1990 (elongation ≈ 260°), kerykeion says "Last Quarter" (±19° window) and stellium says "Waning Gibbous" (8 bins).
   → We define our own phase rule in the engine, from the Sun/Moon longitudes.
6. **Swiss Ephemeris AGPL obligations.** Because the service runs over a network, AGPL §13 applies: the running site must offer its source.
   → A footer link to the repo goes in Phase 1.
7. **Ephemeris coverage.** The shipped `.se1` files cover 1800–2999 for planets. Births outside that range must be rejected with a clear message.

## Recommendation

| Layer | Choice |
|---|---|
| Western calculation (Phases 1, 3, 7) | **kerykeion 6.0.5, swisseph backend** |
| Aspect patterns, lunar phase, sect | Our own pure functions in `packages/engine`, unit-tested |
| Golden reference in tests | raw `pyswisseph` with the same `.se1` files |
| Wheel in the web app | Our own React SVG drawn from engine JSON (needed for the animated draw-in and hover). Kerykeion SVG is used for reference and future PDF reports. |
| stellium | Not a dependency now. Re-evaluate for **Phase 6 (BaZi)**, where it already has an implementation (same AGPL license). |

Why not stellium as the primary library: accuracy is equal, but stellium has a much smaller community, Beta status and a single maintainer.
Kerykeion covers more of Phases 3, 4 and 7 out of the box and has the stronger reference SVG.
Stellium's advantages (speed, patterns, unknown-time mode) are small and easy to reproduce.

## Decisions needed from the owner

1. Approve **kerykeion 6.0.5 + swisseph backend** as the Western engine.
2. Approve **Docker** as the way to run `apps/api` (dev and prod).
3. Approve the supported date range **1800–2999**, or ask for wider `.se1` files (larger download).
