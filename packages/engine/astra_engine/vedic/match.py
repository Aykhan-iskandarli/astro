"""Vedic marriage matching: Ashtakoota (Guna Milan, 36 points) and Manglik (Kuja) dosha.

Both partners' Moon (sidereal, Lahiri) gives the nakshatra and rashi. Conventions (schools differ, see
docs/architecture.md):
- Varna (1): rashi element — water Brahmin, fire Kshatriya, earth Vaishya, air Shudra; 1 point when the groom's varna
  is equal to or higher than the bride's.
- Vashya (2): Chatushpada / Manava / Jalachara / Vanachara / Keeta by rashi (Sagittarius and Capricorn split at 15°);
  score table from saravali.de as used by PyJHora (AGPL-3.0).
- Tara (3): count from the bride's nakshatra to the groom's and back (inclusive); a remainder of 3, 5 or 7 after
  dividing by 9 is inauspicious; 1.5 points for each auspicious direction.
- Yoni (4), Gana (6), Graha Maitri (5): nakshatra animal / temperament and rashi-lord friendship tables from
  PyJHora (saravali.de).
- Bhakoot (7): 0 when the rashis are 2/12, 5/9 or 6/8 from each other, else 7.
- Nadi (8): Adi / Madhya / Antya; 0 when both share the same nadi, else 8.
- Manglik: Mars in houses 1, 2, 4, 7, 8 or 12 counted from the lagna and from the Moon (whole signs). When both
  partners are Manglik the dosha is traditionally considered cancelled.
"""
from __future__ import annotations

from datetime import time

from .._backend import swe
from ..common.birth import BirthData, resolve_utc
from . import chart

MODULE_ID = "vedic.match"
MODULE_VERSION = "0.1.0"
FLAGS = swe.FLG_SWIEPH | swe.FLG_SIDEREAL

# Indexes: rashi 0..11 (Aries..Pisces), nakshatra 0..26 (Ashwini..Revati)
VARNA = ["brahmin", "kshatriya", "vaishya", "shudra"]
RASHI_VARNA = [1, 2, 3, 0, 1, 2, 3, 0, 1, 2, 3, 0]  # fire, earth, air, water
VASHYA = ["chatushpada", "manava", "jalachara", "vanachara", "keeta"]
VASHYA_TABLE = [  # [bride][groom], saravali.de via PyJHora
    [2.0, 0.5, 1.0, 0.0, 2.0],
    [0.5, 2.0, 0.0, 0.0, 0.0],
    [1.0, 0.0, 2.0, 2.0, 2.0],
    [0.0, 0.0, 2.0, 2.0, 0.0],
    [1.0, 0.0, 1.0, 0.0, 2.0],
]
YONI = ["horse", "elephant", "sheep", "serpent", "dog", "cat", "rat", "cow", "buffalo", "tiger", "deer", "monkey",
        "mongoose", "lion"]
