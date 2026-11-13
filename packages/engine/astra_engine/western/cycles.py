"""Life cycles from the natal chart.

- Planetary returns: every moment Jupiter, Saturn or Chiron comes back to its natal longitude within
  ``HORIZON_YEARS`` of birth. Because of retrograde motion one return can have one or three exact passes; passes
  closer than ``GROUP_GAP_DAYS`` belong to the same return.
- Annual profections (Hellenistic): at age N the year is "activated" from the Ascendant sign + N whole signs;
  the traditional ruler of that sign is the lord of the year. Needs a birth time (the Ascendant).

Positions come straight from pyswisseph with the bundled ephemeris files; crossings are found with a coarse scan
and refined by bisection to well under a minute of time.
"""
from __future__ import annotations

from datetime import date as Date, datetime, time, timedelta, timezone

from .._backend import swe
from ..common.birth import BirthData, resolve_utc
from ..common.zodiac import SIGNS, sign_index
from .dignities import rulers_of
from . import natal

MODULE_ID = "western.cycles"
MODULE_VERSION = "0.1.0"

HORIZON_YEARS = 100
EPHEMERIS_END_JD = swe.julday(2999, 12, 31, 0)  # bundled *_24.se1 files end in 2999
GROUP_GAP_DAYS = 730
FLAGS = swe.FLG_SWIEPH | swe.FLG_SPEED
# body id -> (swisseph id, mean period in years, minimum scan step in days, speed bound in degrees/day).
# The bound is above the body's fastest geocentric motion (checked in tests), so far from the natal degree the
# scan can jump (distance / bound) days without missing a crossing.
BODIES = {
    "jupiter": (swe.JUPITER, 11.86, 2.0, 0.3),
    "saturn": (swe.SATURN, 29.46, 3.0, 0.17),
    "chiron": (swe.CHIRON, 50.7, 3.0, 0.2),
}


def _jd(dt: datetime) -> float:
    return swe.julday(dt.year, dt.month, dt.day, dt.hour + dt.minute / 60 + dt.second / 3600)


def _iso(jd: float) -> str:
    y, m, d, h = swe.revjul(jd)
    dt = datetime(y, m, d, tzinfo=timezone.utc) + timedelta(hours=h)
    return dt.replace(microsecond=0).isoformat().replace("+00:00", "Z")


def _offset(jd: float, body: int, natal_lon: float) -> float:
    """Signed distance of the transiting body from its natal longitude, in (-180, 180]."""
    lon = swe.calc_ut(jd, body, FLAGS)[0][0]
    return (lon - natal_lon + 180) % 360 - 180


def find_passes(body: int, natal_lon: float, start_jd: float, end_jd: float, step: float,
                max_speed: float) -> list[dict]:
    passes = []
    a, fa = start_jd, _offset(start_jd, body, natal_lon)
    while a < end_jd:
        b = min(a + max(step, (abs(fa) - 1.0) / max_speed), end_jd)
        fb = _offset(b, body, natal_lon)
        # A sign change near 0 (not the ±180 wrap) means the body crossed its natal degree
        if (fa < 0) != (fb < 0) and abs(fa - fb) < 90:
            lo, hi, flo = a, b, fa
            for _ in range(40):
                mid = (lo + hi) / 2
                fm = _offset(mid, body, natal_lon)
                if (fm < 0) == (flo < 0):
                    lo, flo = mid, fm
                else:
                    hi = mid
            exact = (lo + hi) / 2
            speed = swe.calc_ut(exact, body, FLAGS)[0][3]
            passes.append({"jd": exact, "retrograde": speed < 0})
        a, fa = b, fb
    return passes


def planet_returns(birth_jd: float, natal_lons: dict[str, float], today_jd: float) -> dict:
    out = {}
    for pid, (body, period, step, max_speed) in BODIES.items():
        # Skip the first part of the cycle: retrograde loops right after birth are not returns
        horizon_jd = min(birth_jd + HORIZON_YEARS * 365.25, EPHEMERIS_END_JD - GROUP_GAP_DAYS)
        # Scan past the horizon so a return that starts inside it keeps all its passes
        passes = find_passes(body, natal_lons[pid], birth_jd + period * 365.25 * 0.5,
                             horizon_jd + GROUP_GAP_DAYS, step, max_speed)
        groups: list[list[dict]] = []
        for p in passes:
            if groups and p["jd"] - groups[-1][-1]["jd"] < GROUP_GAP_DAYS:
                groups[-1].append(p)
            else:
                groups.append([p])
        groups = [g for g in groups if g[0]["jd"] <= horizon_jd]
        out[pid] = [{
            "number": i + 1,
            "ageYears": round((g[0]["jd"] - birth_jd) / 365.25, 1),
            "passes": [{"at": _iso(p["jd"]), "retrograde": p["retrograde"]} for p in g],
            "status": "past" if g[-1]["jd"] < today_jd else ("now" if g[0]["jd"] <= today_jd else "future"),
        } for i, g in enumerate(groups)]
    return out


def _age(born: Date, on: Date) -> int:
    return on.year - born.year - ((on.month, on.day) < (born.month, born.day))


def _birthday(born: Date, year: int) -> Date:
    try:
        return born.replace(year=year)
    except ValueError:  # 29 February in a common year
        return Date(year, 3, 1)


def profections(born: Date, asc_lon: float, natal_points: list[dict], on: Date, years: int = 12) -> dict:
    where = {p["id"]: p for p in natal_points}
    asc = sign_index(asc_lon)
    age_now = _age(born, on)

    def year(age: int) -> dict:
        sign = SIGNS[(asc + age) % 12]
        lord = rulers_of(sign)[0]  # traditional ruler
        return {
            "age": age, "start": _birthday(born, born.year + age).isoformat(),
            "end": (_birthday(born, born.year + age + 1) - timedelta(days=1)).isoformat(),
            "house": age % 12 + 1, "sign": sign, "lord": lord,
            "lordNatal": {"sign": where[lord]["sign"], "house": where[lord]["house"]} if lord in where else None,
        }

    return {"current": year(age_now), "years": [year(a) for a in range(age_now, age_now + years)]}


def calculate(birth: BirthData, on: Date | None = None, **_options) -> dict:
    on = on or Date.today()
    chart = natal.calculate(birth)
    resolved = resolve_utc(birth.date, birth.time or time(12, 0), birth.timezone)
    birth_jd = _jd(resolved.utc)
    today_jd = _jd(datetime(on.year, on.month, on.day, 12, tzinfo=timezone.utc))
    lons = {p["id"]: p["longitude"] for p in chart["points"]}
    return {
        "module": MODULE_ID,
        "meta": {"engineVersion": MODULE_VERSION, "horizonYears": HORIZON_YEARS, "profections": "whole-sign",
                 "rulers": "traditional", "timeUnknown": birth.time_unknown},
        "input": {"date": birth.date.isoformat(), "on": on.isoformat()},
        "returns": planet_returns(birth_jd, lons, today_jd),
        "profections": None if birth.time_unknown else profections(
            birth.date, chart["angles"]["asc"]["longitude"], chart["points"], on),
    }


__all__ = ["calculate", "find_passes", "profections", "MODULE_ID", "MODULE_VERSION"]
