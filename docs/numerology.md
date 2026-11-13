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

| Personal day | personal month + day of the current date (no master numbers) |
| Pinnacles | month+day, day+year, first+second, month+year (month, day, year each reduced to one digit first; master numbers kept in the result) |
| Challenges | |month−day|, |day−year|, |first−second|, |month−year| (0–8) |
| Pinnacle periods | first ends at 36 − single-digit life path (11→2, 22→4, 33→6); the next two last 9 years each; the fourth lasts for life |

**Compatibility** (`POST /api/numerology/compatibility`): life path always, expression and soul urge when both names are
given. Number families 1-5-7, 2-4-8, 3-6-9: same root number = "same", same family = "harmonious", otherwise
"different". Master numbers count as their root. This is a common convention, not a universal rule.

**Lo Shu grid:** the digits of the birth date (DD MM YYYY, zeros ignored) in the magic square 4-9-2 / 3-5-7 / 8-1-6.
Eight lines (three rows, three columns, two diagonals) are reported as complete (every digit present) or empty (none).
Only the date is used; some schools add the life path or other numbers.

## Owner decisions / conventions

- **Letter table:** Pythagorean A=1 … I=9, J=1 …. Azerbaijani letters take the value of their base Latin letter:
  ə→e, ç→c, ğ→g, ı→i, ö→o, ş→s, ü→u (`LETTER_MAP`, one place to change). Proposed to the owner on 2026-11-10;
  no alternative was requested.
- **Vowels:** A E I O U and ə ı ö ü. **Y counts as a consonant** (simplified rule).
- Letters outside the table (e.g. Cyrillic) are ignored and reported to the user.
- Meanings in `packages/content` → `numerology` are AI-written drafts.