NAKSHATRA_YONI = [0, 1, 2, 3, 3, 4, 5, 2, 5, 6, 6, 7, 8, 9, 8, 9, 10, 10, 4, 11, 12, 11, 13, 0, 13, 7, 1]
YONI_TABLE = [  # [bride][groom]
    [4, 2, 2, 3, 2, 2, 2, 1, 0, 1, 1, 3, 2, 1],
    [2, 4, 3, 3, 2, 2, 2, 2, 3, 1, 2, 3, 2, 0],
    [2, 3, 4, 2, 1, 2, 1, 3, 3, 1, 2, 0, 3, 1],
    [3, 3, 2, 4, 2, 1, 1, 1, 1, 2, 2, 2, 0, 2],
    [2, 2, 1, 2, 4, 2, 1, 2, 2, 1, 0, 2, 1, 1],
    [2, 2, 2, 1, 2, 4, 0, 2, 2, 1, 3, 3, 2, 1],
    [2, 2, 1, 1, 1, 0, 4, 2, 2, 2, 2, 2, 1, 2],
    [1, 2, 3, 1, 2, 2, 2, 4, 3, 0, 3, 2, 2, 1],
    [0, 3, 3, 1, 2, 2, 2, 3, 4, 1, 2, 2, 2, 1],
    [1, 1, 1, 2, 1, 1, 2, 0, 1, 4, 1, 1, 2, 1],
    [1, 2, 2, 2, 0, 3, 2, 3, 2, 1, 4, 2, 2, 1],
    [3, 3, 0, 2, 2, 3, 2, 2, 2, 1, 2, 4, 3, 2],
    [2, 2, 3, 0, 1, 2, 1, 2, 2, 2, 2, 3, 4, 2],
    [1, 0, 1, 2, 1, 1, 2, 1, 1, 1, 1, 2, 2, 4],
]
LORDS = ["sun", "moon", "mars", "mercury", "jupiter", "venus", "saturn"]
RASHI_LORD = [2, 5, 3, 1, 0, 3, 5, 2, 4, 6, 6, 4]
MAITRI_TABLE = [  # [bride lord][groom lord]
    [5.0, 5.0, 5.0, 4.0, 5.0, 0.0, 0.0],
    [5.0, 5.0, 4.0, 1.0, 4.0, 0.5, 0.5],
    [5.0, 4.0, 5.0, 0.5, 5.0, 3.0, 0.5],
    [4.0, 1.0, 0.5, 5.0, 0.5, 5.0, 4.0],
    [5.0, 4.0, 5.0, 0.5, 5.0, 0.5, 3.0],
    [0.0, 0.5, 3.0, 5.0, 0.5, 5.0, 5.0],
    [0.0, 0.5, 0.5, 4.0, 3.0, 5.0, 5.0],
]
GANA = ["deva", "manushya", "rakshasa"]
NAKSHATRA_GANA = [0, 1, 2, 1, 0, 1, 0, 0, 2, 2, 1, 1, 0, 2, 0, 2, 0, 2, 2, 1, 1, 0, 2, 2, 1, 1, 0]
GANA_TABLE = [[6, 6, 0], [5, 6, 0], [1, 0, 6]]  # [bride][groom]
NADI = ["adi", "madhya", "antya"]
NAKSHATRA_NADI = [0, 1, 2, 2, 1, 0, 0, 1, 2, 2, 1, 0, 0, 1, 2, 2, 1, 0, 0, 1, 2, 2, 1, 0, 0, 1, 2]
MANGLIK_HOUSES = {1, 2, 4, 7, 8, 12}


def _vashya(rashi: int, degree_in_sign: float) -> int:
    if rashi in (0, 1):
        return 0
    if rashi in (2, 5, 6, 10):
        return 1
    if rashi in (3, 11):
        return 2
    if rashi == 4:
        return 3
    if rashi == 7:
        return 4
    if rashi == 8:  # Sagittarius: first half human, second half quadruped
        return 1 if degree_in_sign < 15 else 0
    return 0 if degree_in_sign < 15 else 2  # Capricorn: first half quadruped, second half water


def _count(from_nak: int, to_nak: int) -> int:
    """Inclusive count from one nakshatra to another (1..27)."""
    return (to_nak - from_nak) % 27 + 1


