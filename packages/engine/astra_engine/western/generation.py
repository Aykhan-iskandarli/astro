"""Generation: how long the slow planets and the Moon's node stood in the birth sign, i.e. who shares the placement.

For Saturn, Uranus, Neptune, Pluto and the North Node the stay in the sign they occupied on the birth date is found by
sampling the longitude every few days and bisecting each boundary crossing (to the minute). Retrograde motion makes a
planet touch the next sign, step back and return; a dip into another sign shorter than ``MERGE_DAYS`` is treated as part
of the same stay, so the result is the first entry and the last exit. Only the birth date is used (noon UTC).
"""
from __future__ import annotations

from datetime import datetime, timezone

from ..common.birth import BirthData
from ..common.zodiac import SIGNS, sign_index
from ..sky.common import iso_from_jd, jd_of, longitude

MODULE_ID = "western.generation"
MODULE_VERSION = "0.1.0"

PLANETS = ["saturn", "uranus", "neptune", "pluto", "northNode"]
STEP = 5.0          # days; the slow planets move too little to enter and leave a sign within this
NODE_STEP = 1.0     # the true node wobbles back and forth over a boundary within days, so it is sampled daily
MERGE_DAYS = 400.0  # a dip into another sign shorter than this belongs to the same stay
SPAN_YEARS = 35.0   # how far each side of the birth is searched (Pluto stays at most ~31 years in a sign)
YEAR = 365.2425


def _idx(pid: str, jd: float) -> int:
    return sign_index(longitude(pid, jd)[0])


def _cross(pid: str, a: float, b: float, ia: int) -> float:
    """The moment between a and b (sign ia at a, another sign at b) when the sign changes, to about a minute."""
    for _ in range(40):
        mid = (a + b) / 2
        if _idx(pid, mid) == ia:
            a = mid
        else:
            b = mid
    return (a + b) / 2


def _runs(pid: str, lo: float, hi: float) -> list[list]:
    """[sign index, start jd, end jd] stays between lo and hi, boundaries bisected; the ends are the window's edges."""
    step = NODE_STEP if pid == "northNode" else STEP
    times = [lo + i * step for i in range(int((hi - lo) / step) + 1)]
    if times[-1] < hi:
        times.append(hi)
    runs: list[list] = []
    prev_i = _idx(pid, times[0])
    start = times[0]
    for a, b in zip(times, times[1:]):
        ib = _idx(pid, b)
        if ib != prev_i:
            edge = _cross(pid, a, b, prev_i)
            runs.append([prev_i, start, edge])
            start, prev_i = edge, ib
    runs.append([prev_i, start, times[-1]])
    return runs


def _stay(pid: str, birth: float) -> dict:
    lo, hi = birth - SPAN_YEARS * YEAR, birth + SPAN_YEARS * YEAR
    runs = _runs(pid, lo, hi)
    here = next(i for i, r in enumerate(runs) if r[1] <= birth <= r[2])
    sign = runs[here][0]
    a = b = here
    while a - 2 >= 0 and runs[a - 1][2] - runs[a - 1][1] < MERGE_DAYS and runs[a - 2][0] == sign:
        a -= 2
    while b + 2 < len(runs) and runs[b + 1][2] - runs[b + 1][1] < MERGE_DAYS and runs[b + 2][0] == sign:
        b += 2
    start, end = runs[a][1], runs[b][2]
    clipped_start, clipped_end = a == 0 and start == lo, b == len(runs) - 1 and end == hi
    return {
        "id": pid, "sign": SIGNS[sign],
        "start": None if clipped_start else iso_from_jd(start), "end": None if clipped_end else iso_from_jd(end),
        "years": None if clipped_start or clipped_end else round((end - start) / YEAR, 2),
        "daysFromStart": None if clipped_start else round(birth - start, 1),
        "daysToEnd": None if clipped_end else round(end - birth, 1),
        "dips": (b - a) // 2,
    }


def calculate(birth: BirthData, **_options) -> dict:
    d = birth.date
    if not 1840 <= d.year <= 2960:
        raise ValueError("birth year out of range")
    jd = jd_of(datetime(d.year, d.month, d.day, 12, tzinfo=timezone.utc))
    return {
        "module": MODULE_ID,
        "meta": {"engineVersion": MODULE_VERSION, "mergeDays": MERGE_DAYS, "stepDays": STEP, "nodeStepDays": NODE_STEP},
        "planets": [_stay(pid, jd) for pid in PLANETS],
    }


__all__ = ["calculate", "MODULE_ID"]
