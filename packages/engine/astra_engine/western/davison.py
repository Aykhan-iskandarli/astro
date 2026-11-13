"""Davison relationship chart: a real chart cast for the midpoint in time and space between two births.

Time: the mean of the two UTC birth moments. Place: the mean latitude and the circular mean of the longitudes (the
shorter way round). Unlike the composite (midpoints of the planets), this is an actual sky with its own houses.
When either birth time is unknown, noon is used for it (as in the natal chart) and the result is flagged.
"""
from __future__ import annotations

import math
from datetime import datetime, time, timedelta, timezone

from ..common.birth import BirthData, HouseSystem, resolve_utc
from . import natal

MODULE_ID = "western.davison"
MODULE_VERSION = "0.1.0"


def midpoint(first: BirthData, second: BirthData) -> tuple[datetime, float, float]:
    a = resolve_utc(first.date, first.time or time(12, 0), first.timezone).utc
    b = resolve_utc(second.date, second.time or time(12, 0), second.timezone).utc
    moment = a + (b - a) / 2
    lat = (first.latitude + second.latitude) / 2
    x = math.cos(math.radians(first.longitude)) + math.cos(math.radians(second.longitude))
    y = math.sin(math.radians(first.longitude)) + math.sin(math.radians(second.longitude))
    lon = math.degrees(math.atan2(y, x)) if (x or y) else first.longitude
    return moment, lat, lon


def calculate(first: BirthData, second: BirthData, house_system: HouseSystem = "P") -> dict:
    moment, lat, lon = midpoint(first, second)
    moment = moment.replace(microsecond=0)
    if moment.second >= 30:  # BirthData keeps minutes; round to the nearest minute
        moment += timedelta(minutes=1)
    moment = moment.replace(second=0)
    birth = BirthData(name=None, date=moment.date(), time=moment.timetz().replace(tzinfo=None), latitude=round(lat, 4),
                      longitude=round(lon, 4), timezone="UTC", place=None)
    out = natal.calculate(birth, house_system=house_system)
    out["module"] = MODULE_ID
    out["meta"]["davison"] = {"utc": moment.astimezone(timezone.utc).isoformat().replace("+00:00", "Z"),
                              "latitude": round(lat, 4), "longitude": round(lon, 4),
                              "timeUnknown": first.time_unknown or second.time_unknown}
    return out


__all__ = ["calculate", "midpoint", "MODULE_ID"]
