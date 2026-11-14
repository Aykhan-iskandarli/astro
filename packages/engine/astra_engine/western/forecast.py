"""Forecast pieces built on the natal chart.

* ``lifeline``: for each slow planet (Jupiter..Pluto), the natal house and zodiac sign it occupies, as dated
  segments over several years. A segment boundary is the exact moment the planet crosses a house cusp (or a sign
  edge); retrograde motion produces the repeated crossings.
* ``retrogrades``: the retrograde periods of Mercury..Pluto in a date range with the sign/degree/natal house of
  each station and every natal house the planet passes through while retrograde.
* ``year``: everything for one calendar year in a single payload: the profection year(s), the Sun-return chart
  (Sun/Moon/Ascendant), the firdaria sub-periods, the slow planets' houses, the exact transits grouped by month,
  the New/Full Moons and eclipses with their natal houses, and the retrogrades.

Crossings are found by sampling longitudes on a fine grid and bisecting (well under a minute of time); the periods
of retrogrades and the eclipses come from kerykeion, the same source as the astro calendar. Without a birth time
there are no houses: signs, transits and retrogrades are still returned.
"""
from __future__ import annotations

import warnings
from datetime import date, datetime, time, timedelta, timezone

from ..common.birth import BirthData, HouseSystem, resolve_utc
from ..common.zodiac import SIGNS, house_of, norm, sign_index, sign_of, split_degree
from ..sky.common import iso_from_jd, jd_of, kery_planet, longitude
from . import cycles, natal, personal_moon, returns, timeline

MODULE_ID = "western.forecast"
MODULE_VERSION = "0.1.0"

SLOW = ["jupiter", "saturn", "uranus", "neptune", "pluto"]
RETRO_PLANETS = ["mercury", "venus", "mars", "jupiter", "saturn", "uranus", "neptune", "pluto"]
MAX_YEARS = 30
STEP = 0.5  # days; the slowest crossing pair (a station right on a cusp) still needs the planet within 0.05°


def _diff(x: float) -> float:
    return (x + 180.0) % 360.0 - 180.0


def _day(d: date) -> float:
    return jd_of(datetime(d.year, d.month, d.day, tzinfo=timezone.utc))


def _crossings(pid: str, times: list[float], lons: list[float], edge: float) -> list[float]:
    """Moments where the planet crosses `edge`. `lons` are its longitudes on `times` (shared by every edge)."""
    vals = [_diff(x - edge) for x in lons]
    out = []
    for i in range(len(times) - 1):
        fa, fb = vals[i], vals[i + 1]
        if fa == 0.0:
            out.append(times[i])
        elif (fa < 0) != (fb < 0) and abs(fa - fb) < 90:
            lo, hi, flo = times[i], times[i + 1], fa
            for _ in range(40):
                mid = (lo + hi) / 2
                fm = _diff(longitude(pid, mid)[0] - edge)
                if (fm < 0) == (flo < 0):
                    lo, flo = mid, fm
                else:
                    hi = mid
            out.append((lo + hi) / 2)
    return out


