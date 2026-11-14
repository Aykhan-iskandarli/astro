"""Astrocartography (ACG): where on Earth each planet was angular at the moment of birth.

Lines are computed in mundo from each body's true equatorial coordinates (right ascension, declination)
and the apparent sidereal time at Greenwich:

* MC line: the body culminates (hour angle 0)  -> longitude = RA − GAST
* IC line: the body is at lower culmination    -> MC + 180°
* ASC / DSC: the body is on the geometric horizon, rising / setting. For latitude φ the semi-diurnal arc H
  satisfies cos H = −tan φ · tan δ, and longitude = RA ∓ H − GAST. Where |cos H| > 1 the body never
  rises or sets (circumpolar / never visible), so those curves have gaps near the poles.
"""
from __future__ import annotations

import math

from .._backend import swe
from ..common.birth import BirthData, resolve_utc
from ..sky.common import SWE_IDS, jd_of

MODULE_ID = "western.astrocartography"
MODULE_VERSION = "0.1.0"

BODIES = ["sun", "moon", "mercury", "venus", "mars", "jupiter", "saturn", "uranus", "neptune", "pluto"]
ANGLES = ["mc", "ic", "asc", "dsc"]
LAT_LIMIT = 75.0       # beyond this, horizon lines run almost along meridians and become meaningless
LAT_STEP = 0.5
NEAR_KM = 800.0        # a line within this distance of a place is considered "active" there
EARTH_KM = 6371.0088


def _wrap(lon: float) -> float:
    return (lon + 180.0) % 360.0 - 180.0


def equatorial(pid: str, jd: float) -> tuple[float, float]:
    """(right ascension, declination) in degrees, apparent, geocentric."""
    xx, _ = swe.calc_ut(jd, SWE_IDS[pid], swe.FLG_SWIEPH | swe.FLG_EQUATORIAL)
    return xx[0], xx[1]


def gast_degrees(jd: float) -> float:
    return swe.sidtime(jd) * 15.0


def _split(points: list[list[float]]) -> list[list[list[float]]]:
    """Split a polyline where it jumps across the antimeridian."""
    segments, current = [], []
    for p in points:
        if current and abs(p[0] - current[-1][0]) > 180:
            segments.append(current)
            current = []
        current.append(p)
    if current:
        segments.append(current)
    return [s for s in segments if len(s) > 1]


def lines_for(ra: float, dec: float, gast: float) -> dict[str, list[list[list[float]]]]:
    mc = _wrap(ra - gast)
    out = {
        "mc": [[[round(mc, 4), -LAT_LIMIT], [round(mc, 4), LAT_LIMIT]]],
        "ic": [[[round(_wrap(mc + 180), 4), -LAT_LIMIT], [round(_wrap(mc + 180), 4), LAT_LIMIT]]],
    }
    tan_d = math.tan(math.radians(dec))
    asc, dsc = [], []
    steps = int(2 * LAT_LIMIT / LAT_STEP)
    for i in range(steps + 1):
        lat = -LAT_LIMIT + i * LAT_STEP
        cos_h = -math.tan(math.radians(lat)) * tan_d
        if abs(cos_h) > 1:
            asc.append(None)
            dsc.append(None)
            continue
        h = math.degrees(math.acos(cos_h))
        asc.append([round(_wrap(ra - h - gast), 4), round(lat, 4)])
        dsc.append([round(_wrap(ra + h - gast), 4), round(lat, 4)])

    def runs(pts):
        result, run = [], []
        for p in pts:
            if p is None:
                if run:
                    result.append(run)
                run = []
            else:
                run.append(p)
        if run:
            result.append(run)
        return [seg for r in result for seg in _split(r)]

    out["asc"] = runs(asc)
    out["dsc"] = runs(dsc)
    return out


def _haversine_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    p1, p2 = math.radians(lat1), math.radians(lat2)
    dp, dl = p2 - p1, math.radians(lon2 - lon1)
    a = math.sin(dp / 2) ** 2 + math.cos(p1) * math.cos(p2) * math.sin(dl / 2) ** 2
    return 2 * EARTH_KM * math.asin(min(1.0, math.sqrt(a)))


def _distance_to_line(lat: float, lon: float, ra: float, dec: float, gast: float, angle: str) -> float | None:
    """Great-circle distance (km) from a place to one line, sampled finely around the place's latitude."""
    if angle in ("mc", "ic"):
        line_lon = _wrap(ra - gast + (180 if angle == "ic" else 0))
        # Closest point of a meridian is on the same latitude only near the equator; sample along it
        return min(_haversine_km(lat, lon, la / 10, line_lon) for la in range(-750, 751, 2))
    tan_d = math.tan(math.radians(dec))
    best = None
    for k in range(-200, 201):
        la = lat + k * 0.1
        if abs(la) > LAT_LIMIT:
            continue
        cos_h = -math.tan(math.radians(la)) * tan_d
        if abs(cos_h) > 1:
            continue
        h = math.degrees(math.acos(cos_h))
        lo = _wrap(ra - h - gast) if angle == "asc" else _wrap(ra + h - gast)
        d = _haversine_km(lat, lon, la, lo)
        best = d if best is None else min(best, d)
    return best


def calculate(birth: BirthData, probe: tuple[float, float] | None = None, **_options) -> dict:
    """ACG lines for the birth moment; with `probe` (lat, lon) also the lines passing near that place."""
    if birth.time is None:
        raise ValueError("astrocartography needs an exact birth time")
    utc = resolve_utc(birth.date, birth.time, birth.timezone).utc
    jd = jd_of(utc)
    gast = gast_degrees(jd)
    eq = {pid: equatorial(pid, jd) for pid in BODIES}
    lines = [{"planet": pid, "angle": angle, "segments": segs}
             for pid, (ra, dec) in eq.items() for angle, segs in lines_for(ra, dec, gast).items()]

    near = None
    if probe is not None:
        lat, lon = probe
        near = []
        for pid, (ra, dec) in eq.items():
            for angle in ANGLES:
                d = _distance_to_line(lat, lon, ra, dec, gast, angle)
                if d is not None and d <= NEAR_KM:
                    near.append({"planet": pid, "angle": angle, "distanceKm": round(d)})
        near.sort(key=lambda x: x["distanceKm"])

    return {
        "module": MODULE_ID,
        "meta": {"engineVersion": MODULE_VERSION, "latLimit": LAT_LIMIT, "nearKm": NEAR_KM,
                 "method": "in mundo, true equatorial coordinates, geometric horizon"},
        "birthplace": {"latitude": birth.latitude, "longitude": birth.longitude},
        "lines": lines,
        "near": near,
    }
