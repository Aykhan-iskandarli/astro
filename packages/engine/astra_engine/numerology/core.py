"""Pythagorean numerology: life path, expression, soul urge, personality, birthday, maturity, personal year
and month, master numbers (11, 22, 33) and karmic debt (13, 14, 16, 19).

Conventions (documented in docs/numerology.md):
- letters A–Z take the Pythagorean values 1–9 (A=1 … I=9, J=1 …);
- Azerbaijani/Turkish letters take the value of their base Latin letter: ə→e, ç→c, ğ→g, ı→i, ö→o, ş→s, ü→u
  (LETTER_MAP — a single place to change if the owner prefers another table);
- vowels are A E I O U (and ə ı ö ü); Y is treated as a consonant;
- life path: day, month and year are reduced separately, then summed and reduced;
- letters outside the table (e.g. Cyrillic) are ignored and reported.
"""
from __future__ import annotations

import unicodedata
from datetime import date as Date

MODULE_ID = "numerology.core"
MODULE_VERSION = "0.2.0"

MASTER = {11, 22, 33}
KARMIC_DEBT = {13, 14, 16, 19}
VALUES = {ch: (i % 9) + 1 for i, ch in enumerate("abcdefghijklmnopqrstuvwxyz")}
LETTER_MAP = {"ə": "e", "ç": "c", "ğ": "g", "ı": "i", "ö": "o", "ş": "s", "ü": "u", "i̇": "i"}
VOWELS = set("aeiou")


def digit_sum(n: int) -> int:
    return sum(int(d) for d in str(n))


def reduce_number(n: int, keep_master: bool = True) -> tuple[int, int | None]:
    """Reduce to a single digit (keeping 11/22/33). Returns (value, karmic_debt) where karmic_debt is the
    13/14/16/19 compound met on the way, if any."""
    debt = n if n in KARMIC_DEBT else None
    while n > 9 and not (keep_master and n in MASTER):
        n = digit_sum(n)
        if n in KARMIC_DEBT and debt is None:
            debt = n
    return n, debt


def normalise_letters(name: str) -> tuple[list[tuple[str, str]], list[str]]:
    """Return [(original letter, base latin letter)] and the list of ignored characters."""
    out, ignored = [], []
    for ch in name.lower():
        if ch.isspace() or ch in "-'’.":
            continue
        base = LETTER_MAP.get(ch)
        if base is None:
            decomposed = unicodedata.normalize("NFKD", ch)
            base = "".join(c for c in decomposed if not unicodedata.combining(c))
        if len(base) == 1 and base in VALUES:
            out.append((ch, base))
        else:
            ignored.append(ch)
    return out, ignored


def _number(total: int) -> dict:
    value, debt = reduce_number(total)
    return {"value": value, "compound": total, "master": value in MASTER, "karmicDebt": debt}


def name_numbers(full_name: str) -> dict:
    letters, ignored = normalise_letters(full_name)
    breakdown = [{"letter": orig, "base": base, "value": VALUES[base], "vowel": base in VOWELS}
                 for orig, base in letters]
    total = sum(x["value"] for x in breakdown)
    vowels = sum(x["value"] for x in breakdown if x["vowel"])
    consonants = total - vowels
    return {
        "expression": _number(total) if breakdown else None,
        "soulUrge": _number(vowels) if vowels else None,
        "personality": _number(consonants) if consonants else None,
        "letters": breakdown,
        "ignored": sorted(set(ignored)),
    }


def life_path(d: Date) -> dict:
    day, _ = reduce_number(d.day)
    month, _ = reduce_number(d.month)
    year, _ = reduce_number(digit_sum(d.year))
    return {**_number(day + month + year), "parts": {"day": day, "month": month, "year": year}}


def personal_year(d: Date, year: int) -> dict:
    day, _ = reduce_number(d.day, keep_master=False)
    month, _ = reduce_number(d.month, keep_master=False)
    y, _ = reduce_number(digit_sum(year), keep_master=False)
    value, _ = reduce_number(day + month + y, keep_master=False)
    return {"value": value, "year": year}


def _single(n: int) -> int:
    return reduce_number(n, keep_master=False)[0]


