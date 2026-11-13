"""Other systems from the birth date: Tarot birth cards, the Maya Tzolkin day and the Feng Shui Kua number.

- Tarot birth cards (Mary K. Greer's method): month + day + year as numbers, digit sums until the result is 22 or
  less, then keep reducing two-digit results; 22 is the Fool. Gives the constellation, e.g. 19 -> 10 -> 1.
- Tzolkin: the traditional 260-day count with the GMT correlation (JDN 584283 = 4 Ajaw). This is the Maya count,
  not the modern "Dreamspell" calendar, which follows different rules.
- Kua number (Eight Mansions): the Chinese solar year (changes at Lichun, ~4 February); add the LAST TWO digits of
  that year and reduce to one digit (r). Men: 10 - r before 2000, 9 - r from 2000; women: r + 5 before 2000, r + 6
  from 2000; reduced to one digit (0 counts as 9). A 5 becomes 2 for men and 8 for women.
  East group 1, 3, 4, 9; West group 2, 6, 7, 8.
"""
from __future__ import annotations

from datetime import date as Date

from .._backend import swe
from ..chinese import bazi
from ..numerology.core import digit_sum

MODULE_ID = "other.systems"
MODULE_VERSION = "0.1.0"
TZOLKIN_SIGNS = ["imix", "ik", "akbal", "kan", "chicchan", "cimi", "manik", "lamat", "muluc", "oc", "chuen", "eb",
                 "ben", "ix", "men", "cib", "caban", "etznab", "cauac", "ahau"]
GMT_CORRELATION = 584283
# Favourable directions per Kua: Sheng Qi (success), Tian Yi (health), Yan Nian (relationships), Fu Wei (growth)
KUA_DIRECTIONS = {
    1: ["SE", "E", "S", "N"], 2: ["NE", "W", "NW", "SW"], 3: ["S", "N", "SE", "E"], 4: ["N", "S", "E", "SE"],
    6: ["W", "NE", "SW", "NW"], 7: ["NW", "SW", "NE", "W"], 8: ["SW", "NW", "W", "NE"], 9: ["E", "SE", "N", "S"],
}


def tarot_cards(d: Date) -> list[int]:
    n = d.month + d.day + d.year
    while n > 22:
        n = digit_sum(n)
    cards = [n]
    while cards[-1] > 9:
        cards.append(digit_sum(cards[-1]))
    return cards


def tzolkin(d: Date) -> dict:
    jdn = int(swe.julday(d.year, d.month, d.day, 12.0) + 0.5)
    days = jdn - GMT_CORRELATION
    tone = (days + 3) % 13 + 1
    sign = (days + 19) % 20
    kin = next(k for k in range(1, 261) if (k - 1) % 13 + 1 == tone and (k - 1) % 20 == sign)
    return {"tone": tone, "sign": TZOLKIN_SIGNS[sign], "signNumber": sign + 1, "kin": kin}


def chinese_year(d: Date) -> int:
    """The Chinese solar year (changes at Lichun)."""
    branch = bazi.BRANCHES.index(bazi.year_branch(d)["id"])
    return d.year if branch == (d.year - 4) % 12 else d.year - 1


def kua(d: Date, gender: str) -> dict:
    year = chinese_year(d)
    r = digit_sum(year % 100)
    while r > 9:
        r = digit_sum(r)
    if gender == "male":
        n = (10 - r) if year < 2000 else (9 - r)
    else:
        n = (r + 5) if year < 2000 else (r + 6)
    while n > 9:
        n = digit_sum(n)
    if n == 0:
        n = 9
    if n == 5:
        n = 2 if gender == "male" else 8
    return {"number": n, "group": "east" if n in (1, 3, 4, 9) else "west", "chineseYear": year,
            "directions": dict(zip(["shengQi", "tianYi", "yanNian", "fuWei"], KUA_DIRECTIONS[n]))}


def calculate(d: Date, gender: str = "male") -> dict:
    return {
        "module": MODULE_ID,
        "meta": {"engineVersion": MODULE_VERSION, "tarot": "Greer", "tzolkin": "GMT 584283", "kua": "Eight Mansions"},
        "input": {"date": d.isoformat(), "gender": gender},
        "tarot": tarot_cards(d),
        "tzolkin": tzolkin(d),
        "kua": kua(d, gender),
    }


__all__ = ["calculate", "tarot_cards", "tzolkin", "kua", "MODULE_ID"]
