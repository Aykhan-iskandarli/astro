# Third-party licenses

Astra is licensed under **AGPL-3.0-only** (see `LICENSE`). Every third-party component below was checked
against its own LICENSE file (installed package or upstream repository) on **2026-11-10** before use.
All are compatible with AGPL-3.0. No third-party source code has been copied into this repository; all
components are used as dependencies or data files.

## Calculation engine (Python, `packages/engine`, `apps/api`)

| Component | Version | License | Verified from | Use |
|---|---|---|---|---|
| [kerykeion](https://github.com/g-battaglia/kerykeion) | 6.0.5 | AGPL-3.0 | `kerykeion-6.0.5.dist-info/licenses/LICENSE` + GitHub repo | Planet positions, house cusps (swisseph backend) |
| [pyswisseph](https://github.com/astrorigin/pyswisseph) | 2.10.3.2 | AGPL-3.0 | `pyswisseph-2.10.3.2.dist-info/licenses/LICENSE.txt` | Swiss Ephemeris bindings; also the golden-test reference |
| Swiss Ephemeris (C library, inside pyswisseph) | 2.10.03 | AGPL-3.0 (dual-licensed by Astrodienst AG: AGPL or Swiss Ephemeris Professional License) | pyswisseph LICENSE | Ephemeris calculations |
| Swiss Ephemeris data files `sepl_18/24`, `semo_18/24`, `seas_18/24` (`packages/engine/astra_engine/ephe/`) | — | Same dual license as Swiss Ephemeris (Astrodienst AG) | shipped with stellium 0.22.0 (AGPL-3.0) / Astrodienst | Planet, Moon and asteroid (Chiron, Ceres, Pallas, Juno, Vesta) ephemerides, 1800–2999 |
| Swiss Ephemeris `sefstars.txt` (`packages/engine/astra_engine/ephe/`) | — | Same dual license as Swiss Ephemeris (Astrodienst AG) | github.com/aloistr/swisseph `ephe/sefstars.txt` (downloaded 2026-11-13) | Fixed-star catalogue (S. Moshier, V. Abramov, D. Koch); used for fixed-star conjunctions |
| Swiss Ephemeris `seorbel.txt` (`packages/engine/astra_engine/ephe/`) | — | Same dual license as Swiss Ephemeris (Astrodienst AG) | github.com/aloistr/swisseph `ephe/seorbel.txt` (downloaded 2026-11-13) | Orbital elements of fictitious bodies; used for Selena (White Moon) |
| [libephemeris](https://github.com/g-battaglia/libephemeris) | 3.2.2 | AGPL-3.0-only | `libephemeris-3.2.2.dist-info/licenses/LICENSE` | Installed as a hard dependency of kerykeion; **not used at runtime** (we force the swisseph backend) |
| [FastAPI](https://github.com/fastapi/fastapi) | 0.162.2 | MIT | dist-info `LICENSE` | HTTP API |
| [Starlette](https://github.com/encode/starlette) | 1.10.0 | BSD-3-Clause | dist-info `LICENSE.md` | FastAPI dependency |
| [Uvicorn](https://github.com/encode/uvicorn) | 0.54.0 | BSD-3-Clause | dist-info `LICENSE.md` | ASGI server |
| [Pydantic](https://github.com/pydantic/pydantic) | 2.14.3 | MIT | dist-info `LICENSE` | Validation |
| [tzdata](https://github.com/python/tzdata) | 2026.6 | Apache-2.0 | dist-info `LICENSE` | IANA time zone database (historical DST) |
| [lunar_python](https://github.com/6tail/lunar-python) | 1.4.9 | MIT | GitHub repo LICENSE (checked 2026-11-10) | Chinese calendar, solar terms, BaZi pillars and luck pillars |
| [pytest](https://github.com/pytest-dev/pytest), [httpx](https://github.com/encode/httpx) | — | MIT / BSD-3-Clause | dist-info | Tests only |

## Data

| Data | License | Verified from | Use |
|---|---|---|---|
| [GeoNames](https://www.geonames.org/) `cities5000`, `admin1CodesASCII`, `countryInfo` | **CC BY 4.0** — attribution required | `https://download.geonames.org/export/dump/readme.txt` (lines 6–7) | Offline place search → lat/lng + IANA time zone. Downloaded at Docker build time; attribution is shown in the site footer. |
| [Natural Earth](https://www.naturalearthdata.com/) 1:110m land outline | **Public domain** (no attribution required; credited on the map anyway) | naturalearthdata.com terms of use | Simplified to one SVG path in `apps/web/src/assets/data/world-land.ts` for the astrocartography map; bundled, so the map makes no external requests. |

## Web app (`apps/web`) — runtime

| Package | Version | License | LICENSE file |
|---|---|---|---|
| react, react-dom | 19.3.1 | MIT | ✓ |
| react-router-dom | 7.18.5 | MIT | ✓ |
| antd | 6.7.0 | MIT | ✓ |
| @reduxjs/toolkit | 2.14.0 | MIT | ✓ |
| react-redux | 9.3.1 | MIT | ✓ |
| redux-persist | 6.0.0 | MIT | ✓ |
| @tanstack/react-query | 5.107.1 | MIT | ✓ |
| axios | 1.21.1 | MIT | ✓ |
| react-jss | 10.10.0 | MIT | ✓ |
| framer-motion | 14.12.0 | MIT | ✓ |
| react-toastify | 11.2.0 | MIT | ✓ |
| classnames | 2.5.1 | MIT | ✓ |
| dayjs | 1.11.23 | MIT | ✓ |
| reflect-metadata | 0.2.2 | Apache-2.0 | ✓ |
| three | 0.187.0 | MIT | ✓ |
| [iztro](https://github.com/SylarLong/iztro) | 2.6.5 | MIT | ✓ (package LICENSE + GitHub) | Zi Wei Dou Shu astrolabe, computed in the browser |
| @react-three/fiber | 9.8.2 | MIT | not in the npm package — verified in the [upstream repo LICENSE](https://github.com/pmndrs/react-three-fiber/blob/master/LICENSE) |
| @react-three/drei | 10.7.9 | MIT | ✓ |
| @fontsource/playfair-display (Playfair Display font) | 5.3.0 | SIL OFL-1.1 | ✓ |
| @fontsource-variable/inter (Inter font) | 5.3.0 | SIL OFL-1.1 | ✓ |
| @fontsource/noto-sans-symbols (Noto Sans Symbols font) | 5.3.0 | SIL OFL-1.1 | ✓ |

## Web app — development only

| Package | Version | License |
|---|---|---|
| vite | 8.3.7 | MIT |
| @vitejs/plugin-react | 6.3.0 | MIT |
| vitest | 5.1.0 | MIT |
| typescript | 5.9.3 | Apache-2.0 |
| playwright-core (build-time prerender) | 1.56.1 | Apache-2.0 |
| @tanstack/react-query-devtools | 5.107.1 | MIT |
| @types/* | — | MIT |

## Evaluated, not used (yet)

| Component | License | Status |
|---|---|---|
| [stellium](https://github.com/katelouie/stellium) 0.22.0 | AGPL-3.0 (repo LICENSE) | Spike comparison only (`spike/`). Candidate for Phase 6 (BaZi). |
| [PyJHora](https://github.com/naturalstupid/PyJHora) | AGPL-3.0 (LICENSE verified 2026-11-13) | Not a dependency: four Ashtakoota score tables (Vashya, Yoni, Gana, Graha Maitri) were taken from its `compatibility.py` (originally saravali.de) into `vedic/match.py`, with attribution. |
| [aryaminus/astro](https://github.com/aryaminus/astro) | MIT (LICENSE file verified 2026-11-10; GitHub reports NOASSERTION) | Not used: the Vedic module is computed directly with the Swiss Ephemeris. |
| [AhmadHassan-BTed/SoulMatrix](https://github.com/AhmadHassan-BTed/SoulMatrix) | **none** (no LICENSE file, GitHub reports none — checked 2026-11-10) | Not used. The Destiny Matrix was implemented independently from public method descriptions (`docs/destiny-matrix.md`). |
| [SylarLong/iztro](https://github.com/SylarLong/iztro) | MIT (verified 2026-11-10) | **Used** (see web runtime table). The Python port `x-haose/py-iztro` has **no license** and is not used. |

## Obligations

- **AGPL-3.0 §13**: users interacting with Astra over a network must be offered the corresponding source.
  The site footer links to the repository (`VITE_SOURCE_URL` / `ASTRA_SOURCE_URL`).
- **CC BY 4.0 (GeoNames)**: attribution in the footer ("City data: GeoNames (CC BY 4.0)").
- **SIL OFL-1.1 fonts**: the fonts are redistributed unmodified with their license files (inside the npm packages).
