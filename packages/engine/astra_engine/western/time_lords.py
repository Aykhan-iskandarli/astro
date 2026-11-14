"""Traditional timing techniques: annual profections, firdaria and solar arc directions.

* Profections (whole sign): at age N the Ascendant sign advances N signs; the "lord of the year" is the
  traditional ruler of that sign and the activated house is (N mod 12) + 1.
* Firdaria (Persian periods): fixed-length planetary periods in a day or night sequence; each planetary
  period is split into seven equal sub-periods following the same order from the period's own lord.
  Day:   Sun 10, Venus 8, Mercury 13, Moon 9, Saturn 11, Jupiter 12, Mars 7, North Node 3, South Node 2
  Night: Moon 9, Saturn 11, Jupiter 12, Mars 7, Sun 10, Venus 8, Mercury 13, North Node 3, South Node 2
  Years are Julian years (365.25 days), the same convention as kerykeion's FirdariaFactory.
* Solar arc: the progressed Sun's advance (day for a year) is added to every natal point.
"""
from __future__ import annotations

from datetime import date, datetime, time, timedelta, timezone

from .._backend import swe
from ..common.birth import BirthData, HouseSystem, resolve_utc
from ..common.zodiac import SIGNS, norm, sign_of, split_degree
from ..sky.common import jd_of
from . import natal
from .aspects import AspectPoint, find_cross_aspects
from .dignities import TRADITIONAL_RULER

MODULE_ID = "western.timelords"
MODULE_VERSION = "0.1.0"

JULIAN_YEAR = 365.25
TROPICAL_YEAR = 365.2422
PLANETS7 = ["sun", "venus", "mercury", "moon", "saturn", "jupiter", "mars"]
YEARS = {"sun": 10, "venus": 8, "mercury": 13, "moon": 9, "saturn": 11, "jupiter": 12, "mars": 7,
         "northNode": 3, "southNode": 2}
DAY_ORDER = ["sun", "venus", "mercury", "moon", "saturn", "jupiter", "mars", "northNode", "southNode"]
NIGHT_ORDER = ["moon", "saturn", "jupiter", "mars", "sun", "venus", "mercury", "northNode", "southNode"]
LIFE_YEARS = 90
DIRECTED = ["sun", "moon", "mercury", "venus", "mars", "jupiter", "saturn", "uranus", "neptune", "pluto"]
ARC_ORBS = {"conjunction": 1.0, "opposition": 1.0, "square": 1.0, "trine": 1.0, "sextile": 1.0}


def _iso(dt: datetime) -> str:
    return dt.astimezone(timezone.utc).replace(microsecond=0).isoformat().replace("+00:00", "Z")


def _age(birth_date: date, on: date) -> int:
    return on.year - birth_date.year - ((on.month, on.day) < (birth_date.month, birth_date.day))


def _anniversary(birth_date: date, years: int) -> date:
    try:
        return birth_date.replace(year=birth_date.year + years)
    except ValueError:  # 29 February -> 1 March in common years
        return date(birth_date.year + years, 3, 1)


def profections(birth_date: date, asc_sign: str, on: date, before: int = 3, after: int = 4) -> dict:
    current = _age(birth_date, on)
    years = []
    for age in range(max(0, current - before), current + after + 1):
        sign = SIGNS[(SIGNS.index(asc_sign) + age) % 12]
        years.append({"age": age, "house": age % 12 + 1, "sign": sign, "lord": TRADITIONAL_RULER[sign],
                      "start": _anniversary(birth_date, age).isoformat(),
                      "end": _anniversary(birth_date, age + 1).isoformat()})
    return {"currentAge": current, "years": years}


def firdaria(birth_utc: datetime, diurnal: bool, on: datetime) -> dict:
    order = DAY_ORDER if diurnal else NIGHT_ORDER
    periods, t, age = [], birth_utc, 0
    while age < LIFE_YEARS:
        for lord in order:
            length = YEARS[lord]
            start, end = t, t + timedelta(days=length * JULIAN_YEAR)
            subs = []
            if lord in PLANETS7:
                step = (end - start) / 7
                first = PLANETS7.index(lord)
                for k in range(7):
                    sub_lord = PLANETS7[(first + k) % 7]
                    subs.append({"lord": sub_lord, "start": _iso(start + step * k), "end": _iso(start + step * (k + 1)),
                                 "current": start + step * k <= on < start + step * (k + 1)})
            periods.append({"lord": lord, "years": length, "ageStart": age, "ageEnd": age + length,
                            "start": _iso(start), "end": _iso(end), "current": start <= on < end, "subPeriods": subs})
            t, age = end, age + length
            if age >= LIFE_YEARS:
                break
    return {"diurnal": diurnal, "sequence": "day" if diurnal else "night", "periods": periods}


def solar_arc(birth_utc: datetime, on: datetime, chart: dict) -> dict:
    age_years = (on - birth_utc).total_seconds() / 86400 / TROPICAL_YEAR
    jd_birth = jd_of(birth_utc)
    sun_natal = swe.calc_ut(jd_birth, swe.SUN, swe.FLG_SWIEPH)[0][0]
    progressed = swe.calc_ut(jd_birth + age_years, swe.SUN, swe.FLG_SWIEPH | swe.FLG_SPEED)[0]
    sun_prog, sun_speed = progressed[0], progressed[3]
    arc = norm(sun_prog - sun_natal)
    rate = sun_speed / TROPICAL_YEAR  # degrees per real day, used only for applying/separating

    natal_lon = {p["id"]: p["longitude"] for p in chart["points"] if p["id"] in DIRECTED}
    if chart["angles"]:
        natal_lon.update({a: chart["angles"][a]["longitude"] for a in ("asc", "mc")})
    directed = []
    for pid, lon in natal_lon.items():
        d, m, s = split_degree(lon + arc)
        directed.append({"id": pid, "longitude": round(norm(lon + arc), 6), "sign": sign_of(lon + arc),
                         "degree": d, "minute": m, "second": s})
    moving = [AspectPoint(p["id"], p["longitude"], rate, is_angle=p["id"] in ("asc", "mc")) for p in directed]
    targets = [AspectPoint(pid, lon, 0.0, is_angle=pid in ("asc", "mc")) for pid, lon in natal_lon.items()]
    aspects = [a for a in find_cross_aspects(moving, targets, ARC_ORBS, moving="first") if a["p1"] != a["p2"]]
    return {"arc": round(arc, 6), "ageYears": round(age_years, 4), "points": directed, "aspects": aspects,
            "orbs": ARC_ORBS}


def calculate(birth: BirthData, on: date | None = None, house_system: HouseSystem = "P", **_options) -> dict:
    """All three techniques for the date `on` (default: today, UTC). Needs the birth time."""
    if birth.time is None:
        raise ValueError("timing techniques need an exact birth time")
    on = on or datetime.now(timezone.utc).date()
    on_dt = datetime.combine(on, time(12, 0), tzinfo=timezone.utc)
    birth_utc = resolve_utc(birth.date, birth.time, birth.timezone).utc
    chart = natal.calculate(birth, house_system=house_system)
    return {
        "module": MODULE_ID,
        "meta": {"engineVersion": MODULE_VERSION, "firdariaYear": JULIAN_YEAR, "arcYear": TROPICAL_YEAR,
                 "rulers": "traditional"},
        "on": on.isoformat(),
        "profections": profections(birth.date, chart["angles"]["asc"]["sign"], on),
        "firdaria": firdaria(birth_utc, chart["sect"] == "day", on_dt),
        "solarArc": solar_arc(birth_utc, on_dt, chart),
    }
