"""Secondary progressions ("a day for a year").

Planets: positions at birth + N days, where N = age in tropical years (365.2422 days).
Angles and houses: solar-arc MC (natal MC + progressed Sun − natal Sun), with the Ascendant and cusps derived
from that MC at the birth latitude — the default of astro.com / Astro-Seek. (kerykeion's own progression
factory uses daily-houses angles, which differ; planet positions are the same.)
"""
from __future__ import annotations

import math
from datetime import datetime, time, timedelta, timezone

from .._backend import swe
from ..common.birth import BirthData, HouseSystem, resolve_utc
from ..common.zodiac import norm
from . import natal
from .aspects import AspectPoint, find_cross_aspects

MODULE_ID = "western.progressions"
MODULE_VERSION = "0.1.0"
TROPICAL_YEAR_DAYS = 365.2422
PROGRESSION_ORBS = {"conjunction": 1.0, "opposition": 1.0, "square": 1.0, "trine": 1.0, "sextile": 1.0}
SKIP = {"partOfFortune"}  # depends on the Ascendant; not progressed


def _armc_from_mc(mc: float, eps: float) -> float:
    lam, e = math.radians(mc), math.radians(eps)
    return norm(math.degrees(math.atan2(math.sin(lam) * math.cos(e), math.cos(lam))))


def calculate(birth: BirthData, target: datetime | None = None, house_system: HouseSystem = "P") -> dict:
    target = (target or datetime.now(timezone.utc)).astimezone(timezone.utc).replace(microsecond=0)
    birth_utc = resolve_utc(birth.date, birth.time or time(12, 0), birth.timezone).utc
    age_years = (target - birth_utc).total_seconds() / 86400 / TROPICAL_YEAR_DAYS
    prog_utc = (birth_utc + timedelta(days=age_years)).replace(microsecond=0)

    natal_chart = natal.calculate(birth, house_system=house_system)
    p_subject = natal.build_subject(birth, prog_utc, house_system)
    raw = {pid: (getattr(p_subject, attr).abs_pos, getattr(p_subject, attr).speed, getattr(p_subject, attr).retrograde)
           for pid, attr, _ in natal.POINTS if pid not in SKIP}

    natal_sun = next(p["longitude"] for p in natal_chart["points"] if p["id"] == "sun")
    solar_arc = norm(raw["sun"][0] - natal_sun)
    cusps, angles = None, None
    if not birth.time_unknown:
        mc = norm(natal_chart["angles"]["mc"]["longitude"] + solar_arc)
        jd = p_subject.julian_day
        eps = swe.calc_ut(jd, swe.ECL_NUT)[0][0]  # true obliquity of the progressed date
        cusps_raw, ascmc = swe.houses_armc(_armc_from_mc(mc, eps), birth.latitude, eps, house_system.encode())
        cusps = list(cusps_raw)
        angles = {"asc": ascmc[0], "mc": ascmc[1], "dc": norm(ascmc[0] + 180), "ic": norm(ascmc[1] + 180)}
    body = natal.assemble(raw, cusps, angles)

    natal_targets = [AspectPoint(p["id"], p["longitude"], 0.0) for p in natal_chart["points"] if p["id"] not in SKIP]
    if natal_chart["angles"]:
        natal_targets += [AspectPoint(a, natal_chart["angles"][a]["longitude"], None, is_angle=True)
                          for a in ("asc", "mc")]
    moving = [AspectPoint(p["id"], p["longitude"], p["speed"]) for p in body["points"]]
    if body["angles"]:
        moving += [AspectPoint(f"{a}", body["angles"][a]["longitude"], None, is_angle=True) for a in ("asc", "mc")]

    return {
        "module": MODULE_ID,
        "meta": {"engineVersion": MODULE_VERSION, "method": "secondary (day for a year)",
                 "angles": "solar-arc MC", "yearDays": TROPICAL_YEAR_DAYS, "orbs": PROGRESSION_ORBS,
                 "timeUnknown": birth.time_unknown},
        "target": target.isoformat().replace("+00:00", "Z"),
        "progressedMoment": prog_utc.isoformat().replace("+00:00", "Z"),
        "ageYears": round(age_years, 4),
        "solarArc": round(solar_arc, 6),
        "chart": body,
        "aspectsToNatal": find_cross_aspects(moving, natal_targets, PROGRESSION_ORBS, moving="first"),
    }
