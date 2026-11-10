"""Solar and lunar returns: the exact moment the Sun (or Moon) comes back to its natal longitude, and the chart
cast for that moment at the birthplace or at a chosen (relocated) place. The return moment comes from
kerykeion's PlanetaryReturnFactory (Swiss Ephemeris backend)."""
from __future__ import annotations

import warnings
from datetime import date as Date, datetime, time, timedelta, timezone
from typing import Literal
from zoneinfo import ZoneInfo

from ..common.birth import BirthData, HouseSystem, resolve_utc
from . import natal

from kerykeion import PlanetaryReturnFactory  # noqa: E402

MODULE_ID = "western.returns"
MODULE_VERSION = "0.1.0"
ReturnKind = Literal["solar", "lunar"]


def _search_start(birth: BirthData, kind: ReturnKind, year: int | None, after: Date | None) -> Date:
    if kind == "solar":
        y = year or Date.today().year
        try:
            birthday = birth.date.replace(year=y)
        except ValueError:  # 29 February in a common year
            birthday = Date(y, 3, 1)
        return birthday - timedelta(days=3)  # a few days early: the return can fall before the birthday
    return after or Date.today()


def calculate(birth: BirthData, kind: ReturnKind = "solar", year: int | None = None, after: Date | None = None,
              place: dict | None = None, house_system: HouseSystem = "P") -> dict:
    """place: optional {"latitude", "longitude", "timezone", "name"} for a relocated return chart."""
    utc_birth = resolve_utc(birth.date, birth.time or time(12, 0), birth.timezone).utc
    subject = natal.build_subject(birth, utc_birth, house_system)
    loc = place or {"latitude": birth.latitude, "longitude": birth.longitude, "timezone": birth.timezone,
                    "name": birth.place}
    start = _search_start(birth, kind, year, after)
    with warnings.catch_warnings():
        warnings.simplefilter("ignore")
        factory = PlanetaryReturnFactory(subject, lng=loc["longitude"], lat=loc["latitude"], tz_str="UTC",
                                         online=False)
        ret = factory.next_return_from_date(start.year, start.month, start.day,
                                            return_type="Solar" if kind == "solar" else "Lunar")
    at = datetime.fromisoformat(ret.iso_formatted_utc_datetime).astimezone(timezone.utc)
    chart = natal.calculate(BirthData(name=birth.name, date=at.date(), time=at.time().replace(microsecond=0),
                                      latitude=loc["latitude"], longitude=loc["longitude"], timezone="UTC",
                                      place=loc.get("name")), house_system=house_system)
    local = at.astimezone(ZoneInfo(loc["timezone"]))
    chart["input"].update({"timezone": loc["timezone"], "localDatetime": local.isoformat(),
                           "date": local.date().isoformat(), "utcOffset": local.strftime("%z")[:3] + ":" + local.strftime("%z")[3:]})
    return {
        "module": MODULE_ID,
        "meta": {"engineVersion": MODULE_VERSION, "kind": kind, "relocated": place is not None,
                 "birthTimeUnknown": birth.time_unknown},
        "at": at.isoformat().replace("+00:00", "Z"),
        "local": local.isoformat(),
        "location": loc,
        "chart": chart,
    }
