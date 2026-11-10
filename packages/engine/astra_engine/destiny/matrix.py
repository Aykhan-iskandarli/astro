"""Destiny Matrix (N. Ladini method): 22 arcana derived from the birth date. Pure arithmetic, no ephemeris.

Formulas follow the publicly described method (reference with a fully worked example, used as the golden
test: https://gadalkindom.ru/matritsa-sudby/metodika-raschyota.html; anchors cross-checked with
https://matrixdestiny.io/en/methodology). No third-party code was used (SoulMatrix has no license).

Conventions chosen where published variants differ (documented in docs/destiny-matrix.md):
- reduction: while n > 22, replace n by its digit sum (22 stays 22; there is no 0);
- year anchor: digit sum of the four-digit year, then reduced;
- health map: classic Ladini columns — physical, energy, emotion = physical + energy.
"""
from __future__ import annotations

from datetime import date as Date

MODULE_ID = "destiny.matrix"
MODULE_VERSION = "0.1.0"


def reduce22(n: int) -> int:
    if n <= 0:
        raise ValueError("arcana are 1..22")
    while n > 22:
        n = sum(int(d) for d in str(n))
    return n


def r(*values: int) -> int:
    return reduce22(sum(values))


def compute_points(d: Date) -> dict[str, int]:
    p: dict[str, int] = {}
    p["A"] = reduce22(d.day)                        # day — left
    p["B"] = d.month                                # month — top (1..12)
    p["C"] = reduce22(sum(int(x) for x in str(d.year)))  # year — right
    p["D"] = r(p["A"], p["B"], p["C"])              # bottom — karmic task
    p["E"] = r(p["A"], p["B"], p["C"], p["D"])      # centre — comfort zone

    # Personal square: points on the axes towards the centre
    p["J"], p["K"], p["L"], p["M"] = (r(p[x], p["E"]) for x in "ABCD")
    p["O"] = r(p["A"], p["J"])
    p["P"] = r(p["B"], p["K"])
    p["Q"] = r(p["C"], p["L"])
    p["N"] = r(p["D"], p["M"])
    p["S"] = r(p["J"], p["E"])
    p["T"] = r(p["K"], p["E"])

    # Ancestral square (corners) and its diagonals
    p["F"] = r(p["A"], p["B"])
    p["G"] = r(p["B"], p["C"])
    p["H"] = r(p["C"], p["D"])
    p["I"] = r(p["D"], p["A"])
    p["L2"] = r(p["F"], p["G"], p["H"], p["I"])     # generational centre
    p["L1"] = r(p["E"], p["L2"])
    for x in "FGHI":
        p[f"{x}2"] = r(p[x], p["L2"])
        p[f"{x}1"] = r(p[x], p[f"{x}2"])

    # Relationship / money node
    p["R"] = r(p["M"], p["L"])
    p["R1"] = r(p["R"], p["M"])
    p["R2"] = r(p["R"], p["L"])
    return p


# Chakra rows: (id, physical point, energy point)
CHAKRAS = [
    ("sahasrara", "A", "B"), ("ajna", "O", "P"), ("vishuddha", "J", "K"), ("anahata", "S", "T"),
    ("manipura", "E", "E"), ("svadhisthana", "L", "M"), ("muladhara", "C", "D"),
]

# Age ring: corners clockwise from the left (A = age 0), 10 years apart
AGE_CORNERS = ["A", "F", "B", "G", "C", "H", "D", "I"]


def age_timeline(p: dict[str, int]) -> list[dict]:
    """Eight 10-year sectors, each split into 1.25-year steps (published sub-point formulas)."""
    out = []
    for i, x_key in enumerate(AGE_CORNERS):
        y_key = AGE_CORNERS[(i + 1) % 8]
        x, y = p[x_key], p[y_key]
        dd = r(x, y)
        b = r(x, dd)
        a = r(x, b)
        c = r(b, dd)
        f = r(dd, y)
        e = r(dd, f)
        g = r(f, y)
        start = i * 10
        for step, value in enumerate([x, a, b, c, dd, e, f, g]):
            out.append({"age": start + step * 1.25, "arcana": value, "corner": x_key if step == 0 else None})
    return out


def calculate(birth, **_options) -> dict:
    """Common engine interface. Uses only the birth date (time and place are irrelevant here)."""
    p = compute_points(birth.date)
    sky = r(p["B"], p["D"])
    earth = r(p["A"], p["C"])
    personal = r(sky, earth)
    male = r(p["F"], p["H"])
    female = r(p["G"], p["I"])
    social = r(male, female)
    spiritual = r(personal, social)

    chakras = []
    for cid, phys_key, energy_key in CHAKRAS:
        phys, energy = p[phys_key], p[energy_key]
        chakras.append({"id": cid, "physical": phys, "energy": energy, "emotion": r(phys, energy)})
    totals = {k: r(*(c[k] for c in chakras)) for k in ("physical", "energy", "emotion")}

    return {
        "module": MODULE_ID,
        "meta": {"engineVersion": MODULE_VERSION, "method": "ladini-22",
                 "chakraColumns": "physical, energy, emotion = physical + energy"},
        "input": {"date": birth.date.isoformat(), "name": birth.name},
        "points": p,
        "purposes": {"sky": sky, "earth": earth, "personal": personal, "male": male, "female": female,
                     "social": social, "spiritual": spiritual},
        "health": {"chakras": chakras, "total": totals},
        "lines": {
            "love": [p["M"], p["R1"], p["R"]],
            "money": [p["L"], p["R2"], p["R"]],
            "financeProgram": [p["C"], p["Q"], p["L"]],
            "karmicTail": [p["M"], p["N"], p["D"]],
            "maleLine": [[p["F"], p["F1"], p["F2"]], [p["H2"], p["H1"], p["H"]]],
            "femaleLine": [[p["I"], p["I1"], p["I2"]], [p["G2"], p["G1"], p["G"]]],
        },
        "talents": {"personal": p["K"], "female": p["G2"], "male": p["F2"]},
        "ageTimeline": age_timeline(p),
    }