def pinnacles(d: Date, life_path_value: int, today: Date) -> list[dict]:
    """Four pinnacles and challenges (Decoz method).

    Month, day and year are each reduced to one digit. Pinnacles: month+day, day+year, the sum of the first two,
    month+year (master numbers kept). Challenges: |month-day|, |day-year|, |first-second|, |month-year| (0-8).
    The first pinnacle ends at age 36 minus the single-digit life path; the next two last 9 years each.
    """
    m, dd, y = _single(d.month), _single(d.day), _single(digit_sum(d.year))
    p1, p2 = reduce_number(m + dd)[0], reduce_number(dd + y)[0]
    p3 = reduce_number(_single(p1) + _single(p2))[0]
    p4 = reduce_number(m + y)[0]
    c1, c2 = abs(m - dd), abs(dd - y)
    c3, c4 = abs(c1 - c2), abs(m - y)
    first_end = 36 - _single(life_path_value)
    bounds = [(0, first_end), (first_end + 1, first_end + 9), (first_end + 10, first_end + 18), (first_end + 19, None)]
    age = today.year - d.year - ((today.month, today.day) < (d.month, d.day))
    return [{
        "index": i + 1, "value": p, "master": p in MASTER, "challenge": c,
        "fromAge": a, "toAge": b, "fromYear": d.year + a, "toYear": d.year + b if b is not None else None,
        "current": a <= age and (b is None or age <= b),
    } for i, (p, c, (a, b)) in enumerate(zip((p1, p2, p3, p4), (c1, c2, c3, c4), bounds))]


def calculate(birth, full_name: str | None = None, today: Date | None = None, **_options) -> dict:
    today = today or Date.today()
    d = birth.date
    lp = life_path(d)
    names = name_numbers(full_name or birth.name or "")
    maturity = None
    if names["expression"]:
        maturity = _number(lp["value"] + names["expression"]["value"])
    py = personal_year(d, today.year)
    pm, _ = reduce_number(py["value"] + today.month, keep_master=False)
    bday = _number(d.day)
    pd = _single(pm + _single(today.day))
    return {
        "module": MODULE_ID,
        "meta": {"engineVersion": MODULE_VERSION, "system": "pythagorean", "yVowel": False,
                 "letterMap": LETTER_MAP},
        "input": {"date": d.isoformat(), "name": full_name or birth.name, "today": today.isoformat()},
        "lifePath": lp,
        "birthday": bday,
        "expression": names["expression"],
        "soulUrge": names["soulUrge"],
        "personality": names["personality"],
        "maturity": maturity,
        "personalYear": py,
        "personalMonth": {"value": pm, "month": today.month, "year": today.year},
        "personalDay": {"value": pd, "date": today.isoformat()},
        "pinnacles": pinnacles(d, lp["value"], today),
        "loShu": lo_shu(d),
        "letters": names["letters"],
        "ignored": names["ignored"],
    }


# Number "families" (a common convention): numbers in the same family share a temperament and get on easily.
# Master numbers count as their root (11 -> 2, 22 -> 4, 33 -> 6).
FAMILIES = ({1, 5, 7}, {2, 4, 8}, {3, 6, 9})


def relation(a: int, b: int) -> str:
    """same | harmonious (same family) | different"""
    ra, rb = _single(a), _single(b)
    if ra == rb:
        return "same"
    return "harmonious" if any(ra in f and rb in f for f in FAMILIES) else "different"


def compatibility(first: tuple[Date, str | None], second: tuple[Date, str | None]) -> dict:
    """Compare life path (always) and expression / soul urge (when both names are given)."""
    people = []
    for d, name in (first, second):
        names = name_numbers(name or "")
        people.append({"date": d.isoformat(), "name": name or None, "lifePath": life_path(d),
                       "expression": names["expression"], "soulUrge": names["soulUrge"],
                       "ignored": names["ignored"]})
    pairs = []
    for kind in ("lifePath", "expression", "soulUrge"):
        a, b = people[0][kind], people[1][kind]
        if a and b:
            pairs.append({"kind": kind, "first": a["value"], "second": b["value"],
                          "relation": relation(a["value"], b["value"])})
    return {
        "module": "numerology.compatibility",
        "meta": {"engineVersion": MODULE_VERSION, "system": "pythagorean", "families": [sorted(f) for f in FAMILIES]},
        "people": people,
        "pairs": pairs,
    }


# Lo Shu grid: the digits of the birth date (DD MM YYYY, zeros ignored) placed in the magic square
# 4 9 2 / 3 5 7 / 8 1 6. Lines (planes) are complete when every number on them appears, empty when none does.
LO_SHU = [[4, 9, 2], [3, 5, 7], [8, 1, 6]]
LO_SHU_LINES = {
    "mental": (4, 9, 2), "emotional": (3, 5, 7), "practical": (8, 1, 6),
    "thought": (4, 3, 8), "will": (9, 5, 1), "action": (2, 7, 6),
    "determination": (4, 5, 6), "spiritual": (2, 5, 8),
}


def lo_shu(d: Date) -> dict:
    digits = [int(c) for c in f"{d.day:02d}{d.month:02d}{d.year:04d}" if c != "0"]
    counts = {str(n): digits.count(n) for n in range(1, 10)}
    return {
        "grid": LO_SHU,
        "counts": counts,
        "missing": [n for n in range(1, 10) if counts[str(n)] == 0],
        "lines": [{"id": lid, "numbers": list(nums),
                   "complete": all(counts[str(n)] for n in nums),
                   "empty": not any(counts[str(n)] for n in nums)} for lid, nums in LO_SHU_LINES.items()],
    }
