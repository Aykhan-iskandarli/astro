"""Shared helpers: Swiss Ephemeris positions by our point ids, and kerykeion name/sign mapping."""
from __future__ import annotations

from datetime import datetime, timezone

from .._backend import swe
from ..common.zodiac import SIGNS, norm, sign_of, split_degree

SWE_IDS = {
    "sun": swe.SUN, "moon": swe.MOON, "mercury": swe.MERCURY, "venus": swe.VENUS, "mars": swe.MARS,
    "jupiter": swe.JUPITER, "saturn": swe.SATURN, "uranus": swe.URANUS, "neptune": swe.NEPTUNE,
    "pluto": swe.PLUTO, "northNode": swe.TRUE_NODE, "chiron": swe.CHIRON,
}
FLAGS = swe.FLG_SWIEPH | swe.FLG_SPEED

# kerykeion uses three-letter sign abbreviations and capitalised planet names
_KERY_SIGNS = {s[:3].capitalize(): s for s in SIGNS}


def kery_sign(abbr: str | None) -> str | None:
    return _KERY_SIGNS.get(abbr) if abbr else None


def kery_planet(name: str | None) -> str | None:
    if not name:
        return None
    low = name.lower()
    if low in ("true_north_lunar_node", "mean_north_lunar_node", "north_node"):
        return "northNode"
    if low in ("true_south_lunar_node", "mean_south_lunar_node", "south_node"):
        return "southNode"
    return low


def jd_of(dt: datetime) -> float:
    dt = dt.astimezone(timezone.utc)
    return swe.julday(dt.year, dt.month, dt.day,
                      dt.hour + dt.minute / 60 + (dt.second + dt.microsecond / 1e6) / 3600)


def iso(dt: datetime | None) -> str | None:
    if dt is None:
        return None
    return dt.astimezone(timezone.utc).replace(microsecond=0).isoformat().replace("+00:00", "Z")


def iso_from_jd(jd: float) -> str:
    y, m, d, h = swe.revjul(jd)
    secs = round(h * 3600)
    dt = datetime(y, m, d, tzinfo=timezone.utc).timestamp() + secs
    return iso(datetime.fromtimestamp(dt, tz=timezone.utc))


def longitude(pid: str, jd: float) -> tuple[float, float]:
    """(ecliptic longitude, speed in °/day) for one of our point ids."""
    xx, _ = swe.calc_ut(jd, SWE_IDS[pid], FLAGS)
    return xx[0], xx[3]


def position(pid: str, jd: float) -> dict:
    lon, speed = longitude(pid, jd)
    d, m, s = split_degree(lon)
    return {"id": pid, "longitude": round(norm(lon), 6), "sign": sign_of(lon), "degree": d, "minute": m,
            "second": s, "speed": round(speed, 6), "retrograde": speed < 0}
