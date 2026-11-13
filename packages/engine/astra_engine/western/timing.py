"""Timing techniques: firdaria, zodiacal releasing and solar arc directions.

- Firdaria (Persian time lords) and zodiacal releasing (Valens; from the Lot of Fortune and the Lot of Spirit,
  two levels) come from kerykeion's factories, which document and test their conventions.
- Solar arc directions: arc = secondary-progressed Sun - natal Sun (day-for-a-year, 365.2422-day years); every
  natal point is moved forward by the arc. Aspects (conjunction, sextile, square, trine, opposition) from directed
  to natal points are listed within SOLAR_ARC_ORB.
"""
from __future__ import annotations

import warnings
from datetime import date as Date, time

from .._backend import swe
from ..common.birth import BirthData, resolve_utc
from ..common.zodiac import norm, sign_of, split_degree
from ..sky.common import kery_planet, kery_sign
from . import natal

from kerykeion.firdaria.factory import FirdariaFactory  # noqa: E402
from kerykeion.zodiacal_releasing.factory import ZodiacalReleasingFactory  # noqa: E402

MODULE_ID = "western.timing"
MODULE_VERSION = "0.1.0"
YEAR = 365.2422
SOLAR_ARC_ORB = 1.0
ASPECTS = {"conjunction": 0, "sextile": 60, "square": 90, "trine": 120, "opposition": 180}
DIRECTED = ["sun", "moon", "mercury", "venus", "mars", "jupiter", "saturn", "uranus", "neptune", "pluto"]


def _pos(lon: float) -> dict:
    d, m, _ = split_degree(lon)
    return {"longitude": round(norm(lon), 4), "sign": sign_of(lon), "degree": d, "minute": m}


def solar_arc(birth_jd: float, natal_points: dict[str, float], on: Date) -> dict:
    target = swe.julday(on.year, on.month, on.day, 12)
    age_years = (target - birth_jd) / YEAR
    progressed_jd = birth_jd + age_years  # one day after birth for each year of life
    sun_natal = swe.calc_ut(birth_jd, swe.SUN, swe.FLG_SWIEPH)[0][0]
    sun_prog = swe.calc_ut(progressed_jd, swe.SUN, swe.FLG_SWIEPH)[0][0]
    arc = norm(sun_prog - sun_natal)
    directed = {pid: norm(lon + arc) for pid, lon in natal_points.items() if pid in DIRECTED or pid in ("asc", "mc")}
    aspects = []
    for d_id, d_lon in directed.items():
        for n_id, n_lon in natal_points.items():
            if n_id not in DIRECTED and n_id not in ("asc", "mc"):
                continue
            sep = abs((d_lon - n_lon + 180) % 360 - 180)
            for name, angle in ASPECTS.items():
                orb = abs(sep - angle)
                if orb <= SOLAR_ARC_ORB:
                    aspects.append({"directed": d_id, "natal": n_id, "type": name, "orb": round(orb, 2)})
    return {
        "on": on.isoformat(), "arc": round(arc, 4), "orb": SOLAR_ARC_ORB,
        "points": [{"id": pid, **_pos(lon)} for pid, lon in directed.items()],
        "aspects": sorted(aspects, key=lambda a: a["orb"]),
    }


def _zr(subject, lot: str, on: Date) -> dict:
    out = ZodiacalReleasingFactory.from_subject(subject, lot=lot, levels=2, target_date=on.isoformat()).model_dump()

    def period(p: dict) -> dict:
        return {"sign": kery_sign(p["sign"]), "ruler": kery_planet(p["ruler"]), "start": p["start"], "end": p["end"],
                "years": round(p["years"], 2), "angular": p["is_angular"], "loosingTheBond": p["is_loosing_the_bond"],
                "sub": [period(s) for s in p.get("subperiods") or []]}

    return {"lot": lot, "lotSign": kery_sign(out["lot_sign"]), "periods": [period(p) for p in out["periods"]]}


def calculate(birth: BirthData, on: Date | None = None, **_options) -> dict:
    on = on or Date.today()
    resolved = resolve_utc(birth.date, birth.time or time(12, 0), birth.timezone)
    utc = resolved.utc
    jd = swe.julday(utc.year, utc.month, utc.day, utc.hour + utc.minute / 60 + utc.second / 3600)
    chart = natal.calculate(birth)
    points = {p["id"]: p["longitude"] for p in chart["points"]}
    if chart["angles"]:
        points.update({"asc": chart["angles"]["asc"]["longitude"], "mc": chart["angles"]["mc"]["longitude"]})
    subject = natal.build_subject(birth, utc)
    with warnings.catch_warnings():
        warnings.simplefilter("ignore")
        fd = FirdariaFactory.from_subject(subject, target_date=on.isoformat(), life_cap_years=100).model_dump()
        zr = None if birth.time_unknown else [_zr(subject, "fortune", on), _zr(subject, "spirit", on)]
    return {
        "module": MODULE_ID,
        "meta": {"engineVersion": MODULE_VERSION, "timeUnknown": birth.time_unknown,
                 "firdaria": "kerykeion", "zodiacalReleasing": "kerykeion, 2 levels"},
        "input": {"on": on.isoformat()},
        "firdaria": {
            "diurnal": fd["is_diurnal"],
            "periods": [{"lord": kery_planet(p["lord"]), "years": p["years"], "start": p["start"], "end": p["end"],
                         "sub": [{"lord": kery_planet(s["lord"]), "start": s["start"], "end": s["end"]}
                                 for s in p.get("sub_periods") or []]} for p in fd["periods"]],
            "current": kery_planet(fd["current"]["lord"]) if fd.get("current") else None,
            "currentSub": kery_planet(fd["current_sub"]["lord"]) if fd.get("current_sub") else None,
        },
        "zodiacalReleasing": zr,
        "solarArc": solar_arc(jd, points, on),
    }


__all__ = ["calculate", "solar_arc", "MODULE_ID"]
