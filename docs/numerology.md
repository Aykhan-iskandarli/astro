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

**Pythagoras square (psychomatrix, A. Aleksandrov):** work numbers from DD.MM.YYYY — 1st = sum of all date digits,
2nd = digit sum of the 1st, 3rd = 1st − 2 × first non-zero digit of the day (births before 2000) or 1st + 19 (births
from 2000, the common modern variant), 4th = digit sum of the 3rd. All digits of the date and the work numbers are
counted (zeros ignored) into cells 1–9; columns 1-2-3 / 4-5-6 / 7-8-9, rows 1-4-7 / 2-5-8 / 3-6-9 and diagonals 1-5-9 /
3-5-7 are summed as lines. Texts use five levels per cell (0, 1, 2, 3, 4+) and three per line (≤2, 3–5, ≥6).

**Name analysis** (`POST /api/numerology/name`, page `/name-analysis`; birth date optional):
cornerstone (first letter), capstone (last letter of the first name), first vowel, inclusion table (count of each
number 1–9), karmic lessons (numbers missing from the name), hidden passion (most frequent number, ties listed),
subconscious self (9 − number of karmic lessons), balance number (initials), planes of expression (Decoz letter
groups: physical E W D M; mental A H J N P G L; emotional I O R Z B S T X; intuitive K F Q U Y C V) and the Chaldean
total for comparison (A I J Q Y=1, B K R=2, C G L S=3, D M T=4, E H N X=5, U V W=6, O Z=7, F P=8; no 9).

## Owner decisions / conventions

- **Letter table:** Pythagorean A=1 … I=9, J=1 …. Azerbaijani letters take the value of their base Latin letter:
  ə→e, ç→c, ğ→g, ı→i, ö→o, ş→s, ü→u (`LETTER_MAP`, one place to change). Proposed to the owner on 2026-11-10;
  no alternative was requested.
- **Vowels:** A E I O U and ə ı ö ü. **Y counts as a consonant** (simplified rule).
- Letters outside the table (e.g. Cyrillic) are ignored and reported to the user.
- Meanings in `packages/content` → `numerology` are AI-written drafts.
