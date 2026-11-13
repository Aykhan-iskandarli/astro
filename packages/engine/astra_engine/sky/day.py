"""The day at a place: planetary hours (kerykeion) and the Vedic Panchang at sunrise.

Panchang (sidereal, Lahiri), computed for the local sunrise:
- tithi = floor(elongation / 12°) + 1 (1..30; 1-15 Shukla paksha, 16-30 Krishna paksha);
- nakshatra of the Moon (27 x 13°20');
- yoga = floor((Sun + Moon) / 13°20') + 1 (27 yogas);
- karana = half a tithi (6°): 0 Kimstughna, 1..56 the seven movable karanas in turn, 57 Shakuni, 58 Chatushpada,
  59 Naga;
- vara = weekday at sunrise.
"""
from __future__ import annotations

import warnings
from datetime import date as Date, datetime, timezone
from zoneinfo import ZoneInfo

from .._backend import swe
from ..vedic.chart import nakshatra_of
from .common import kery_planet

from kerykeion.planetary_hours.factory import PlanetaryHoursFactory  # noqa: E402

MODULE_ID = "sky.day"
MODULE_VERSION = "0.1.0"
TITHIS = ["Pratipada", "Dwitiya", "Tritiya", "Chaturthi", "Panchami", "Shashthi", "Saptami", "Ashtami", "Navami",
          "Dashami", "Ekadashi", "Dwadashi", "Trayodashi", "Chaturdashi"]
YOGAS = ["Vishkambha", "Priti", "Ayushman", "Saubhagya", "Shobhana", "Atiganda", "Sukarma", "Dhriti", "Shula",
         "Ganda", "Vriddhi", "Dhruva", "Vyaghata", "Harshana", "Vajra", "Siddhi", "Vyatipata", "Variyan", "Parigha",
         "Shiva", "Siddha", "Sadhya", "Shubha", "Shukla", "Brahma", "Indra", "Vaidhriti"]
MOVABLE_KARANAS = ["Bava", "Balava", "Kaulava", "Taitila", "Garaja", "Vanija", "Vishti"]
VARAS = ["Somavara", "Mangalavara", "Budhavara", "Guruvara", "Shukravara", "Shanivara", "Ravivara"]  # Monday first
FLAGS = swe.FLG_SWIEPH | swe.FLG_SIDEREAL


def _iso(dt) -> str:
    if isinstance(dt, str):
        dt = datetime.fromisoformat(dt)
    return dt.astimezone(timezone.utc).replace(microsecond=0).isoformat().replace("+00:00", "Z")


def tithi_name(n: int) -> str:
    if n == 15:
        return "Purnima"
    if n == 30:
        return "Amavasya"
    return TITHIS[(n - 1) % 15]


def karana_name(k: int) -> str:
    if k == 0:
        return "Kimstughna"
    if k >= 57:
        return ["Shakuni", "Chatushpada", "Naga"][k - 57]
    return MOVABLE_KARANAS[(k - 1) % 7]


def panchang(jd: float, weekday: int) -> dict:
    swe.set_sid_mode(swe.SIDM_LAHIRI)
    sun = swe.calc_ut(jd, swe.SUN, FLAGS)[0][0] % 360
    moon = swe.calc_ut(jd, swe.MOON, FLAGS)[0][0] % 360
    elong = (moon - sun) % 360
    tithi = int(elong // 12) + 1
    return {
        "tithi": {"number": tithi, "name": tithi_name(tithi), "paksha": "shukla" if tithi <= 15 else "krishna"},
        "nakshatra": nakshatra_of(moon),
        "yoga": {"number": int(((sun + moon) % 360) // (360 / 27)) + 1,
                 "name": YOGAS[int(((sun + moon) % 360) // (360 / 27))]},
        "karana": {"number": int(elong // 6), "name": karana_name(int(elong // 6))},
        "vara": VARAS[weekday],
    }


def calculate(day: Date, latitude: float, longitude: float, timezone_name: str) -> dict:
    tz = ZoneInfo(timezone_name)
    with warnings.catch_warnings():
        warnings.simplefilter("ignore")
        ph = PlanetaryHoursFactory.from_datetime(day.year, day.month, day.day, 12, 0, latitude=latitude,
                                                 longitude=longitude, tz_str=timezone_name).model_dump()
    sunrise = ph["sunrise"] if isinstance(ph["sunrise"], datetime) else datetime.fromisoformat(str(ph["sunrise"]))
    su = sunrise.astimezone(timezone.utc)
    jd = swe.julday(su.year, su.month, su.day, su.hour + su.minute / 60 + su.second / 3600)
    return {
        "module": MODULE_ID,
        "meta": {"engineVersion": MODULE_VERSION, "panchang": "at sunrise, Lahiri", "hours": "kerykeion"},
        "input": {"date": day.isoformat(), "latitude": latitude, "longitude": longitude, "timezone": timezone_name},
        "sunrise": _iso(ph["sunrise"]), "sunset": _iso(ph["sunset"]),
        "dayRuler": kery_planet(ph["day_ruler"]),
        "hours": [{"index": h["index"], "ruler": kery_planet(h["ruler"]), "day": h["is_diurnal"],
                   "start": _iso(h["start"]), "end": _iso(h["end"])} for h in ph["hours"]],
        "panchang": panchang(jd, sunrise.astimezone(tz).weekday()),
    }


__all__ = ["calculate", "panchang", "MODULE_ID"]
