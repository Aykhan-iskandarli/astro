"""Lunar phase from Sun/Moon longitudes: eight 45° phases (Rudhyar), starting at the New Moon."""
from __future__ import annotations

from ..common.zodiac import norm

PHASES = ["newMoon", "waxingCrescent", "firstQuarter", "waxingGibbous",
          "fullMoon", "disseminating", "lastQuarter", "balsamic"]


def lunar_phase(sun_lon: float, moon_lon: float) -> dict:
    elongation = norm(moon_lon - sun_lon)
    return {"elongation": round(elongation, 4), "phase": PHASES[int(elongation // 45) % 8],
            "waxing": elongation < 180}