def person(birth: BirthData) -> dict:
    swe.set_sid_mode(swe.SIDM_LAHIRI)
    utc = resolve_utc(birth.date, birth.time or time(12, 0), birth.timezone).utc
    jd = swe.julday(utc.year, utc.month, utc.day, utc.hour + utc.minute / 60 + utc.second / 3600)
    moon = swe.calc_ut(jd, swe.MOON, FLAGS)[0][0] % 360
    mars = swe.calc_ut(jd, swe.MARS, FLAGS)[0][0] % 360
    rashi = int(moon // 30)
    nak = int(moon // (360 / 27))
    houses = {"moon": (int(mars // 30) - rashi) % 12 + 1}
    if not birth.time_unknown:
        _, ascmc = swe.houses_ex(jd, birth.latitude, birth.longitude, b"W", swe.FLG_SIDEREAL)
        houses["lagna"] = (int(mars // 30) - int(ascmc[0] % 360 // 30)) % 12 + 1
    manglik = {ref: h in MANGLIK_HOUSES for ref, h in houses.items()}
    return {
        "moonSign": chart.SIGNS[rashi], "nakshatra": nak + 1, "nakshatraInfo": chart.nakshatra_of(moon),
        "varna": VARNA[RASHI_VARNA[rashi]], "vashya": VASHYA[_vashya(rashi, moon % 30)],
        "yoni": YONI[NAKSHATRA_YONI[nak]], "lord": LORDS[RASHI_LORD[rashi]], "gana": GANA[NAKSHATRA_GANA[nak]],
        "nadi": NADI[NAKSHATRA_NADI[nak]],
        "manglik": {"marsHouse": houses, "fromLagna": manglik.get("lagna"), "fromMoon": manglik["moon"],
                    "isManglik": any(manglik.values())},
        "_idx": {"rashi": rashi, "nak": nak, "moonDeg": moon % 30},
    }


def koota(groom: dict, bride: dict) -> list[dict]:
    g, b = groom["_idx"], bride["_idx"]
    varna = 1 if RASHI_VARNA[g["rashi"]] <= RASHI_VARNA[b["rashi"]] else 0
    vashya = VASHYA_TABLE[_vashya(b["rashi"], b["moonDeg"])][_vashya(g["rashi"], g["moonDeg"])]
    tara = sum(1.5 for c in (_count(b["nak"], g["nak"]), _count(g["nak"], b["nak"])) if c % 9 not in (3, 5, 7))
    yoni = YONI_TABLE[NAKSHATRA_YONI[b["nak"]]][NAKSHATRA_YONI[g["nak"]]]
    maitri = MAITRI_TABLE[RASHI_LORD[b["rashi"]]][RASHI_LORD[g["rashi"]]]
    gana = GANA_TABLE[NAKSHATRA_GANA[b["nak"]]][NAKSHATRA_GANA[g["nak"]]]
    distance = (g["rashi"] - b["rashi"]) % 12 + 1  # groom's rashi counted from the bride's
    bhakoot = 0 if distance in (2, 12, 5, 9, 6, 8) else 7
    nadi = 0 if NAKSHATRA_NADI[g["nak"]] == NAKSHATRA_NADI[b["nak"]] else 8
    return [
        {"id": "varna", "score": varna, "max": 1}, {"id": "vashya", "score": vashya, "max": 2},
        {"id": "tara", "score": tara, "max": 3}, {"id": "yoni", "score": yoni, "max": 4},
        {"id": "maitri", "score": maitri, "max": 5}, {"id": "gana", "score": gana, "max": 6},
        {"id": "bhakoot", "score": bhakoot, "max": 7}, {"id": "nadi", "score": nadi, "max": 8},
    ]


def calculate(groom_birth: BirthData, bride_birth: BirthData, **_options) -> dict:
    groom, bride = person(groom_birth), person(bride_birth)
    kootas = koota(groom, bride)
    total = sum(k["score"] for k in kootas)
    both = groom["manglik"]["isManglik"] and bride["manglik"]["isManglik"]
    for p in (groom, bride):
        p.pop("_idx")
    return {
        "module": MODULE_ID,
        "meta": {"engineVersion": MODULE_VERSION, "ayanamsa": "lahiri",
                 "tables": "Vashya, Yoni, Gana, Graha Maitri from PyJHora (saravali.de); other kootas by rule"},
        "groom": groom, "bride": bride,
        "kootas": kootas,
        "total": total, "max": 36,
        "verdict": "excellent" if total >= 28 else "good" if total >= 18 else "weak",
        "manglik": {"groom": groom["manglik"]["isManglik"], "bride": bride["manglik"]["isManglik"],
                    "cancelled": both, "mismatch": groom["manglik"]["isManglik"] != bride["manglik"]["isManglik"]},
    }


__all__ = ["calculate", "koota", "person", "MODULE_ID"]
