"""Western natal chart module: calculate(birth_data) -> JSON-serialisable dict.

Positions and house cusps come from kerykeion (Swiss Ephemeris backend). Aspects, patterns,
dignities, balance and lunar phase are our own pure functions on top of those positions.
"""
from __future__ import annotations

import warnings
from datetime import datetime, time

from .._backend import LIBRARY_VERSION, swe
from ..common.birth import BirthData, HouseSystem, resolve_utc
from ..common.zodiac import house_of, norm, sign_of, split_degree
from .aspects import AspectPoint, find_aspects
from .balance import balance
from .dignities import dignity_of
from .lunar import lunar_phase
from .patterns import find_patterns

from kerykeion import AstrologicalSubjectFactory  # noqa: E402  (after _backend)

MODULE_ID = "western.natal"
MODULE_VERSION = "0.1.0"

# (our id, kerykeion attribute, kind)
POINTS = [
    ("sun", "sun", "planet"), ("moon", "moon", "planet"), ("mercury", "mercury", "planet"),
    ("venus", "venus", "planet"), ("mars", "mars", "planet"), ("jupiter", "jupiter", "planet"),
    ("saturn", "saturn", "planet"), ("uranus", "uranus", "planet"), ("neptune", "neptune", "planet"),
    ("pluto", "pluto", "planet"),
    ("northNode", "true_north_lunar_node", "node"), ("southNode", "true_south_lunar_node", "node"),
    ("lilith", "mean_lilith", "point"), ("chiron", "chiron", "point"),
    ("partOfFortune", "pars_fortunae", "point"),
]
TIME_DEPENDENT = {"partOfFortune"}  # needs the Ascendant
ANGLES = [("asc", "ascendant"), ("mc", "medium_coeli"), ("dc", "descendant"), ("ic", "imum_coeli")]
HOUSE_ATTRS = ["first", "second", "third", "fourth", "fifth", "sixth", "seventh", "eighth",
               "ninth", "tenth", "eleventh", "twelfth"]
KERYKEION_ACTIVE = [
    "Sun", "Moon", "Mercury", "Venus", "Mars", "Jupiter", "Saturn", "Uranus", "Neptune", "Pluto",
    "True_North_Lunar_Node", "True_South_Lunar_Node", "Mean_Lilith", "Chiron", "Pars_Fortunae",
    "Ascendant", "Medium_Coeli", "Descendant", "Imum_Coeli",
]
HOUSE_SYSTEM_NAMES = {"P": "placidus", "K": "koch", "W": "wholeSign", "A": "equal", "O": "porphyry"}


def _position(lon: float) -> dict:
    d, m, s = split_degree(lon)
    return {"longitude": round(norm(lon), 6), "sign": sign_of(lon), "signDegree": round(norm(lon) % 30, 6),
            "degree": d, "minute": m, "second": s}


def _moon_range(birth: BirthData) -> dict:
    """Moon at the start and end of the local birth day (shown when birth time is unknown)."""
    out = {}
    for key, t in (("start", time(0, 0)), ("end", time(23, 59))):
        utc = resolve_utc(birth.date, t, birth.timezone).utc
        jd = swe.julday(utc.year, utc.month, utc.day, utc.hour + utc.minute / 60)
        xx, _ = swe.calc_ut(jd, swe.MOON, swe.FLG_SWIEPH)
        out[key] = _position(xx[0])
    return out


def _detect_polar_fallback(jd: float, birth: BirthData, requested: str, cusps: list[float]) -> str:
    """Placidus/Koch are undefined inside the polar circles; kerykeion then silently uses Porphyry
    but still reports the requested system. Detect it by comparing against Porphyry cusps."""
    if requested not in ("P", "K") or abs(birth.latitude) < 60:
        return requested
    porphyry, _ = swe.houses_ex(jd, birth.latitude, birth.longitude, b"O")
    same = all(abs((a - b + 180) % 360 - 180) < 1e-6 for a, b in zip(cusps, porphyry))
    return "O" if same else requested


