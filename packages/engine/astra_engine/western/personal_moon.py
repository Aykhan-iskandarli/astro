"""The Moon in YOUR chart: today's path through the natal houses and its exact aspects to natal points, and the
lunations (New, First Quarter, Full, Last Quarter Moons) and eclipses with the natal house and aspects they touch.

All moments are found by sampling the Moon's longitude on a fine grid and refining sign changes by bisection
(well under a second), the same method as `sky.moon`. Natal points are held still. Output instants are UTC.
Without a birth time there are no houses or angles, and the natal Moon (which moves ~13° a day) is not used.
"""
from __future__ import annotations

import warnings
from datetime import date, datetime, timedelta, timezone

from ..common.birth import BirthData, HouseSystem
from ..common.zodiac import SIGNS, house_of, lunar_mansion, norm, sign_of, split_degree
from ..sky.common import iso_from_jd, jd_of, longitude
from . import natal
from .aspects import AspectPoint, find_cross_aspects
from .transits import TRANSIT_ORBS

MODULE_ID = "western.personalmoon"
MODULE_VERSION = "0.1.0"
MAX_HOURS = 72
MAX_DAYS = 400
DAY_STEP = 1 / 24       # the Moon moves at most ~0.62°/h: an hourly grid cannot miss a crossing
LUNATION_STEP = 1 / 12  # elongation changes by at most ~0.7°/h: a 2-hour grid cannot miss one either
ASPECTS = {"conjunction": (0,), "sextile": (60, -60), "square": (90, -90), "trine": (120, -120), "opposition": (180,)}
TARGETS = ["sun", "moon", "mercury", "venus", "mars", "jupiter", "saturn", "uranus", "neptune", "pluto",
           "northNode", "chiron"]
PHASES = {0: "new", 90: "first_quarter", 180: "full", 270: "last_quarter"}


def _diff(x: float) -> float:
    return (x + 180.0) % 360.0 - 180.0


def _moon(jd: float) -> float:
    return longitude("moon", jd)[0]


