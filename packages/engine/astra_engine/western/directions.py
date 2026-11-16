"""Directions: Solar Arc and secondary-progression events on a timeline.

Solar Arc: every natal planet and angle is moved forward by the same arc, the distance the secondary-progressed Sun has
travelled from the natal Sun (the true arc, about 0.99 degrees a year). A "hit" is the exact moment a directed point
makes a conjunction, sextile, square, trine or opposition to a natal point. The progressed Sun never turns retrograde,
so the arc grows steadily and each hit has one exact date, found by bisection on the progressed Sun.

Secondary progressions ("a day for a year", 365.2422 days): the progressed Sun, Moon, Mercury, Venus and Mars are
followed against the natal planets (and the Ascendant and Midheaven when the birth time is known). Their aspects are
found by sampling and bisection; progressed Mercury, Venus and Mars can turn retrograde and then touch a point more
than once, so every exact pass is reported. Progressed sign changes of the same five bodies are listed too.

The progressed Moon moves about 13 degrees a year, so it needs the birth time (a date-only chart is noon UTC and the
Moon and the angles are then left out, as in the transformations module).
"""
from __future__ import annotations

from datetime import datetime, time, timezone

from ..common.birth import BirthData, HouseSystem, resolve_utc
from ..common.zodiac import SIGNS, sign_index
from ..sky.common import iso_from_jd, jd_of, longitude
from . import natal

MODULE_ID = "western.directions"
MODULE_VERSION = "0.1.0"

TROPICAL_YEAR_DAYS = 365.2422
ASPECTS = {"conjunction": 0.0, "sextile": 60.0, "square": 90.0, "trine": 120.0, "opposition": 180.0}
PLANETS = ["sun", "moon", "mercury", "venus", "mars", "jupiter", "saturn", "uranus", "neptune", "pluto"]
PROGRESSED = ["sun", "moon", "mercury", "venus", "mars"]
ANGLES = ["asc", "mc"]
MAX_YEARS = 30
MAX_AGE = 110.0
STEP_DAYS = 20.0  # sampling step on the real calendar; the progressed Moon moves about 1.1 degrees in that time


def _wrap(x: float) -> float:
    return (x + 180.0) % 360.0 - 180.0


def _norm(x: float) -> float:
    return x % 360.0


def _sun_arc(birth_jd: float, natal_sun: float, age: float) -> float:
    """Degrees the progressed Sun has travelled from the natal Sun at `age` tropical years (a day for a year)."""
    return _wrap(longitude("sun", birth_jd + age)[0] - natal_sun)


def _solve_arc(birth_jd: float, natal_sun: float, target: float) -> float | None:
    """The age (tropical years) at which the arc equals `target` degrees, or None when it is not reached by MAX_AGE."""
    if not 0.0 <= target <= _sun_arc(birth_jd, natal_sun, MAX_AGE):
        return None
    lo, hi = 0.0, MAX_AGE
    for _ in range(50):
        mid = (lo + hi) / 2
        if _sun_arc(birth_jd, natal_sun, mid) < target:
            lo = mid
        else:
            hi = mid
    return (lo + hi) / 2


def _date(birth_utc_jd: float, age: float) -> float:
    """Calendar moment (Julian day) at which the person is `age` tropical years old."""
    return birth_utc_jd + age * 365.2422


