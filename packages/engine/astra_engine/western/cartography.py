"""Astrocartography: where on Earth each planet was on the MC, IC, Ascendant or Descendant at the birth moment.

Lines come from kerykeion's AstroCartographyFactory (latitudes -66..66, 2° steps); MC/IC lines are meridians, ASC/DSC
lines are curves. Coordinates are rounded to 0.01°.
"""
from __future__ import annotations

import warnings
from datetime import time

from ..common.birth import BirthData, resolve_utc
from ..sky.common import kery_planet
from . import natal

from kerykeion.astro_cartography import AstroCartographyFactory  # noqa: E402

MODULE_ID = "western.cartography"
MODULE_VERSION = "0.1.0"
PLANETS = ["Sun", "Moon", "Mercury", "Venus", "Mars", "Jupiter", "Saturn", "Uranus", "Neptune", "Pluto"]


def calculate(birth: BirthData, **_options) -> dict:
    utc = resolve_utc(birth.date, birth.time or time(12, 0), birth.timezone).utc
    subject = natal.build_subject(birth, utc)
    with warnings.catch_warnings():
        warnings.simplefilter("ignore")
        lines = AstroCartographyFactory.compute(subject, step=2.0, planets=PLANETS)
    return {
        "module": MODULE_ID,
        "meta": {"engineVersion": MODULE_VERSION, "latitudes": [-66, 66], "timeUnknown": birth.time_unknown},
        "birthplace": {"latitude": birth.latitude, "longitude": birth.longitude},
        "lines": [{"planet": kery_planet(line.planet), "type": line.line_type.lower(),
                   "points": [[round(p.longitude, 2), round(p.latitude, 2)] for p in line.points]} for line in lines],
    }


__all__ = ["calculate", "MODULE_ID"]
