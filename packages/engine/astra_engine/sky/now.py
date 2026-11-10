"""The sky at a moment: planet positions, the Moon (phase, illumination, void of course), retrogrades and
the next lunations / stations. Not tied to a birth chart, so it is not a ``calculate(birth)`` module."""
from __future__ import annotations

import warnings
from datetime import datetime, timedelta, timezone

from .._backend import swe
from ..western.lunar import lunar_phase
from .common import SWE_IDS, iso, jd_of, kery_planet, kery_sign, position

from kerykeion import LunationFinderFactory, RetrogradeStationFactory, VoidOfCourseMoonFactory  # noqa: E402

MODULE_ID = "sky.now"
MODULE_VERSION = "0.1.0"

BODIES = list(SWE_IDS)
RETRO_CAPABLE = ["mercury", "venus", "mars", "jupiter", "saturn", "uranus", "neptune", "pluto", "chiron"]


def _void_of_course(at: datetime) -> dict:
    with warnings.catch_warnings():
        warnings.simplefilter("ignore")
        v = VoidOfCourseMoonFactory.from_datetime(at.year, at.month, at.day, at.hour, at.minute, tz_str="UTC")
    last = v.last_aspect
    return {
        "active": bool(v.is_void_of_course),
        "moonSign": kery_sign(v.moon_sign),
        "nextSign": kery_sign(v.next_sign),
        "start": iso(v.void_start),
        "end": iso(v.void_end),
        "lastAspect": {"planet": kery_planet(last.planet), "aspect": last.aspect, "exact": iso(last.exact_time)}
        if last else None,
    }


def _upcoming(at: datetime, days: int) -> tuple[list[dict], list[dict]]:
    start = at.strftime("%Y-%m-%dT%H:%M:%S")
    end = (at + timedelta(days=days)).strftime("%Y-%m-%dT%H:%M:%S")
    with warnings.catch_warnings():
        warnings.simplefilter("ignore")
        lun = LunationFinderFactory.from_iso_range(start, end)
        st = RetrogradeStationFactory.from_iso_range(start, end)
    lunations = [{"phase": x.phase, "at": x.iso_utc, "sign": kery_sign(x.moon.sign)} for x in lun.lunations]
    stations = [{"planet": kery_planet(x.planet), "type": x.station_type, "at": x.iso_utc, "sign": kery_sign(x.sign)}
                for x in st.stations]
    return lunations, stations


def calculate(at: datetime | None = None) -> dict:
    at = (at or datetime.now(timezone.utc)).astimezone(timezone.utc).replace(microsecond=0)
    jd = jd_of(at)
    points = [position(pid, jd) for pid in BODIES]
    by_id = {p["id"]: p for p in points}
    # Illuminated fraction straight from Swiss Ephemeris (phase angle based, not an approximation)
    attr = swe.pheno_ut(jd, swe.MOON, swe.FLG_SWIEPH)
    lunations, stations = _upcoming(at, 60)
    return {
        "module": MODULE_ID,
        "meta": {"engineVersion": MODULE_VERSION},
        "at": iso(at),
        "points": points,
        "moon": {
            **lunar_phase(by_id["sun"]["longitude"], by_id["moon"]["longitude"]),
            "sign": by_id["moon"]["sign"],
            "illumination": round(attr[1], 4),
            "voidOfCourse": _void_of_course(at),
        },
        "retrogrades": [pid for pid in RETRO_CAPABLE if by_id[pid]["retrograde"]],
        "lunations": lunations[:4],
        "stations": stations,
    }
