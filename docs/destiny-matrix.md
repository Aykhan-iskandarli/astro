# Destiny Matrix — method and sources (Phase 2)

Module `destiny.matrix` (`packages/engine/astra_engine/destiny/matrix.py`). Pure arithmetic on the birth date;
time and place are not used.

## Sources

No third-party code was used. `AhmadHassan-BTed/SoulMatrix` has **no license** (no LICENSE file; GitHub
reports none, checked 2026-11-10), so per project rules its code was not looked at or copied. The method
was implemented from public descriptions:

- https://gadalkindom.ru/matritsa-sudby/metodika-raschyota.html — full formula set and a worked example
  (15 July 1990). **Every published number of that example is a golden test.**
- https://matrixdestiny.io/en/methodology — anchors and corners, cross-checked with its worked example
  (28 November 1987).

## Formulas (all results reduced to 1–22)

| Group | Points |
|---|---|
| Anchors | A = day, B = month, C = digit sum of the year, D = A+B+C, E (comfort zone) = A+B+C+D |
| Personal square | J,K,L,M = A,B,C,D + E · O = A+J · P = B+K · Q = C+L · N = D+M · S = J+E · T = K+E |
| Ancestral square | F = A+B · G = B+C · H = C+D · I = D+A · L2 = F+G+H+I · L1 = E+L2 · X2 = X+L2 · X1 = X+X2 |
| Love / money | R = M+L · R1 = R+M (love line M–R1–R) · R2 = R+L (money line L–R2–R) · finance programme C–Q–L |
| Karmic tail | M–N–D |
| Purposes | sky = B+D · earth = A+C · personal = sky+earth · male = F+H · female = G+I · social = male+female · spiritual = personal+social |
| Health map | Sahasrara A/B, Ajna O/P, Vishuddha J/K, Anahata S/T, Manipura E/E, Svadhisthana L/M, Muladhara C/D; emotion = physical+energy; column totals |
| Age timeline | Corners clockwise from A at 0: A, F(10), B(20), G(30), C(40), H(50), D(60), I(70). Per 10-year side X→Y: d = X+Y (+5), b = X+d (+2.5), a = X+b (+1.25), c = b+d (+3.75), f = d+Y (+7.5), e = d+f (+6.25), g = f+Y (+8.75) |

## Conventions where published variants differ

- **Reduction:** while n > 22, replace n by its digit sum (22 stays 22; there is no 0). The sources agree for every
  value in their examples.
- **Year:** digit sum of all four digits, then reduced (a "subtract 22" variant exists and is not used).
- **Health map columns:** classic Ladini — physical, energy, emotion = physical + energy. One source labels the
  sum as "energy" instead; the numbers are identical, only the column label differs.
- **Not implemented:** "planetary purpose" (no formula in the sources), arcana repeat/missing counts (the source's
  counting rule could not be reproduced from its own example).

## Content

`packages/content` → `destiny`: 22 arcana (name, keywords, light and shadow side), meanings of all 32 positions,
purposes, chakras and lines, in az and en. **AI-written drafts that need editorial review.**
