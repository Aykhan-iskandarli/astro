# Numerology — method (Phase 5)

Module `numerology.core` (`packages/engine/astra_engine/numerology/core.py`), Pythagorean system.

| Number | Calculation |
|---|---|
| Life path | day, month and the digit sum of the year are each reduced, then summed and reduced |
| Expression | all letters of the full birth name |
| Soul urge | vowels of the name |
| Personality | consonants of the name |
| Birthday | the day of birth |
| Maturity | life path + expression |
| Personal year | day + month + current year (each reduced, no master numbers) |
| Personal month | personal year + current month |

Reduction keeps the master numbers 11, 22, 33. Karmic debt (13, 14, 16, 19) is reported when one of these
compounds appears on the way to the final digit.

## Owner decisions / conventions

- **Letter table:** Pythagorean A=1 … I=9, J=1 …. Azerbaijani letters take the value of their base Latin letter:
  ə→e, ç→c, ğ→g, ı→i, ö→o, ş→s, ü→u (`LETTER_MAP`, one place to change). Proposed to the owner on 2026-11-10;
  no alternative was requested.
- **Vowels:** A E I O U and ə ı ö ü. **Y counts as a consonant** (simplified rule).
- Letters outside the table (e.g. Cyrillic) are ignored and reported to the user.
- Meanings in `packages/content` → `numerology` are AI-written drafts.
