"""Transits: where the planets are at a given moment, and how they aspect the natal chart."""
from __future__ import annotations

from datetime import datetime, timezone

from ..common.birth import BirthData, HouseSystem
from ..common.zodiac import house_of
from . import natal
from .aspects import AspectPoint, find_cross_aspects
from .lunar import lunar_phase

MODULE_ID = "western.transits"
MODULE_VERSION = "0.1.0"

TRANSIT_BODIES = ["sun", "moon", "mercury", "venus", "mars", "jupiter", "saturn", "uranus", "neptune", "pluto",
                  "northNode", "chiron"]
NATAL_TARGETS = TRANSIT_BODIES + ["lilith"]
# Transit orbs are deliberately tight: a transit is "on" only close to exactness
TRANSIT_ORBS = {"conjunction": 3.0, "opposition": 3.0, "square": 3.0, "trine": 3.0, "sextile": 2.0,
                "quincunx": 1.5}


def _moment_birth(birth: BirthData, at: datetime) -> BirthData:
    at = at.astimezone(timezone.utc)
    return BirthData(name="Transits", date=at.date(), time=at.time().replace(microsecond=0),
                     latitude=birth.latitude, longitude=birth.longitude, timezone="UTC")


def calculate(birth: BirthData, at: datetime | None = None, house_system: HouseSystem = "P") -> dict:
    """Transit positions at `at` (UTC, default now) and their aspects to the natal chart of `birth`."""
    at = (at or datetime.now(timezone.utc)).astimezone(timezone.utc).replace(microsecond=0)
    base = natal.calculate(birth, house_system=house_system)
    sky = natal.calculate(_moment_birth(birth, at), house_system=house_system)

    cusps = [h["longitude"] for h in base["houses"]] if base["houses"] else None
    by_id = {p["id"]: p for p in sky["points"]}
    points = []
    for pid in TRANSIT_BODIES:
        p = dict(by_id[pid])
        p["house"] = house_of(p["longitude"], cusps) if cusps else None  # natal house the transit falls in
        points.append(p)

    natal_targets = [AspectPoint(p["id"], p["longitude"], 0.0) for p in base["points"] if p["id"] in NATAL_TARGETS]
    if base["angles"]:
        natal_targets += [AspectPoint(a, base["angles"][a]["longitude"], None, is_angle=True) for a in ("asc", "mc")]
    transit_points = [AspectPoint(p["id"], p["longitude"], p["speed"]) for p in points]

    return {
        "module": MODULE_ID,
        "meta": {"engineVersion": MODULE_VERSION, "orbs": TRANSIT_ORBS, "houseSystem": base["meta"]["houseSystem"]},
        "at": at.isoformat().replace("+00:00", "Z"),
        "points": points,
        "aspects": find_cross_aspects(transit_points, natal_targets, TRANSIT_ORBS, moving="first"),
        "lunarPhase": lunar_phase(by_id["sun"]["longitude"], by_id["moon"]["longitude"]),
    }