def calculate(birth: BirthData, start_year: int | None = None, years: int = 10, house_system: HouseSystem = "P",
              **_options) -> dict:
    if not 1 <= years <= MAX_YEARS:
        raise ValueError(f"years must be between 1 and {MAX_YEARS}")
    first = start_year or datetime.now(timezone.utc).year
    if not 1800 <= first <= 2998 - years:
        raise ValueError("start year out of range")
    chart = natal.calculate(birth, house_system=house_system)
    known = not chart["meta"]["timeUnknown"]
    birth_utc = resolve_utc(birth.date, birth.time or time(12, 0), birth.timezone).utc
    birth_jd = jd_of(birth_utc)
    natal_lon = {p["id"]: p["longitude"] for p in chart["points"] if p["id"] in PLANETS}
    if known and chart["angles"]:
        natal_lon.update({a: chart["angles"][a]["longitude"] for a in ANGLES})
    if not known:
        natal_lon.pop("moon", None)
    directed_ids = [i for i in PLANETS + ANGLES if i in natal_lon]
    natal_sun = natal_lon["sun"]

    window_a = jd_of(datetime(first, 1, 1, tzinfo=timezone.utc))
    window_b = jd_of(datetime(first + years, 1, 1, tzinfo=timezone.utc))
    age_a = max(0.0, (window_a - birth_jd) / 365.2422)
    age_b = (window_b - birth_jd) / 365.2422

    def item(base: dict, jd: float) -> dict:
        return {**base, "at": iso_from_jd(jd), "age": round((jd - birth_jd) / 365.2422, 2)}

    # Solar Arc hits
    arc_hits = []
    for p in directed_ids:
        for q in directed_ids:
            if p == q or (p in ANGLES and q in ANGLES):
                continue
            for aspect, angle in ASPECTS.items():
                for off in ((angle,) if angle in (0.0, 180.0) else (angle, -angle)):
                    target = _norm(natal_lon[q] - natal_lon[p] + off)
                    age = _solve_arc(birth_jd, natal_sun, target)
                    if age is None or not age_a <= age <= age_b:
                        continue
                    arc_hits.append(item({"directed": p, "natal": q, "aspect": aspect, "arc": round(target, 3)}, _date(birth_jd, age)))
    arc_hits.sort(key=lambda h: h["at"])

    # Secondary progressions: aspects to natal points, and sign changes
    times: list[float] = []
    t = window_a
    while t <= window_b:
        times.append(t)
        t += STEP_DAYS
    prog_jd = lambda t: birth_jd + (t - birth_jd) / TROPICAL_YEAR_DAYS  # noqa: E731

    progressed, ingresses = [], []
    for pid in [p for p in PROGRESSED if p in natal_lon]:
        lons = [longitude(pid, prog_jd(t))[0] for t in times]
        for tid, tlon in natal_lon.items():
            if tid == pid:
                continue
            for aspect, angle in ASPECTS.items():
                for off in ((angle,) if angle in (0.0, 180.0) else (angle, -angle)):
                    vals = [_wrap(x - tlon - off) for x in lons]
                    for i in range(len(vals) - 1):
                        fa, fb = vals[i], vals[i + 1]
                        if fa == 0.0 or ((fa < 0) != (fb < 0) and abs(fa) < 30 and abs(fb) < 30):
                            lo, hi, flo = times[i], times[i + 1], fa
                            jd = lo
                            if fa != 0.0:
                                for _ in range(40):
                                    mid = (lo + hi) / 2
                                    fm = _wrap(longitude(pid, prog_jd(mid))[0] - tlon - off)
                                    if (fm < 0) == (flo < 0):
                                        lo, flo = mid, fm
                                    else:
                                        hi = mid
                                jd = (lo + hi) / 2
                            progressed.append(item({"progressed": pid, "natal": tid, "aspect": aspect,
                                                    "retrograde": longitude(pid, prog_jd(jd))[1] < 0}, jd))
        for i in range(len(lons) - 1):
            ia, ib = sign_index(lons[i]), sign_index(lons[i + 1])
            if ia != ib:
                lo, hi = times[i], times[i + 1]
                for _ in range(40):
                    mid = (lo + hi) / 2
                    if sign_index(longitude(pid, prog_jd(mid))[0]) == ia:
                        lo = mid
                    else:
                        hi = mid
                jd = (lo + hi) / 2
                ingresses.append(item({"progressed": pid, "sign": SIGNS[ib],
                                       "retrograde": longitude(pid, prog_jd(jd))[1] < 0}, jd))
    progressed.sort(key=lambda h: h["at"])
    ingresses.sort(key=lambda h: h["at"])
    return {
        "module": MODULE_ID,
        "meta": {"engineVersion": MODULE_VERSION, "timeUnknown": not known, "houseSystem": chart["meta"]["houseSystem"],
                 "progressionYearDays": TROPICAL_YEAR_DAYS},
        "from": first, "to": first + years - 1,
        "solarArc": arc_hits, "progressed": progressed, "ingresses": ingresses,
    }


__all__ = ["calculate", "MODULE_ID"]
