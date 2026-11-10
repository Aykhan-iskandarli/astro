# Roadmap

Each phase ends with a short report (built / tested / known gaps) and waits for owner approval.

| Phase | Scope | Engine module(s) | Prerequisites |
|---|---|---|---|
| 0 ✅ | Library spike | — | `docs/spike-report.md` |
| 1 ✅ | Western natal chart + landing journey | `western.natal` | `docs/phase-1-report.md` |
| 2 ✅ | Destiny Matrix: 22 arcana from the birth date, octagram diagram, meanings | `destiny.matrix` | SoulMatrix has no license → implemented independently; see `docs/destiny-matrix.md` |
| 3 ✅ | Transits (any date/time) and synastry | `western.transits`, `western.synastry` | Bi-wheel; transit orbs 3°/2°/1.5°, synastry orbs 7°/6°/4°/2°; compatibility score = Ciro Discepolo method (kerykeion RelationshipScoreFactory), Ascendant rules dropped when a birth time is missing |
| 4 ✅ (awaiting approval) | Vedic (sidereal, Lahiri): rashi D1 + navamsa D9 (South Indian layout), nakshatras with pada and lord, classical dignities, Vimshottari maha/antardasha | `vedic.chart` | Swiss Ephemeris sidereal mode; Rahu = mean node; whole-sign houses; dasha year 365.25 days. aryaminus/astro (MIT) verified, not used |
| 5 | Numerology: life path, expression, soul urge, personal year | `numerology.core` | Letter tables for Azerbaijani (ə, ğ, ı, ö, ş, ü, ç) must be decided with the owner |
| 6 | BaZi (four pillars), Zi Wei Dou Shu | `chinese.bazi`, `chinese.ziwei` | Verify iztro license; stellium has BaZi (AGPL) |
| 7 | Solar/lunar returns, secondary progressions, composite | `western.returns`, `western.progressions`, `western.composite` | kerykeion factories exist |

Future paid layer (hooks only, see `docs/architecture.md`): AI interpretations, PDF reports, transit
notifications. No payments are implemented.

Cross-cutting backlog from Phase 1: see "Known gaps" in `docs/phase-1-report.md`.
