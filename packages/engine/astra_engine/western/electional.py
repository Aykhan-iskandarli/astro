"""Day-by-day facts for choosing a day (electional astrology), read in YOUR chart.

For every day of a range (in the viewer's time zone) this returns what the traditional rules of choosing a day
look at, and nothing more: whether the Moon is waxing or waning and its phase, the Moon's sign changes, the natal
house the Moon is in (with exact times of house changes), the void-of-course periods of the Moon, and which of
Mercury, Venus and Mars are retrograde. How these are weighed for a topic is left to the reader; no numeric score
is invented here.

Times are found like in `sky.moon` and `western.personalmoon`: sampling on a grid and refining by bisection.
Output instants are UTC. Without a birth time there are no houses, so the house windows are left out.
"""
from __future__ import annotations

import math
from datetime import date, datetime, time, timedelta
from zoneinfo import ZoneInfo

from ..common.birth import BirthData, HouseSystem
from ..common.zodiac import SIGNS, house_of, norm
from ..sky import moon as sky_moon
from ..sky.common import iso_from_jd, jd_of, longitude
from . import natal
from .lunar import PHASES
from .personal_moon import DAY_STEP, _crossings, _diff, _grid, _moon

MODULE_ID = "western.electional"
MODULE_VERSION = "0.1.0"
MAX_DAYS = 62
RETROGRADE_CHECK = ("mercury", "venus", "mars")


def _local_midnight(day: date, tz: ZoneInfo) -> float:
    return jd_of(datetime.combine(day, time(0), tz))


def _clip(start: float, end: float, d0: float, d1: float) -> tuple[float, float] | None:
    lo, hi = max(start, d0), min(end, d1)
    return (lo, hi) if lo < hi else None


def calculate(birth: BirthData, start: date | None = None, days: int = 30, timezone_name: str = "UTC",
              house_system: HouseSystem = "P", **_options) -> dict:
    if not 1 <= days <= MAX_DAYS:
        raise ValueError(f"days must be between 1 and {MAX_DAYS}")
    tz = ZoneInfo(timezone_name)
    first = start or datetime.now(tz).date()
    bounds = [_local_midnight(first + timedelta(days=i), tz) for i in range(days + 1)]
    a, b = bounds[0], bounds[-1]

    chart = natal.calculate(birth, house_system=house_system)
    unknown = chart["meta"]["timeUnknown"]
    cusps = [h["longitude"] for h in chart["houses"]] if chart["houses"] and not unknown else None

    ingresses = sky_moon.moon_ingresses(a, b)
    voc = sky_moon.void_of_course(a, b)

    house_events: list[tuple[float, int]] = []
    if cusps:
        times = _grid(a, b, DAY_STEP)
        moon = [_moon(t) for t in times]
        for i, cusp in enumerate(cusps):
            values = [_diff(m - cusp) for m in moon]
            house_events += [(jd, i + 1) for jd in _crossings(times, values, lambda jd, c=cusp: _diff(_moon(jd) - c))]
        house_events.sort()

    out = []
    for i, (d0, d1) in enumerate(zip(bounds, bounds[1:])):
        noon = (d0 + d1) / 2
        elongation = norm(longitude("moon", noon)[0] - longitude("sun", noon)[0])
        sign_now = next((s for jd, s in reversed(ingresses) if jd <= d0), SIGNS[int(norm(_moon(d0)) // 30)])
        signs = [{"sign": sign_now, "from": None}] + [{"sign": s, "from": iso_from_jd(jd)}
                                                       for jd, s in ingresses if d0 < jd < d1]
        houses = None
        if cusps:
            current = next((h for jd, h in reversed(house_events) if jd <= d0), house_of(_moon(d0), cusps))
            inside = [(jd, h) for jd, h in house_events if d0 < jd < d1]
            marks = [(d0, current)] + inside
            ends = [jd for jd, _ in inside] + [d1]
            houses = [{"house": h, "from": iso_from_jd(m), "to": iso_from_jd(e)} for (m, h), e in zip(marks, ends)]
        periods = []
        for v in voc:
            vs, ve = jd_of(datetime.fromisoformat(v["start"])), jd_of(datetime.fromisoformat(v["end"]))
            clipped = _clip(vs, ve, d0, d1)
            if clipped:
                periods.append({"start": iso_from_jd(clipped[0]), "end": iso_from_jd(clipped[1]),
                                "sign": v["sign"], "nextSign": v["nextSign"],
                                "continuesBefore": vs < d0, "continuesAfter": ve > d1})
        out.append({
            "date": (first + timedelta(days=i)).isoformat(),
            "start": iso_from_jd(d0), "end": iso_from_jd(d1),
            "phase": PHASES[int(((elongation + 22.5) % 360) // 45)],
            "waxing": elongation < 180,
            "illumination": round((1 - math.cos(math.radians(elongation))) / 2, 3),
            "signs": signs,
            "houses": houses,
            "voidOfCourse": periods,
            "retrograde": [p for p in RETROGRADE_CHECK if longitude(p, noon)[1] < 0],
        })
    return {
        "module": MODULE_ID,
        "meta": {"engineVersion": MODULE_VERSION, "timeUnknown": unknown, "timezone": timezone_name,
                 "houseSystem": chart["meta"]["houseSystem"], "voc": "modern-ptolemaic",
                 "retrogradeAt": "local noon"},
        "start": first.isoformat(),
        "days": out,
    }


__all__ = ["calculate", "MODULE_ID"]
