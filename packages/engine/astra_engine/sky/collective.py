"""The collective sky of one calendar year, independent of any birth chart.

What the slow planets (Jupiter to Pluto) and the Moon's North Node do in the year: the sign each stands in and every
sign change, the exact aspects the five planets make to each other, the eclipses and the retrograde periods. The signs
and the aspects are found by sampling the longitudes and bisecting each crossing (to the minute); the eclipses and the
retrograde periods come from the sky calendar.
"""
from __future__ import annotations

from datetime import date, datetime, timezone

from ..common.zodiac import SIGNS
from ..western.generation import _runs
from .calendar import calculate as calendar
from .common import iso_from_jd, jd_of, longitude

MODULE_ID = "sky.collective"
MODULE_VERSION = "0.1.0"

PLANETS = ["jupiter", "saturn", "uranus", "neptune", "pluto"]
BODIES = PLANETS + ["northNode"]
ASPECTS = {"conjunction": 0.0, "sextile": 60.0, "square": 90.0, "trine": 120.0, "opposition": 180.0}
STEP = 5.0        # days; the slowest relative motion here (Neptune-Pluto) is a few degrees a year, the fastest well under 1°/day
PASS_DAYS = 400.0  # exact hits of one pair and aspect closer than this belong to one retrograde cluster
PAD_YEARS = 1.5   # the neighbouring time searched so a cluster that straddles New Year is counted whole


def _day(d: date) -> float:
    return jd_of(datetime(d.year, d.month, d.day, tzinfo=timezone.utc))


def _wrap(x: float) -> float:
    return (x + 180.0) % 360.0 - 180.0


def _angle(a: str, b: str, jd: float) -> float:
    return (longitude(a, jd)[0] - longitude(b, jd)[0]) % 360.0


def _bisect(f, lo: float, hi: float) -> float:
    flo = f(lo)
    for _ in range(40):
        mid = (lo + hi) / 2
        if (f(mid) > 0) == (flo > 0):
            lo = mid
        else:
            hi = mid
    return (lo + hi) / 2


def _hits(a: str, b: str, lo: float, hi: float) -> list[dict]:
    """Exact aspects between a and b from lo to hi: one entry per crossing of the aspect angle."""
    times = [lo + i * STEP for i in range(int((hi - lo) / STEP) + 1)]
    out = []
    for name, angle in ASPECTS.items():
        for target in {angle, -angle} if angle not in (0.0, 180.0) else {angle}:
            def f(jd: float, t: float = target) -> float:
                return _wrap(_angle(a, b, jd) - t)
            for x, y in zip(times, times[1:]):
                fx, fy = f(x), f(y)
                # a real crossing has the two ends on either side of zero and close to it (not the 180° wrap)
                if (fx > 0) != (fy > 0) and abs(fx) < 30 and abs(fy) < 30:
                    jd = _bisect(f, x, y)
                    out.append({"a": a, "b": b, "aspect": name, "jd": jd})
    return out


def _aspects(year: int) -> list[dict]:
    lo = _day(date(year, 1, 1))
    hi = _day(date(year + 1, 1, 1))
    pad = PAD_YEARS * 365.25
    events = []
    for i, a in enumerate(PLANETS):
        for b in PLANETS[i + 1:]:
            events += _hits(a, b, lo - pad, hi + pad)
    events.sort(key=lambda e: e["jd"])
    out = []
    for e in events:
        if not lo <= e["jd"] < hi:
            continue
        group = sorted(x["jd"] for x in events if (x["a"], x["b"], x["aspect"]) == (e["a"], e["b"], e["aspect"])
                       and abs(x["jd"] - e["jd"]) < PASS_DAYS)
        out.append({"planets": [e["a"], e["b"]], "aspect": e["aspect"], "at": iso_from_jd(e["jd"]),
                    "pass": group.index(e["jd"]) + 1, "passes": len(group)})
    return out


def _stays(pid: str, year: int) -> dict:
    lo = _day(date(year, 1, 1))
    hi = _day(date(year + 1, 1, 1))
    runs = _runs(pid, lo, hi)
    return {
        "id": pid,
        "signAtStart": SIGNS[runs[0][0]],
        "signAtEnd": SIGNS[runs[-1][0]],
        "retrogradeAtStart": longitude(pid, lo)[1] < 0,
        "stays": [{"sign": SIGNS[r[0]], "start": None if i == 0 else iso_from_jd(r[1]),
                   "end": None if i == len(runs) - 1 else iso_from_jd(r[2])} for i, r in enumerate(runs)],
    }


def calculate(year: int, **_options) -> dict:
    if not 1801 <= year <= 2997:
        raise ValueError("year must be between 1801 and 2997")
    cal = calendar(date(year, 1, 1), date(year + 1, 1, 1))
    return {
        "module": MODULE_ID,
        "meta": {"engineVersion": MODULE_VERSION, "stepDays": STEP},
        "year": year,
        "positions": [_stays(pid, year) for pid in BODIES],
        "aspects": _aspects(year),
        "eclipses": cal["eclipses"],
        "retrogrades": [p for p in cal["retrogradePeriods"] if p["planet"] in PLANETS],
        "stations": [s for s in cal["stations"] if s["planet"] in PLANETS],
    }


__all__ = ["calculate", "MODULE_ID"]
