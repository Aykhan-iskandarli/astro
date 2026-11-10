# Roadmap

Each phase ends with a short report (built / tested / known gaps) and waits for owner approval.

| Phase | Scope | Engine module(s) | Prerequisites |
|---|---|---|---|
| 0 ✅ | Library spike | — | `docs/spike-report.md` |
| 1 ✅ | Western natal chart + landing journey | `western.natal` | `docs/phase-1-report.md` |
| 2 ✅ | Destiny Matrix: 22 arcana from the birth date, octagram diagram, meanings | `destiny.matrix` | SoulMatrix has no license → implemented independently; see `docs/destiny-matrix.md` |
| 3 ✅ | Transits (any date/time) and synastry | `western.transits`, `western.synastry` | Bi-wheel; transit orbs 3°/2°/1.5°, synastry orbs 7°/6°/4°/2°; compatibility score = Ciro Discepolo method (kerykeion RelationshipScoreFactory), Ascendant rules dropped when a birth time is missing |
| 4 ✅ | Vedic (sidereal, Lahiri): rashi D1 + navamsa D9 (South Indian layout), nakshatras with pada and lord, classical dignities, Vimshottari maha/antardasha | `vedic.chart` | Swiss Ephemeris sidereal mode; Rahu = mean node; whole-sign houses; dasha year 365.25 days. aryaminus/astro (MIT) verified, not used |
| 5 ✅ | Numerology: life path, expression, soul urge, personality, birthday, maturity, personal year/month, master numbers, karmic debt | `numerology.core` | Pythagorean; Azerbaijani letters map to base Latin letters; see `docs/numerology.md` |
| 6 ✅ | BaZi (four pillars, hidden stems, ten gods, five elements, luck pillars) and Zi Wei Dou Shu (12 palaces, 14 major stars, transformations, decades) | `chinese.bazi` (engine) + iztro in the web app | lunar_python (MIT) with solar terms at the UTC+8 instant and day/hour in local time; iztro (MIT) runs in the browser. py-iztro has no license — not used |
| 7 ✅ (awaiting approval) | Solar/lunar returns (with relocation), secondary progressions, composite chart | `western.returns`, `western.progressions`, `western.composite` | Return moment from kerykeion (Sun/Moon back within 1′, tested against pyswisseph); progressions: day-for-a-year with 365.2422-day years, angles by solar-arc MC (astro.com / Astro-Seek default, not kerykeion's daily houses); composite: midpoint method |

Future paid layer (hooks only, see `docs/architecture.md`): AI interpretations, PDF reports, transit
notifications. No payments are implemented.

Cross-cutting backlog from Phase 1: see "Known gaps" in `docs/phase-1-report.md`.