def segments(pid: str, a: float, b: float, edges: list[float], index_of) -> list[dict]:
    """The planet's occupant of the regions bounded by `edges` (cusps or sign edges) between a and b, as segments.
    `index_of(lon)` gives the region number (1-based) of a longitude."""
    n = max(1, int(-(-(b - a) // STEP)))
    times = [a + i * (b - a) / n for i in range(n + 1)]
    lons = [longitude(pid, t)[0] for t in times]  # computed once, shared by every edge
    cuts = sorted(jd for e in edges for jd in _crossings(pid, times, lons, e) if a < jd < b)
    bounds = [a] + cuts + [b]
    out: list[dict] = []
    for lo, hi in zip(bounds, bounds[1:]):
        region = index_of(longitude(pid, (lo + hi) / 2)[0])
        if out and out[-1]["region"] == region:
            out[-1]["_end"] = hi
        else:
            out.append({"region": region, "_start": lo, "_end": hi})
    return [{"region": s["region"], "start": iso_from_jd(s["_start"]), "end": iso_from_jd(s["_end"]),
             "startClipped": s["_start"] == a, "endClipped": s["_end"] == b} for s in out]


def _spot(jd: float, pid: str, cusps: list[float] | None) -> dict:
    lon = longitude(pid, jd)[0]
    d, m, _ = split_degree(lon)
    return {"at": iso_from_jd(jd), "longitude": round(norm(lon), 4), "sign": sign_of(lon), "degree": d, "minute": m,
            "house": house_of(lon, cusps) if cusps else None}


def _natal(birth: BirthData, house_system: HouseSystem):
    chart = natal.calculate(birth, house_system=house_system)
    cusps = [h["longitude"] for h in chart["houses"]] if chart["houses"] else None
    return chart, cusps


def lifeline(birth: BirthData, start: date, years: int = 15, house_system: HouseSystem = "P") -> dict:
    if not 1 <= years <= MAX_YEARS:
        raise ValueError(f"years must be between 1 and {MAX_YEARS}")
    chart, cusps = _natal(birth, house_system)
    a = _day(start)
    b = _day(date(min(start.year + years, 2999), start.month, min(start.day, 28)))
    sign_edges = [k * 30.0 for k in range(12)]
    planets = {}
    for pid in SLOW:
        planets[pid] = {
            "houses": segments(pid, a, b, cusps, lambda lon: house_of(lon, cusps)) if cusps else None,
            "signs": [{**s, "sign": SIGNS[s.pop("region") - 1]} for s in
                      segments(pid, a, b, sign_edges, lambda lon: sign_index(lon) + 1)],
        }
    return {"module": MODULE_ID, "kind": "lifeline",
            "meta": {"engineVersion": MODULE_VERSION, "timeUnknown": chart["meta"]["timeUnknown"],
                     "houseSystem": chart["meta"]["houseSystem"]},
            "start": iso_from_jd(a), "end": iso_from_jd(b), "planets": planets}


def retrogrades(birth: BirthData, start: date, days: int = 365, house_system: HouseSystem = "P") -> dict:
    if not 1 <= days <= 800:
        raise ValueError("days must be between 1 and 800")
    from kerykeion import RetrogradeStationFactory  # noqa: E402  (after _backend)
    chart, cusps = _natal(birth, house_system)
    s = start.isoformat()
    e = (start + timedelta(days=days)).isoformat()
    with warnings.catch_warnings():
        warnings.simplefilter("ignore")
        found = RetrogradeStationFactory.retrograde_periods_from_iso_range(s, e)
    out = []
    for p in found.periods:
        pid = kery_planet(p.planet)
        if pid not in RETRO_PLANETS:
            continue
        a, b = jd_of(datetime.fromisoformat(p.start.replace("Z", "+00:00"))), jd_of(datetime.fromisoformat(p.end.replace("Z", "+00:00")))
        visited = []
        if cusps:
            visited = [seg["region"] for seg in segments(pid, a, b, cusps, lambda lon: house_of(lon, cusps))]
        out.append({"planet": pid, "start": p.start, "end": p.end, "startClipped": p.start_clipped,
                    "endClipped": p.end_clipped, "from": _spot(a, pid, cusps), "to": _spot(b, pid, cusps),
                    "houses": visited})
    out.sort(key=lambda x: x["start"])
    return {"module": MODULE_ID, "kind": "retrogrades",
            "meta": {"engineVersion": MODULE_VERSION, "timeUnknown": chart["meta"]["timeUnknown"],
                     "houseSystem": chart["meta"]["houseSystem"]},
            "start": s, "end": e, "retrogrades": out}


def _overlaps(start: str, end: str, lo: str, hi: str) -> bool:
    return start[:10] <= hi and end[:10] >= lo


def _firdaria(birth: BirthData, chart_birth_utc: datetime, lo: date, hi: date, house_system: HouseSystem) -> dict | None:
    from kerykeion import FirdariaFactory  # noqa: E402
    subject = natal.build_subject(birth, chart_birth_utc, house_system)
    with warnings.catch_warnings():
        warnings.simplefilter("ignore")
        fd = FirdariaFactory.from_subject(subject, target_date=lo.isoformat(), life_cap_years=100).model_dump()
    periods = []
    for p in fd["periods"]:
        if not _overlaps(p["start"], p["end"], lo.isoformat(), hi.isoformat()):
            continue
        periods.append({"lord": kery_planet(p["lord"]), "start": p["start"], "end": p["end"],
                        "sub": [{"lord": kery_planet(x["lord"]), "start": x["start"], "end": x["end"]}
                                for x in p.get("sub_periods") or []
                                if _overlaps(x["start"], x["end"], lo.isoformat(), hi.isoformat())]})
    return {"diurnal": fd["is_diurnal"], "periods": periods}


def year_forecast(birth: BirthData, year_: int, house_system: HouseSystem = "P") -> dict:
    """One calendar year, read in the natal chart."""
    if not 1800 <= year_ <= 2998:
        raise ValueError("year must be between 1800 and 2998")
    lo, hi = date(year_, 1, 1), date(year_, 12, 31)
    days = (date(year_ + 1, 1, 1) - lo).days
    chart, cusps = _natal(birth, house_system)
    unknown = chart["meta"]["timeUnknown"]

    prof = None
    if not unknown:
        p = cycles.profections(birth.date, chart["angles"]["asc"]["longitude"], chart["points"], lo, years=2)
        prof = [y for y in p["years"] if _overlaps(y["start"], y["end"], lo.isoformat(), hi.isoformat())]
    ret = returns.calculate(birth, kind="solar", year=year_, house_system=house_system)
    by_id = {x["id"]: x for x in ret["chart"]["points"]}
    asc = (ret["chart"]["angles"] or {}).get("asc")
    solar = {"at": ret["at"], "local": ret["local"], "sun": by_id["sun"], "moon": by_id["moon"],
             "asc": asc, "mc": (ret["chart"]["angles"] or {}).get("mc")} if not unknown else \
        {"at": ret["at"], "local": ret["local"], "sun": by_id["sun"], "moon": by_id["moon"], "asc": None, "mc": None}

    tl = timeline.calculate(birth, start=lo, days=days, house_system=house_system)
    events = tl["events"]
    months = [{"month": m, "hits": 0, "slowHits": 0} for m in range(1, 13)]
    for ev in events:
        m = int(ev["at"][5:7]) - 1
        months[m]["hits"] += 1
        if ev["transit"] != "mars":
            months[m]["slowHits"] += 1

    lun = personal_moon.lunations(birth, lo, days, house_system)
    lunations = [x for x in lun["lunations"] if x["phase"] in ("new", "full")]
    retro = retrogrades(birth, lo, days, house_system)["retrogrades"]
    line = lifeline(birth, lo, 1, house_system)

    birth_utc = resolve_utc(birth.date, birth.time or time(12, 0), birth.timezone).utc
    return {
        "module": MODULE_ID, "kind": "year",
        "meta": {"engineVersion": MODULE_VERSION, "timeUnknown": unknown, "houseSystem": chart["meta"]["houseSystem"],
                 "ranking": "months are ranked by the number of exact aspects from Jupiter-Pluto"},
        "year": year_,
        "profections": prof,
        "solarReturn": solar,
        "firdaria": _firdaria(birth, birth_utc, lo, hi, house_system),
        "slowPlanets": line["planets"],
        "transits": events,
        "months": months,
        "lunations": lunations,
        "retrogrades": retro,
    }


def calculate(birth: BirthData, kind: str = "year", start: date | None = None, years: int = 15, days: int = 365,
              year: int | None = None, house_system: HouseSystem = "P", **_options) -> dict:
    today = datetime.now(timezone.utc).date()
    if kind == "lifeline":
        return lifeline(birth, start or today, years, house_system)
    if kind == "retrogrades":
        return retrogrades(birth, start or today, days, house_system)
    if kind == "year":
        return year_forecast(birth, year or today.year, house_system)
    raise ValueError("kind must be 'lifeline', 'retrogrades' or 'year'")
