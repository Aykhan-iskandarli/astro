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
MODULE_VERSION = "0.1.0"

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
        "letters": names["letters"],
        "ignored": names["ignored"],
    }
