"""Rectification: which birth times fit a list of dated life events best.

The birth time moves the angles (Ascendant, MC and their opposites) by about a degree every four minutes, while the
planets hardly move. Important events tend to coincide with contacts to the angles, so for every candidate time of the
birth day (a step of a few minutes) the dated events are checked for:

* a slow planet (Jupiter to Pluto) transiting an angle on the event date (conjunction, square or opposition, orb 2°);
* a Solar Arc contact: a directed angle to a natal planet, or a directed planet to a natal angle (same aspects, orb 1°).

Each contact scores by closeness (1 at exact, 0 at the edge of the orb); a candidate's score is the sum over the
events. This is a classical, approximate method: it ranks the times that agree with the events, it does not prove
one. Nothing is stored: the events are used for the calculation only.
"""
from __future__ import annotations

from datetime import date, datetime, time, timedelta, timezone

from .._backend import swe
from ..common.birth import BirthData, resolve_utc
from ..common.zodiac import sign_of, split_degree
from ..sky.common import jd_of, longitude

MODULE_ID = "western.rectification"
MODULE_VERSION = "0.1.0"

SLOW = ["jupiter", "saturn", "uranus", "neptune", "pluto"]
NATAL = ["sun", "moon", "mercury", "venus", "mars", "jupiter", "saturn", "uranus", "neptune", "pluto"]
HARD = {"conjunction": 0.0, "square": 90.0, "opposition": 180.0}
TRANSIT_ORB = 2.0
ARC_ORB = 1.0
STEP_MINUTES = 4
MAX_EVENTS = 12
TOP = 5
PEAK_GAP = 20  # minutes: the options shown are separate peaks, not the neighbours of one peak
TROPICAL_YEAR = 365.2422


def _sep(a: float, b: float) -> float:
    d = abs((a - b) % 360.0)
    return min(d, 360.0 - d)


def _aspect(a: float, b: float, orb: float) -> tuple[str, float] | None:
    """The hard aspect between two longitudes within the orb, and its orb."""
    d = _sep(a, b)
    for name, angle in HARD.items():
        o = abs(d - angle)
        if o <= orb:
            return name, o
    return None


def _angles(jd: float, lat: float, lon: float) -> dict[str, float]:
    _, ascmc = swe.houses_ex(jd, lat, lon, b"P")
    asc, mc = ascmc[0] % 360.0, ascmc[1] % 360.0
    return {"asc": asc, "mc": mc}


def _event_jd(d: date) -> float:
    return jd_of(datetime(d.year, d.month, d.day, 12, tzinfo=timezone.utc))


def _candidate(birth: BirthData, t: time, events: list[date], sky: list[dict[str, float]]) -> dict:
    """Score one candidate birth time against the events (sky = the slow planets on each event date)."""
    utc = resolve_utc(birth.date, t, birth.timezone).utc
    jd = jd_of(utc)
    ang = _angles(jd, birth.latitude, birth.longitude)
    natal = {p: longitude(p, jd)[0] for p in NATAL}
    hits = []
    score = 0.0
    for i, (ev, planets) in enumerate(zip(events, sky)):
        # transits of the slow planets to the angles
        for pid, plon in planets.items():
            for aid, alon in ang.items():
                hit = _aspect(plon, alon, TRANSIT_ORB)
                if hit:
                    w = 1 - hit[1] / TRANSIT_ORB
                    score += w
                    hits.append({"event": i, "kind": "transit", "from": pid, "to": aid, "aspect": hit[0], "orb": round(hit[1], 2)})
        # Solar Arc: the arc the progressed Sun has travelled at the age of the event
        age_years = (_event_jd(ev) - jd) / TROPICAL_YEAR
        if age_years <= 0:
            continue
        arc = (longitude("sun", jd + age_years)[0] - natal["sun"]) % 360.0
        for aid, alon in ang.items():
            for pid, plon in natal.items():
                for kind, a, b, src, dst in (("arcAngle", alon + arc, plon, aid, pid), ("arcPlanet", plon + arc, alon, pid, aid)):
                    hit = _aspect(a, b, ARC_ORB)
                    if hit:
                        w = 1 - hit[1] / ARC_ORB
                        score += w
                        hits.append({"event": i, "kind": kind, "from": src, "to": dst, "aspect": hit[0], "orb": round(hit[1], 2)})
    asc_d, asc_m, _ = split_degree(ang["asc"])
    mc_d, mc_m, _ = split_degree(ang["mc"])
    return {"time": t.strftime("%H:%M"), "score": round(score, 3),
            "asc": {"sign": sign_of(ang["asc"]), "degree": asc_d, "minute": asc_m},
            "mc": {"sign": sign_of(ang["mc"]), "degree": mc_d, "minute": mc_m},
            "events": len({h["event"] for h in hits}), "hits": hits}


def calculate(birth: BirthData, events: list[date] | None = None, start: time | None = None, end: time | None = None,
              step_minutes: int = STEP_MINUTES, **_options) -> dict:
    events = sorted(set(events or []))
    if not events:
        raise ValueError("at least one event date is needed")
    if len(events) > MAX_EVENTS:
        raise ValueError(f"at most {MAX_EVENTS} events")
    if any(e <= birth.date for e in events):
        raise ValueError("event dates must be after the birth date")
    if not 1 <= step_minutes <= 30:
        raise ValueError("step must be between 1 and 30 minutes")
    start = start or time(0, 0)
    end = end or time(23, 59)
    if end <= start:
        raise ValueError("the end of the window must be after its start")

    sky = [{p: longitude(p, _event_jd(e))[0] for p in SLOW} for e in events]
    out = []
    t = datetime.combine(birth.date, start)
    last = datetime.combine(birth.date, end)
    while t <= last:
        out.append(_candidate(birth, t.time(), events, sky))
        t += timedelta(minutes=step_minutes)
    ranked = sorted(out, key=lambda c: (-c["score"], c["time"]))
    minutes = lambda c: int(c["time"][:2]) * 60 + int(c["time"][3:])  # noqa: E731
    top: list[dict] = []
    for c in ranked:
        if c["score"] > 0 and all(abs(minutes(c) - minutes(t)) >= PEAK_GAP for t in top):
            top.append(c)
        if len(top) == TOP:
            break
    return {
        "module": MODULE_ID,
        "meta": {"engineVersion": MODULE_VERSION, "stepMinutes": step_minutes, "peakGapMinutes": PEAK_GAP, "transitOrb": TRANSIT_ORB, "arcOrb": ARC_ORB,
                 "method": "hard aspects of slow-planet transits to the angles and Solar Arc contacts with the angles"},
        "events": [e.isoformat() for e in events],
        "curve": [{"time": c["time"], "score": c["score"], "asc": c["asc"]["sign"]} for c in out],
        "top": top,
    }


__all__ = ["calculate", "MODULE_ID"]