def _grid(a: float, b: float, step: float) -> list[float]:
    n = max(1, int(-(-(b - a) // step)))
    return [a + i * (b - a) / n for i in range(n + 1)]


def _crossings(times: list[float], values: list[float], f) -> list[float]:
    """Moments where f (an angle difference in (-180, 180]) changes sign through zero. `values` are f on `times`."""
    out = []
    for i in range(len(values) - 1):
        fa, fb = values[i], values[i + 1]
        if fa == 0.0:
            out.append(times[i])
        elif (fa < 0) != (fb < 0) and abs(fa - fb) < 90:
            lo, hi, flo = times[i], times[i + 1], fa
            for _ in range(40):
                mid = (lo + hi) / 2
                fm = f(mid)
                if (fm < 0) == (flo < 0):
                    lo, flo = mid, fm
                else:
                    hi = mid
            out.append((lo + hi) / 2)
    return out


def _position(lon: float, cusps: list[float] | None) -> dict:
    d, m, s = split_degree(lon)
    return {"longitude": round(norm(lon), 6), "sign": sign_of(lon), "degree": d, "minute": m, "second": s,
            "house": house_of(lon, cusps) if cusps else None, "mansion": lunar_mansion(lon)}


def _natal(birth: BirthData, house_system: HouseSystem):
    chart = natal.calculate(birth, house_system=house_system)
    known = not chart["meta"]["timeUnknown"]
    targets = {p["id"]: p["longitude"] for p in chart["points"]
               if p["id"] in TARGETS and (known or p["id"] != "moon")}
    if known and chart["angles"]:
        targets.update({a: chart["angles"][a]["longitude"] for a in ("asc", "mc")})
    cusps = [h["longitude"] for h in chart["houses"]] if chart["houses"] else None
    return chart, targets, cusps, not known


def day(birth: BirthData, start: datetime, hours: int = 24, house_system: HouseSystem = "P") -> dict:
    """The Moon's day: position at `start`, then every sign change, natal-house change and exact aspect to a natal
    point in the next `hours` hours, in order."""
    if not 1 <= hours <= MAX_HOURS:
        raise ValueError(f"hours must be between 1 and {MAX_HOURS}")
    chart, targets, cusps, unknown = _natal(birth, house_system)
    a = jd_of(start)
    b = a + hours / 24
    times = _grid(a, b, DAY_STEP)
    moon = [_moon(t) for t in times]

    events = []

    def add(kind: str, jds: list[float], **extra):
        events.extend({"type": kind, "at": iso_from_jd(jd), "_jd": jd, **extra} for jd in jds)

    for tid, tlon in targets.items():
        for name, angles in ASPECTS.items():
            for ang in angles:
                values = [_diff(m - tlon - ang) for m in moon]
                add("aspect", _crossings(times, values, lambda jd, t=tlon, g=ang: _diff(_moon(jd) - t - g)),
                    point=tid, aspect=name)
    for k, sign in enumerate(SIGNS):
        edge = k * 30.0
        values = [_diff(m - edge) for m in moon]
        add("sign", _crossings(times, values, lambda jd, e=edge: _diff(_moon(jd) - e)), sign=sign)
    for i, cusp in enumerate(cusps or []):
        values = [_diff(m - cusp) for m in moon]
        add("house", _crossings(times, values, lambda jd, c=cusp: _diff(_moon(jd) - c)), house=i + 1)

    events.sort(key=lambda e: e["_jd"])
    for e in events:
        del e["_jd"]
    return {
        "module": MODULE_ID,
        "meta": {"engineVersion": MODULE_VERSION, "timeUnknown": unknown, "houseSystem": chart["meta"]["houseSystem"],
                 "mansions": "28 equal parts from 0° Aries"},
        "start": iso_from_jd(a),
        "hours": hours,
        "moon": {**_position(moon[0], cusps), "speed": round(longitude("moon", a)[1], 4)},
        "events": events,
    }


def _eclipses(start: date, end: date) -> list:
    from kerykeion import EclipseFactory  # noqa: E402  (after _backend; imported lazily because it is slow to build)
    with warnings.catch_warnings():
        warnings.simplefilter("ignore")
        found = EclipseFactory.search_global(start_year=start.year, count=6 * (end.year - start.year + 1))
    return [("solar", x) for x in found.solar_eclipses] + [("lunar", x) for x in found.lunar_eclipses]


def lunations(birth: BirthData, start: date, days: int = 90, house_system: HouseSystem = "P") -> dict:
    """Lunations and eclipses in [start, start+days) with the natal house of the Moon's degree and the natal points
    it touches (transit orbs: 3° for conjunction/opposition/square/trine, 2° for the sextile)."""
    if not 1 <= days <= MAX_DAYS:
        raise ValueError(f"days must be between 1 and {MAX_DAYS}")
    chart, targets, cusps, unknown = _natal(birth, house_system)
    a = jd_of(datetime(start.year, start.month, start.day, tzinfo=timezone.utc))
    b = a + days
    times = _grid(a, b, LUNATION_STEP)
    sun = [longitude("sun", t)[0] for t in times]
    moon = [_moon(t) for t in times]
    natal_points = [AspectPoint(tid, lon, 0.0, is_angle=tid in ("asc", "mc")) for tid, lon in targets.items()]

    eclipse_list = _eclipses(start, start + timedelta(days=days))
    out = []
    for elong, phase in PHASES.items():
        values = [_diff(m - s - elong) for m, s in zip(moon, sun)]
        for jd in _crossings(times, values, lambda t, e=elong: _diff(_moon(t) - longitude("sun", t)[0] - e)):
            lon = _moon(jd)
            found = find_cross_aspects([AspectPoint("lunation", lon, None)], natal_points, TRANSIT_ORBS)
            aspects = sorted(({"point": x["p2"], "aspect": x["type"], "orb": x["orb"]} for x in found),
                             key=lambda x: x["orb"])
            wanted = "solar" if phase == "new" else "lunar" if phase == "full" else None
            eclipse = next(({"kind": kind, "type": x.type} for kind, x in eclipse_list
                            if kind == wanted and abs(x.maximum_jd - jd) < 1.0), None)
            out.append({"phase": phase, "at": iso_from_jd(jd), "_jd": jd, **_position(lon, cusps),
                        "sunHouse": house_of(norm(lon + 180.0), cusps) if cusps and phase == "full" else None,
                        "aspects": aspects, "eclipse": eclipse})
    out.sort(key=lambda x: x["_jd"])
    for x in out:
        del x["_jd"]
    return {
        "module": MODULE_ID,
        "meta": {"engineVersion": MODULE_VERSION, "timeUnknown": unknown, "orbs": TRANSIT_ORBS,
                 "houseSystem": chart["meta"]["houseSystem"]},
        "start": start.isoformat(),
        "days": days,
        "lunations": out,
    }


def calculate(birth: BirthData, kind: str = "day", start: datetime | date | None = None, hours: int = 24,
              days: int = 90, house_system: HouseSystem = "P", **_options) -> dict:
    """kind 'day': the Moon's day from `start` (UTC datetime, default now); kind 'lunations': from `start` (date)."""
    if kind == "day":
        start = start if isinstance(start, datetime) else datetime.now(timezone.utc)
        return day(birth, start.astimezone(timezone.utc).replace(microsecond=0), hours, house_system)
    if kind == "lunations":
        d = start.date() if isinstance(start, datetime) else (start or datetime.now(timezone.utc).date())
        return lunations(birth, d, days, house_system)
    raise ValueError("kind must be 'day' or 'lunations'")
