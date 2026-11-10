"""Zodiac constants and pure helpers."""
from __future__ import annotations

SIGNS = ["aries", "taurus", "gemini", "cancer", "leo", "virgo",
         "libra", "scorpio", "sagittarius", "capricorn", "aquarius", "pisces"]
ELEMENTS = ["fire", "earth", "air", "water"]
MODALITIES = ["cardinal", "fixed", "mutable"]


def norm(lon: float) -> float:
    return lon % 360.0


def sign_index(lon: float) -> int:
    return int(norm(lon) // 30) % 12


def sign_of(lon: float) -> str:
    return SIGNS[sign_index(lon)]


def element_of(sign: str) -> str:
    return ELEMENTS[SIGNS.index(sign) % 4]


def modality_of(sign: str) -> str:
    return MODALITIES[SIGNS.index(sign) % 3]


def polarity_of(sign: str) -> str:
    """Fire and air signs are positive (yang), earth and water negative (yin)."""
    return "positive" if SIGNS.index(sign) % 2 == 0 else "negative"


def split_degree(lon: float) -> tuple[int, int, int]:
    """Degree within sign, arcminute, arcsecond — truncated, never rounded up into the next sign."""
    within = norm(lon) % 30
    total_sec = int(within * 3600 + 1e-7)
    return total_sec // 3600, (total_sec % 3600) // 60, total_sec % 60


def separation(a: float, b: float) -> float:
    """Smallest angular distance between two longitudes, 0..180."""
    d = abs(norm(a) - norm(b)) % 360
    return 360 - d if d > 180 else d


def house_of(lon: float, cusps: list[float]) -> int:
    """House number (1-12) of a longitude given 12 cusp longitudes (cusp i opens house i)."""
    lon = norm(lon)
    for i in range(12):
        start, end = norm(cusps[i]), norm(cusps[(i + 1) % 12])
        width = (end - start) % 360
        if (lon - start) % 360 < width:
            return i + 1
    return 12  # unreachable for valid cusps; zero-width houses fall through to the next
