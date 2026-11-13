"""Moon calendar for a place and a date range: lunar days, Moon sign changes, phase and void-of-course periods.

Conventions (documented in docs/architecture.md):
- Lunar day (the Russian "lunar day" tradition): day 1 starts at the exact New Moon; every following lunar day
  starts at a moonrise at the chosen place (upper limb, standard refraction). So lunar days depend on the place.
  Where the Moon does not rise (polar latitudes) the moonrise is skipped and the count continues.
- Void-of-course Moon (modern rule): from the Moon's last exact Ptolemaic aspect (conjunction, sextile, square,
  trine, opposition) to the Sun or a planet Mercury–Pluto while in a sign, until it enters the next sign.
- Phase: calendar convention, eight phases centred on the exact New Moon, First Quarter, Full Moon and Last
  Quarter (New Moon = elongation within ±22.5°), with the ids of western.lunar.PHASES; plus the illuminated
  fraction (1 - cos(elongation)) / 2. (The natal chart uses Rudhyar's phases, which start at the New Moon.)
All times are found by scanning and bisection to well under a second; output instants are UTC.
"""
from __future__ import annotations

import math
from datetime import date, datetime, time, timedelta, timezone
from zoneinfo import ZoneInfo

from .._backend import swe
from ..common.zodiac import SIGNS, norm
from ..western.lunar import PHASES

MODULE_ID = "sky.moon"
MODULE_VERSION = "0.1.0"
MAX_DAYS = 62
STEP = 1 / 12  # 2 hours; the Moon gains at most ~0.6° per hour on any body, so no crossing is missed
FLAGS = swe.FLG_SWIEPH
VOC_BODIES = {"sun": swe.SUN, "mercury": swe.MERCURY, "venus": swe.VENUS, "mars": swe.MARS,
              "jupiter": swe.JUPITER, "saturn": swe.SATURN, "uranus": swe.URANUS, "neptune": swe.NEPTUNE,
              "pluto": swe.PLUTO}
ASPECTS = {"conjunction": (0,), "sextile": (60, -60), "square": (90, -90), "trine": (120, -120), "opposition": (180,)}


def _lon(jd: float, body: int) -> float:
    return swe.calc_ut(jd, body, FLAGS)[0][0]


def _jd(dt: datetime) -> float:
    dt = dt.astimezone(timezone.utc)
    return swe.julday(dt.year, dt.month, dt.day, dt.hour + dt.minute / 60 + dt.second / 3600)


def _iso(jd: float) -> str:
    y, m, d, h = swe.revjul(jd)
    dt = datetime(y, m, d, tzinfo=timezone.utc) + timedelta(seconds=round(h * 3600))
    return dt.isoformat().replace("+00:00", "Z")


def _bisect(f, lo: float, hi: float, flo: float) -> float:
    for _ in range(40):
        mid = (lo + hi) / 2
        fm = f(mid)
        if (fm < 0) == (flo < 0):
            lo, flo = mid, fm
        else:
            hi = mid
    return (lo + hi) / 2


def _diff(x: float) -> float:
    return (x + 180) % 360 - 180


class _Samples:
    """Longitudes of the Moon and the other bodies on a 2-hour grid, computed once and shared by every search."""

    def __init__(self, a: float, b: float):
        n = max(1, math.ceil((b - a) / STEP))
        self.t = [a + i * (b - a) / n for i in range(n + 1)]
        self.lon = {swe.MOON: [_lon(x, swe.MOON) for x in self.t]}

    def of(self, body: int) -> list[float]:
        if body not in self.lon:
            self.lon[body] = [_lon(x, body) for x in self.t]
        return self.lon[body]

    def crossings(self, values: list[float], f) -> list[float]:
        """Zero crossings of an angle difference sampled as values (in (-180, 180]); refined with f."""
        out = []
        for i in range(len(values) - 1):
            fa, fb = values[i], values[i + 1]
            if (fa < 0) != (fb < 0) and abs(fa - fb) < 90:
                out.append(_bisect(f, self.t[i], self.t[i + 1], fa))
        return out


def moon_ingresses(a: float, b: float, samples: _Samples | None = None) -> list[tuple[float, str]]:
    """[(jd, sign entered)] — the Moon is always direct, so each sign boundary is crossed once."""
    sm = samples or _Samples(a, b)
    moon = sm.of(swe.MOON)
    out = []
    for k in range(12):
        edge = k * 30.0
        values = [_diff(m - edge) for m in moon]
        out += [(jd, SIGNS[k]) for jd in sm.crossings(values, lambda jd, e=edge: _diff(_lon(jd, swe.MOON) - e))
                if a <= jd <= b]
    return sorted(out)


def moon_aspects(a: float, b: float, samples: _Samples | None = None) -> list[dict]:
    sm = samples or _Samples(a, b)
    moon = sm.of(swe.MOON)
    out = []
    for name, body in VOC_BODIES.items():
        other = sm.of(body)
        for aspect, angles in ASPECTS.items():
            for ang in angles:
                values = [_diff(m - o - ang) for m, o in zip(moon, other)]
                f = lambda jd, bd=body, an=ang: _diff(_lon(jd, swe.MOON) - _lon(jd, bd) - an)  # noqa: E731
                out += [{"jd": jd, "body": name, "aspect": aspect} for jd in sm.crossings(values, f) if a <= jd <= b]
    return sorted(out, key=lambda x: x["jd"])


