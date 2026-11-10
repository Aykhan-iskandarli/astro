"""Essential dignities: domicile, exaltation, detriment, fall.

Rulerships: traditional + modern co-rulers (Uranus/Aquarius, Neptune/Pisces, Pluto/Scorpio).
Exaltations: the seven traditional planets only; outer-planet exaltations are not standardised.
"""
from __future__ import annotations

from ..common.zodiac import SIGNS

DOMICILE: dict[str, set[str]] = {
    "sun": {"leo"}, "moon": {"cancer"}, "mercury": {"gemini", "virgo"}, "venus": {"taurus", "libra"},
    "mars": {"aries", "scorpio"}, "jupiter": {"sagittarius", "pisces"}, "saturn": {"capricorn", "aquarius"},
    "uranus": {"aquarius"}, "neptune": {"pisces"}, "pluto": {"scorpio"},
}
EXALTATION: dict[str, str] = {
    "sun": "aries", "moon": "taurus", "mercury": "virgo", "venus": "pisces",
    "mars": "capricorn", "jupiter": "cancer", "saturn": "libra",
}


# House rulers: the traditional ruler of the cusp sign, plus the modern co-ruler where one exists.
TRADITIONAL_RULER: dict[str, str] = {
    "aries": "mars", "taurus": "venus", "gemini": "mercury", "cancer": "moon", "leo": "sun", "virgo": "mercury",
    "libra": "venus", "scorpio": "mars", "sagittarius": "jupiter", "capricorn": "saturn", "aquarius": "saturn",
    "pisces": "jupiter",
}
MODERN_CORULER: dict[str, str] = {"scorpio": "pluto", "aquarius": "uranus", "pisces": "neptune"}


def rulers_of(sign: str) -> list[str]:
    """[traditional ruler] or [traditional ruler, modern co-ruler]."""
    return [TRADITIONAL_RULER[sign]] + ([MODERN_CORULER[sign]] if sign in MODERN_CORULER else [])


def _opposite(sign: str) -> str:
    return SIGNS[(SIGNS.index(sign) + 6) % 12]


def dignity_of(planet: str, sign: str) -> str | None:
    """Strongest applicable dignity, or None (peregrine / not a dignity-bearing point)."""
    if planet not in DOMICILE:
        return None
    if sign in DOMICILE[planet]:
        return "domicile"
    if EXALTATION.get(planet) == sign:
        return "exaltation"
    if sign in {_opposite(s) for s in DOMICILE[planet]}:
        return "detriment"
    if planet in EXALTATION and _opposite(EXALTATION[planet]) == sign:
        return "fall"
    return None