def build_subject(birth: BirthData, utc: datetime, house_system: str = "P"):
    """Kerykeion subject for a UTC moment (time-zone logic stays in resolve_utc)."""
    with warnings.catch_warnings():
        warnings.simplefilter("ignore")
        return AstrologicalSubjectFactory.from_birth_data(
            name=birth.name or "Chart", year=utc.year, month=utc.month, day=utc.day,
            hour=utc.hour, minute=utc.minute, seconds=utc.second,
            lat=birth.latitude, lng=birth.longitude, tz_str="UTC", online=False,
            city=birth.place or "—", nation="—",
            houses_system_identifier=house_system, active_points=KERYKEION_ACTIVE,
            calculate_lunar_phase=False,
        )


def calculate(birth: BirthData, house_system: HouseSystem = "P") -> dict:
    """Pure and deterministic: same input -> same output. No I/O besides reading ephemeris files."""
    time_unknown = birth.time_unknown
    resolved = resolve_utc(birth.date, birth.time or time(12, 0), birth.timezone)
    utc: datetime = resolved.utc
    subject = build_subject(birth, utc, house_system)

    cusps = [getattr(subject, f"{h}_house").abs_pos for h in HOUSE_ATTRS]
    used_system = _detect_polar_fallback(subject.julian_day, birth, house_system, cusps)

    points = []
    for pid, attr, kind in POINTS:
        if time_unknown and pid in TIME_DEPENDENT:
            continue
        p = getattr(subject, attr)
        pos = _position(p.abs_pos)
        points.append({
            "id": pid, "kind": kind, **pos,
            "house": None if time_unknown else house_of(p.abs_pos, cusps),
            "retrograde": bool(p.retrograde),
            "speed": round(p.speed, 6) if p.speed is not None else None,
            "dignity": dignity_of(pid, pos["sign"]),
        })

    angles = None if time_unknown else {
        aid: _position(getattr(subject, attr).abs_pos) for aid, attr in ANGLES}
    houses = None if time_unknown else [
        {"number": i + 1, **_position(c)} for i, c in enumerate(cusps)]

    aspect_points = [AspectPoint(p["id"], p["longitude"], p["speed"]) for p in points
                     if p["id"] not in {"partOfFortune"}]
    if angles:
        aspect_points += [AspectPoint(a, angles[a]["longitude"], None, is_angle=True) for a in ("asc", "mc")]
    aspects = find_aspects(aspect_points)

    signs = {p["id"]: p["sign"] for p in points}
    house_map = {p["id"]: p["house"] for p in points}
    by_id = {p["id"]: p for p in points}

    sect = None
    if angles:
        # Sun above the horizon (houses 7-12 side of the ASC/DSC axis) = day chart
        sect = "day" if norm(by_id["sun"]["longitude"] - angles["asc"]["longitude"]) > 180 else "night"

    return {
        "module": MODULE_ID,
        "meta": {
            "engineVersion": MODULE_VERSION, "library": LIBRARY_VERSION, "zodiac": "tropical",
            "houseSystem": HOUSE_SYSTEM_NAMES.get(used_system, used_system),
            "houseSystemRequested": HOUSE_SYSTEM_NAMES[house_system],
            "timeUnknown": time_unknown, "lilith": "mean", "node": "true",
        },
        "input": {
            "name": birth.name, "place": birth.place, "latitude": birth.latitude, "longitude": birth.longitude,
            "timezone": birth.timezone,
            "localDatetime": None if time_unknown else resolved.local.isoformat(),
            "date": birth.date.isoformat(),
            "utcDatetime": None if time_unknown else utc.isoformat().replace("+00:00", "Z"),
            "utcOffset": resolved.utc_offset, "dstNote": resolved.dst_note,
            "julianDay": None if time_unknown else round(subject.julian_day, 6),
        },
        "points": points,
        "angles": angles,
        "houses": houses,
        "aspects": aspects,
        "patterns": find_patterns(aspects, signs, house_map),
        "balance": balance(signs),
        "lunarPhase": lunar_phase(by_id["sun"]["longitude"], by_id["moon"]["longitude"]),
        "sect": sect,
        "moonRange": _moon_range(birth) if time_unknown else None,
    }


__all__ = ["calculate", "MODULE_ID", "MODULE_VERSION"]