def void_of_course(a: float, b: float) -> list[dict]:
    """Void-of-course periods that overlap [a, b]."""
    margin = 3.0  # the Moon spends at most ~2.5 days in a sign
    sm = _Samples(a - margin, b + margin)
    ingresses = moon_ingresses(a - margin, b + margin, sm)
    aspects = moon_aspects(a - margin, b + margin, sm)
    out = []
    for (prev, sign_from), (nxt, sign_to) in zip(ingresses, ingresses[1:]):
        inside = [x for x in aspects if prev < x["jd"] < nxt]
        last = inside[-1] if inside else None
        start = last["jd"] if last else prev
        if start < b and nxt > a:
            out.append({"start": _iso(start), "end": _iso(nxt), "sign": sign_from, "nextSign": sign_to,
                        "lastAspect": {"body": last["body"], "aspect": last["aspect"]} if last else None})
    return out


def new_moons(a: float, b: float) -> list[float]:
    sm = _Samples(a, b)
    values = [_diff(m - s) for m, s in zip(sm.of(swe.MOON), sm.of(swe.SUN))]
    return sm.crossings(values, lambda jd: _diff(_lon(jd, swe.MOON) - _lon(jd, swe.SUN)))


def moonrises(a: float, b: float, lat: float, lon: float) -> list[float]:
    out, t = [], a
    while t < b:
        res, tret = swe.rise_trans(t, swe.MOON, swe.CALC_RISE, (lon, lat, 0.0), 0.0, 0.0, FLAGS)
        if res != 0 or tret[0] <= t:  # circumpolar or no event: move on a day
            t += 1.0
            continue
        if tret[0] < b:
            out.append(tret[0])
        t = tret[0] + 0.1
    return out


def lunar_day_starts(a: float, b: float, lat: float, lon: float) -> list[tuple[float, int]]:
    """[(jd, lunar day number)] covering [a, b]: 1 at each New Moon, +1 at each moonrise after it."""
    lookback = a - 31
    events = [(jd, "new") for jd in new_moons(lookback, b)] + [(jd, "rise") for jd in moonrises(lookback, b, lat, lon)]
    events.sort()
    starts, n = [], None
    for jd, kind in events:
        if kind == "new":
            n = 1
        elif n is not None:
            n += 1
        else:
            continue  # moonrises before the first New Moon in the window
        starts.append((jd, n))
    return starts


def calculate(start: date, end: date, latitude: float, longitude: float, timezone_name: str) -> dict:
    if end <= start:
        raise ValueError("end must be after start")
    if (end - start).days > MAX_DAYS:
        raise ValueError(f"range must be at most {MAX_DAYS} days")
    tz = ZoneInfo(timezone_name)
    day_bounds = [_jd(datetime.combine(start + timedelta(days=i), time(0), tz)) for i in range((end - start).days + 1)]
    a, b = day_bounds[0], day_bounds[-1]

    starts = lunar_day_starts(a, b, latitude, longitude)
    ingresses = moon_ingresses(a - 3, b)
    voc = void_of_course(a, b)
    days = []
    for i, (d0, d1) in enumerate(zip(day_bounds, day_bounds[1:])):
        current = [s for s in starts if s[0] <= d0]
        lunar = ([{"number": current[-1][1], "start": None}] if current else []) + \
                [{"number": n, "start": _iso(jd)} for jd, n in starts if d0 < jd < d1]
        sign_now = next((s for jd, s in reversed(ingresses) if jd <= d0), SIGNS[int(norm(_lon(d0, swe.MOON)) // 30)])
        signs = [{"sign": sign_now, "from": None}] + [{"sign": s, "from": _iso(jd)} for jd, s in ingresses if d0 < jd < d1]
        noon = (d0 + d1) / 2
        elongation = norm(_lon(noon, swe.MOON) - _lon(noon, swe.SUN))
        illum = (1 - math.cos(math.radians(elongation))) / 2
        days.append({
            "date": (start + timedelta(days=i)).isoformat(),
            "lunarDays": lunar,
            "signs": signs,
            "phase": PHASES[int(((elongation + 22.5) % 360) // 45)],
            "illumination": round(illum, 3),
            "waxing": elongation < 180,
        })
    return {
        "module": MODULE_ID,
        "meta": {"engineVersion": MODULE_VERSION, "lunarDay": "moonrise", "voc": "modern-ptolemaic",
                 "vocBodies": list(VOC_BODIES)},
        "input": {"start": start.isoformat(), "end": end.isoformat(), "latitude": latitude, "longitude": longitude,
                  "timezone": timezone_name},
        "days": days,
        "voidOfCourse": voc,
    }


__all__ = ["calculate", "void_of_course", "lunar_day_starts", "moon_ingresses", "moon_aspects", "MODULE_ID"]
