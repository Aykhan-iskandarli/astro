"""Astro calendar for a date range: lunations, eclipses, sign ingresses, retrograde periods and stations."""
from __future__ import annotations

import warnings
from datetime import date

from .common import kery_planet, kery_sign

from kerykeion import (EclipseFactory, LunationFinderFactory, RetrogradeStationFactory,  # noqa: E402
                       SignIngressFactory)

MODULE_ID = "sky.calendar"
MODULE_VERSION = "0.1.0"
MAX_DAYS = 400
INGRESS_PLANETS = ["Sun", "Mercury", "Venus", "Mars", "Jupiter", "Saturn", "Uranus", "Neptune", "Pluto"]


def calculate(start: date, end: date) -> dict:
    if end <= start:
        raise ValueError("end must be after start")
    if (end - start).days > MAX_DAYS:
        raise ValueError(f"range must be at most {MAX_DAYS} days")
    s, e = start.isoformat(), end.isoformat()
    with warnings.catch_warnings():
        warnings.simplefilter("ignore")
        lun = LunationFinderFactory.from_iso_range(s, e)
        periods = RetrogradeStationFactory.retrograde_periods_from_iso_range(s, e)
        stations = RetrogradeStationFactory.from_iso_range(s, e)
        ingresses = SignIngressFactory.from_iso_range(s, e, planets=INGRESS_PLANETS)
        # Eclipses come per year; search from the start year and keep those inside the range
        ecl = EclipseFactory.search_global(start_year=start.year, count=6 * (end.year - start.year + 1))

    def inside(stamp: str) -> bool:
        return s <= stamp[:10] < e

    eclipses = [{"kind": "solar", "type": x.type, "at": x.datestamp, "sign": kery_sign(x.sign)}
                for x in ecl.solar_eclipses if inside(x.datestamp)]
    eclipses += [{"kind": "lunar", "type": x.type, "at": x.datestamp, "sign": kery_sign(x.sign)}
                 for x in ecl.lunar_eclipses if inside(x.datestamp)]
    eclipses.sort(key=lambda x: x["at"])
    return {
        "module": MODULE_ID,
        "meta": {"engineVersion": MODULE_VERSION},
        "start": s,
        "end": e,
        "lunations": [{"phase": x.phase, "at": x.iso_utc, "sign": kery_sign(x.moon.sign)} for x in lun.lunations],
        "eclipses": eclipses,
        "ingresses": [{"planet": kery_planet(x.planet), "at": x.iso_utc, "sign": kery_sign(x.sign),
                       "retrograde": bool(x.retrograde)} for x in ingresses.ingresses],
        "retrogradePeriods": [{"planet": kery_planet(x.planet), "start": x.start, "end": x.end,
                               "startClipped": x.start_clipped, "endClipped": x.end_clipped}
                              for x in periods.periods],
        "stations": [{"planet": kery_planet(x.planet), "type": x.station_type, "at": x.iso_utc,
                      "sign": kery_sign(x.sign)} for x in stations.stations],
    }
