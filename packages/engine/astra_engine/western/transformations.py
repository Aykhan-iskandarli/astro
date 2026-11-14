"""Transformations: the long transits of the slow planets (Jupiter..Pluto) to the natal chart over several years.

For every slow planet and every natal point (Sun..Pluto, and the Ascendant and Midheaven when the birth time is
known; the Moon moves ~13 degrees a day, so it needs the birth time too) the exact moments of conjunction, sextile,
square, trine and opposition are found by daily sampling and bisection (well under a minute of time). Because of
retrograde motion a transit usually becomes exact two or three times; passes less than ~300 days apart belong to
one *episode*, reported with every exact date. A planet that only grazes the aspect without becoming exact is not
counted. When the transiting and the natal planet are the same (Saturn to natal Saturn, ...) the episode is a
life-cycle return, opposition or square, which the page reads as such.

Only a birth date is really needed: the slow planets and the personal planets change little with the time of day,
so a date-only chart gives every episode except those to the Moon and the angles.
"""
from __future__ import annotations

from datetime import date, datetime, timezone

from ..common.birth import BirthData, HouseSystem
from ..common.zodiac import sign_of, split_degree
from ..sky.common import iso_from_jd, jd_of, longitude
from . import natal

MODULE_ID = "western.transformations"
MODULE_VERSION = "0.1.0"

TRANSITING = ["jupiter", "saturn", "uranus", "neptune", "pluto"]
NATAL_TARGETS = ["sun", "moon", "mercury", "venus", "mars", "jupiter", "saturn", "uranus", "neptune", "pluto"]
EXTRA_POINTS = ["northNode", "chiron"]  # only used for returns (a point to itself); not part of the default targets
ASPECTS = {"conjunction": 0.0, "sextile": 60.0, "square": 90.0, "trine": 120.0, "opposition": 180.0}
MAX_YEARS = 30
EPISODE_GAP = 300.0  # days between exact passes that still belong to the same episode
STEP = 1.0           # days; no slow planet gains more than ~0.3 degrees a day on a fixed point


def _wrap(x: float) -> float:
    return (x + 180.0) % 360.0 - 180.0


def _refine(pid: str, target: float, off: float, lo: float, hi: float, flo: float) -> float:
    for _ in range(40):
        mid = (lo + hi) / 2
        fm = _wrap(longitude(pid, mid)[0] - target - off)
        if (fm < 0) == (flo < 0):
            lo, flo = mid, fm
        else:
            hi = mid
    return (lo + hi) / 2


def _natal_targets(birth: BirthData, house_system: HouseSystem, wanted: list[str] | None = None) -> tuple[dict, dict, bool]:
    chart = natal.calculate(birth, house_system=house_system)
    known = not chart["meta"]["timeUnknown"]
    ids = wanted if wanted is not None else NATAL_TARGETS
    targets = {p["id"]: p["longitude"] for p in chart["points"]
               if p["id"] in ids and (known or p["id"] != "moon")}
    if wanted is None and known and chart["angles"]:
        targets.update({a: chart["angles"][a]["longitude"] for a in ("asc", "mc")})
    return chart, targets, not known


def calculate(birth: BirthData, start_year: int | None = None, years: int = 10,
              house_system: HouseSystem = "P", only: list[str] | None = None, step: float = STEP, **_options) -> dict:
    """`only` ("saturn-conjunction", ...) restricts the result to a planet's own aspects to itself, which is what the
    life-cycle timeline needs (returns, squares, oppositions); the transiting planets may then include the Moon's node
    and Chiron. `step` is the sampling step in days (coarser is faster; two days still cannot skip a crossing)."""
    if not 1 <= years <= MAX_YEARS:
        raise ValueError(f"years must be between 1 and {MAX_YEARS}")
    first = start_year or datetime.now(timezone.utc).year
    if not 1800 <= first <= 2998 - years:
        raise ValueError("start year out of range")
    wanted = sorted({k.rsplit("-", 1)[0] for k in only}) if only else None
    chart, targets, unknown = _natal_targets(birth, house_system, wanted)
    a = jd_of(datetime(first, 1, 1, tzinfo=timezone.utc))
    b = jd_of(datetime(first + years, 1, 1, tzinfo=timezone.utc))
    days = int(b - a)
    times = [a + i * step for i in range(int(days / step) + 1)]
    birth_jd = jd_of(datetime(birth.date.year, birth.date.month, birth.date.day, tzinfo=timezone.utc))

    hits: dict[tuple, list[tuple[float, bool]]] = {}
    for pid in (wanted if only else TRANSITING):
        if pid not in targets and only:
            continue
        lons = [longitude(pid, t)[0] for t in times]
        for tid, tlon in targets.items():
            if only and tid != pid:
                continue
            for aspect, angle in ASPECTS.items():
                if only and f"{pid}-{aspect}" not in only:
                    continue
                for off in ((angle,) if angle in (0.0, 180.0) else (angle, -angle)):
                    vals = [_wrap(x - tlon - off) for x in lons]
                    for i in range(len(vals) - 1):
                        fa, fb = vals[i], vals[i + 1]
                        if fa == 0.0 or ((fa < 0) != (fb < 0) and abs(fa) < 30 and abs(fb) < 30):
                            jd = times[i] if fa == 0.0 else _refine(pid, tlon, off, times[i], times[i + 1], fa)
                            hits.setdefault((pid, tid, aspect), []).append((jd, longitude(pid, jd)[1] < 0))

    episodes = []
    for (pid, tid, aspect), found in hits.items():
        found.sort()
        group: list[tuple[float, bool]] = []
        for item in found + [None]:
            if item is not None and (not group or item[0] - group[-1][0] <= EPISODE_GAP):
                group.append(item)
                continue
            if group:
                d, m, _ = split_degree(targets[tid])
                episodes.append({
                    "transit": pid, "natal": tid, "aspect": aspect,
                    "natalSign": sign_of(targets[tid]), "natalDegree": d, "natalMinute": m,
                    "passes": [{"at": iso_from_jd(jd), "retrograde": retro} for jd, retro in group],
                    "start": iso_from_jd(group[0][0]), "end": iso_from_jd(group[-1][0]),
                    "ageAtStart": round((group[0][0] - birth_jd) / 365.2425, 2),
                    "ageAtEnd": round((group[-1][0] - birth_jd) / 365.2425, 2),
                    "sameBody": pid == tid,
                })
            group = [item] if item is not None else []
    episodes.sort(key=lambda e: e["start"])
    return {
        "module": MODULE_ID,
        "meta": {"engineVersion": MODULE_VERSION, "timeUnknown": unknown, "houseSystem": chart["meta"]["houseSystem"],
                 "exactOnly": True, "episodeGapDays": EPISODE_GAP},
        "from": first, "to": first + years - 1,
        "episodes": episodes,
    }


__all__ = ["calculate", "MODULE_ID"]
