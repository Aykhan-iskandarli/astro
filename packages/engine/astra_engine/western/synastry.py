"""Synastry: two natal charts compared — cross aspects, house overlays, element balance and the relationship
score of the Ciro Discepolo method (kerykeion RelationshipScoreFactory)."""
from __future__ import annotations

import warnings
from datetime import time

from ..common.birth import BirthData, HouseSystem, resolve_utc
from ..common.zodiac import ELEMENTS, house_of
from . import natal
from .aspects import AspectPoint, find_cross_aspects

from kerykeion import RelationshipScoreFactory  # noqa: E402

MODULE_ID = "western.synastry"
MODULE_VERSION = "0.1.0"

SYNASTRY_BODIES = ["sun", "moon", "mercury", "venus", "mars", "jupiter", "saturn", "uranus", "neptune", "pluto",
                   "northNode", "lilith", "chiron"]
SYNASTRY_ORBS = {"conjunction": 7.0, "opposition": 7.0, "square": 6.0, "trine": 6.0, "sextile": 4.0,
                 "quincunx": 2.0}
ASCENDANT_RULES = {"sun_ascendant", "moon_ascendant"}


def _aspect_points(chart: dict) -> list[AspectPoint]:
    pts = [AspectPoint(p["id"], p["longitude"], None) for p in chart["points"] if p["id"] in SYNASTRY_BODIES]
    if chart["angles"]:
        pts += [AspectPoint(a, chart["angles"][a]["longitude"], None, is_angle=True) for a in ("asc", "mc")]
    return pts


def _overlay(points_of: dict, houses_of: dict) -> list[dict] | None:
    """Where the planets of one person fall in the houses of the other."""
    if not houses_of["houses"]:
        return None
    cusps = [h["longitude"] for h in houses_of["houses"]]
    return [{"id": p["id"], "house": house_of(p["longitude"], cusps)}
            for p in points_of["points"] if p["id"] in SYNASTRY_BODIES]


def level_of(value: int) -> str:
    """Ranges documented by the method (kerykeion RelationshipScoreFactory)."""
    if value < 5:
        return "minimal"
    if value < 10:
        return "medium"
    if value < 15:
        return "important"
    if value < 20:
        return "veryImportant"
    if value < 30:
        return "exceptional"
    return "rareExceptional"


def _score(a: BirthData, b: BirthData) -> dict:
    subjects = []
    for birth in (a, b):
        utc = resolve_utc(birth.date, birth.time or time(12, 0), birth.timezone).utc
        subjects.append(natal.build_subject(birth, utc))
    with warnings.catch_warnings():
        warnings.simplefilter("ignore")
        result = RelationshipScoreFactory(subjects[0], subjects[1]).get_relationship_score()
    breakdown = [{"rule": r.rule, "points": r.points, "details": r.details} for r in result.score_breakdown]
    excluded = []
    # Without a birth time the Ascendant is unknown: drop the Ascendant rules instead of scoring a guess
    if a.time_unknown or b.time_unknown:
        excluded = [x for x in breakdown if x["rule"] in ASCENDANT_RULES]
        breakdown = [x for x in breakdown if x["rule"] not in ASCENDANT_RULES]
    value = sum(x["points"] for x in breakdown)
    return {"value": value, "level": level_of(value), "breakdown": breakdown, "excluded": excluded,
            "method": "Ciro Discepolo (kerykeion RelationshipScoreFactory)"}


def calculate(birth: BirthData, partner: BirthData, house_system: HouseSystem = "P") -> dict:
    first = natal.calculate(birth, house_system=house_system)
    second = natal.calculate(partner, house_system=house_system)
    elements = {e: {"first": first["balance"]["elements"][e], "second": second["balance"]["elements"][e]}
                for e in ELEMENTS}
    return {
        "module": MODULE_ID,
        "meta": {"engineVersion": MODULE_VERSION, "orbs": SYNASTRY_ORBS},
        "first": first,
        "second": second,
        "aspects": find_cross_aspects(_aspect_points(first), _aspect_points(second), SYNASTRY_ORBS),
        "overlays": {"firstInSecond": _overlay(first, second), "secondInFirst": _overlay(second, first)},
        "elements": elements,
        "score": _score(birth, partner),
    }
