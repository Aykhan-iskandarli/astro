"""Transit timeline: exact dates when slow planets aspect the natal chart over a period.

Our own root finding on Swiss Ephemeris longitudes: daily samples bracket each exact aspect, then bisection
narrows it to well under a minute. Retrograde motion produces repeated passes, which are all reported.
"""
from __future__ import annotations

from datetime import date, datetime, timezone

from ..common.birth import BirthData, HouseSystem
from ..sky.common import iso_from_jd, jd_of, longitude
from . import natal

MODULE_ID = "western.timeline"
MODULE_VERSION = "0.1.0"
MAX_DAYS = 400

TRANSITING = ["mars", "jupiter", "saturn", "uranus", "neptune", "pluto"]
NATAL_TARGETS = ["sun", "moon", "mercury", "venus", "mars", "jupiter", "saturn"]
ASPECTS = {"conjunction": 0.0, "sextile": 60.0, "square": 90.0, "trine": 120.0, "opposition": 180.0}


def _wrap(x: float) -> float:
    return (x + 180.0) % 360.0 - 180.0


def _exact_times(pid: str, target: float, angle: float, jd0: float, days: int) -> list[float]:
    """Moments in [jd0, jd0+days] when the transit is exactly `angle` from `target` (either side)."""
    offsets = {angle, -angle} if angle not in (0.0, 180.0) else {angle}
    lons = [longitude(pid, jd0 + i)[0] for i in range(days + 1)]
    hits = []
    for off in offsets:
        f = [_wrap(lon - target - off) for lon in lons]
        for i in range(days):
            a, b = f[i], f[i + 1]
            # A real crossing changes sign near 0; a jump from +180 to -180 is just the wrap-around
            if a == 0.0:
                hits.append(jd0 + i)
            elif a * b < 0 and abs(a) < 30 and abs(b) < 30:
                lo, hi, flo = jd0 + i, jd0 + i + 1, a
                for _ in range(24):  # 1 day / 2^24 ≈ 5 ms
                    mid = (lo + hi) / 2
                    fm = _wrap(longitude(pid, mid)[0] - target - off)
                    if (fm < 0) == (flo < 0):
                        lo, flo = mid, fm
                    else:
                        hi = mid
                hits.append((lo + hi) / 2)
    return hits


def calculate(birth: BirthData, start: date | None = None, days: int = 365, house_system: HouseSystem = "P") -> dict:
    if not 1 <= days <= MAX_DAYS:
        raise ValueError(f"days must be between 1 and {MAX_DAYS}")
    start = start or datetime.now(timezone.utc).date()
    base = natal.calculate(birth, house_system=house_system)
    targets = {p["id"]: p["longitude"] for p in base["points"] if p["id"] in NATAL_TARGETS}
    if base["angles"]:
        targets.update({a: base["angles"][a]["longitude"] for a in ("asc", "mc")})

    jd0 = jd_of(datetime(start.year, start.month, start.day, tzinfo=timezone.utc))
    events = []
    for pid in TRANSITING:
        for tid, tlon in targets.items():
            for name, angle in ASPECTS.items():
                for jd in _exact_times(pid, tlon, angle, jd0, days):
                    _, speed = longitude(pid, jd)
                    events.append({"transit": pid, "natal": tid, "aspect": name, "at": iso_from_jd(jd),
                                   "retrograde": speed < 0, "_jd": jd})
    events.sort(key=lambda e: e["_jd"])
    # Number the passes of the same transit (1st, 2nd, 3rd when retrograde brings it back)
    seen: dict[tuple, int] = {}
    for e in events:
        key = (e["transit"], e["natal"], e["aspect"])
        seen[key] = seen.get(key, 0) + 1
        e["pass"] = seen[key]
        del e["_jd"]
    totals = {k: v for k, v in seen.items()}
    for e in events:
        e["passes"] = totals[(e["transit"], e["natal"], e["aspect"])]
    return {
        "module": MODULE_ID,
        "meta": {"engineVersion": MODULE_VERSION, "transiting": TRANSITING, "aspects": list(ASPECTS)},
        "start": start.isoformat(),
        "days": days,
        "events": events,
    }
