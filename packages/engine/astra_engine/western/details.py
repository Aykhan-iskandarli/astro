"""Deeper natal details: declinations (out of bounds), antiscia, mutual receptions, dominants, prenatal eclipses.

- Declination from Swiss Ephemeris equatorial coordinates; a body is out of bounds when |declination| exceeds the
  true obliquity of the ecliptic at birth.
- Antiscion = 180° - longitude (mirror over the Cancer–Capricorn axis), contra-antiscion = 360° - longitude.
  A contact is listed when one body's (contra-)antiscion falls within ANTISCIA_ORB of another body.
- Mutual receptions (domicile and exaltation) and dominants (kerykeion's "modern" strategy) come from kerykeion.
- Prenatal eclipses: the last solar and lunar eclipse before the birth moment.
- Fixed stars (ephe/sefstars.txt): conjunctions of major stars with the planets and angles within FIXED_STAR_ORB.
- Hellenistic lots (Paulus Alexandrinus), reversed by night: Eros = ASC + Venus - Spirit, Necessity = ASC + Fortune -
  Mercury, Courage = ASC + Fortune - Mars, Victory = ASC + Jupiter - Spirit, Nemesis = ASC + Fortune - Saturn
  (Fortune = ASC + Moon - Sun, Spirit = ASC + Sun - Moon by day). Need a birth time.
- Harmonic charts H5, H7, H9: every longitude multiplied by the harmonic; conjunctions within HARMONIC_ORB.
"""
from __future__ import annotations

import warnings
from datetime import datetime, time, timedelta, timezone

from .._backend import swe
from ..common.birth import BirthData, resolve_utc
from ..common.zodiac import house_of, norm, sign_of, split_degree
from ..sky.common import kery_planet
from . import natal

from kerykeion.dominants.factory import DominantsFactory  # noqa: E402
from kerykeion.receptions.factory import MutualReceptionsFactory  # noqa: E402

MODULE_ID = "western.details"
MODULE_VERSION = "0.1.0"
ANTISCIA_ORB = 1.5
FIXED_STAR_ORB = 1.0
HARMONIC_ORB = 2.0
HARMONICS = (5, 7, 9)
FIXED_STARS = ["Aldebaran", "Regulus", "Antares", "Fomalhaut", "Spica", "Algol", "Sirius", "Arcturus", "Vega",
               "Betelgeuse", "Rigel", "Pollux", "Procyon", "Capella", "Alcyone", "Canopus", "Altair", "Deneb"]
PLANETS = ["sun", "moon", "mercury", "venus", "mars", "jupiter", "saturn", "uranus", "neptune", "pluto"]
BODIES = {"sun": swe.SUN, "moon": swe.MOON, "mercury": swe.MERCURY, "venus": swe.VENUS, "mars": swe.MARS,
          "jupiter": swe.JUPITER, "saturn": swe.SATURN, "uranus": swe.URANUS, "neptune": swe.NEPTUNE,
          "pluto": swe.PLUTO, "chiron": swe.CHIRON}
FLAGS = swe.FLG_SWIEPH


def _pos(lon: float) -> dict:
    d, m, _ = split_degree(lon)
    return {"longitude": round(norm(lon), 4), "sign": sign_of(lon), "degree": d, "minute": m}


def _iso(jd: float) -> str:
    y, m, d, h = swe.revjul(jd)
    dt = datetime(y, m, d, tzinfo=timezone.utc) + timedelta(seconds=round(h * 3600))
    return dt.isoformat().replace("+00:00", "Z")


def declinations(jd: float) -> dict:
    obliquity = swe.calc_ut(jd, swe.ECL_NUT, 0)[0][0]
    out = []
    for pid, body in BODIES.items():
        dec = swe.calc_ut(jd, body, FLAGS | swe.FLG_EQUATORIAL)[0][1]
        out.append({"id": pid, "declination": round(dec, 4), "outOfBounds": abs(dec) > obliquity})
    return {"obliquity": round(obliquity, 4), "points": out}


def antiscia(points: list[dict]) -> dict:
    lons = {p["id"]: p["longitude"] for p in points if p["id"] in BODIES}
    mirrors = [{"id": pid, "antiscion": _pos(180 - lon), "contra": _pos(360 - lon)} for pid, lon in lons.items()]
    contacts = []
    ids = list(lons)
    for i, a in enumerate(ids):
        for b in ids[i + 1:]:
            for kind, mirror in (("antiscion", 180 - lons[a]), ("contra", 360 - lons[a])):
                orb = abs((norm(mirror) - lons[b] + 180) % 360 - 180)
                if orb <= ANTISCIA_ORB:
                    contacts.append({"a": a, "b": b, "kind": kind, "orb": round(orb, 2)})
    return {"orb": ANTISCIA_ORB, "points": mirrors, "contacts": contacts}


def prenatal_eclipses(jd: float) -> dict:
    solar_flags, solar = swe.sol_eclipse_when_glob(jd, FLAGS, 0, True)
    lunar_flags, lunar = swe.lun_eclipse_when(jd, FLAGS, 0, True)
    solar_type = ("total" if solar_flags & swe.ECL_TOTAL else
                  "annular" if solar_flags & swe.ECL_ANNULAR else "partial")
    lunar_type = ("total" if lunar_flags & swe.ECL_TOTAL else
                  "partial" if lunar_flags & swe.ECL_PARTIAL else "penumbral")
    return {
        "solar": {"at": _iso(solar[0]), "type": solar_type, **_pos(swe.calc_ut(solar[0], swe.SUN, FLAGS)[0][0])},
        "lunar": {"at": _iso(lunar[0]), "type": lunar_type, **_pos(swe.calc_ut(lunar[0], swe.MOON, FLAGS)[0][0])},
    }


def _sep(a: float, b: float) -> float:
    return abs((a - b + 180) % 360 - 180)


def fixed_stars(jd: float, points: dict[str, float]) -> dict:
    stars, contacts = [], []
    for name in FIXED_STARS:
        try:
            xx, _, _ = swe.fixstar2_ut(name, jd, FLAGS)
        except swe.Error:  # not in the catalogue under this name
            continue
        sid = name.lower()
        stars.append({"id": sid, **_pos(xx[0])})
        for pid, lon in points.items():
            orb = _sep(xx[0], lon)
            if orb <= FIXED_STAR_ORB:
                contacts.append({"star": sid, "point": pid, "orb": round(orb, 2)})
    return {"orb": FIXED_STAR_ORB, "stars": stars, "contacts": sorted(contacts, key=lambda c: c["orb"])}


def lots(points: dict[str, float], asc: float, day: bool, cusps: list[float] | None) -> list[dict]:
    sun, moon = points["sun"], points["moon"]
    fortune = asc + moon - sun if day else asc + sun - moon
    spirit = asc + sun - moon if day else asc + moon - sun

    def lot(a: float, b: float) -> float:  # ASC + a - b by day, ASC + b - a by night
        return norm(asc + a - b if day else asc + b - a)

    raw = {
        "eros": lot(points["venus"], spirit), "necessity": lot(fortune, points["mercury"]),
        "courage": lot(fortune, points["mars"]), "victory": lot(points["jupiter"], spirit),
        "nemesis": lot(fortune, points["saturn"]),
    }
    return [{"id": lid, **_pos(lon), "house": house_of(lon, cusps) if cusps else None} for lid, lon in raw.items()]


def harmonics(points: dict[str, float]) -> dict:
    out = {}
    for n in HARMONICS:
        pos = {pid: norm(lon * n) for pid, lon in points.items()}
        ids = list(pos)
        conj = [{"a": a, "b": b, "orb": round(_sep(pos[a], pos[b]), 2)}
                for i, a in enumerate(ids) for b in ids[i + 1:] if _sep(pos[a], pos[b]) <= HARMONIC_ORB]
        out[str(n)] = {"points": [{"id": pid, **_pos(lon)} for pid, lon in pos.items()],
                       "conjunctions": sorted(conj, key=lambda c: c["orb"])}
    return {"orb": HARMONIC_ORB, "charts": out}


def calculate(birth: BirthData, **_options) -> dict:
    resolved = resolve_utc(birth.date, birth.time or time(12, 0), birth.timezone)
    utc = resolved.utc
    jd = swe.julday(utc.year, utc.month, utc.day, utc.hour + utc.minute / 60 + utc.second / 3600)
    chart = natal.calculate(birth)
    planet_lons = {p["id"]: p["longitude"] for p in chart["points"] if p["id"] in PLANETS}
    angles_and_planets = dict(planet_lons)
    if chart["angles"]:
        angles_and_planets.update({a: chart["angles"][a]["longitude"] for a in ("asc", "mc")})
    subject = natal.build_subject(birth, utc)
    with warnings.catch_warnings():
        warnings.simplefilter("ignore")
        receptions = MutualReceptionsFactory.from_subject(subject).model_dump()["receptions"]
        dom = DominantsFactory.from_subject(subject, strategy="modern",
                                            active_points=["Sun", "Moon", "Mercury", "Venus", "Mars", "Jupiter",
                                                           "Saturn", "Uranus", "Neptune", "Pluto"]).model_dump()
    return {
        "module": MODULE_ID,
        "meta": {"engineVersion": MODULE_VERSION, "dominants": "kerykeion modern", "timeUnknown": birth.time_unknown},
        "declinations": declinations(jd),
        "antiscia": antiscia(chart["points"]),
        "receptions": [{"a": kery_planet(r["first_planet"]), "b": kery_planet(r["second_planet"]), "type": r["reception_type"]}
                       for r in receptions],
        "dominants": {
            "planets": [{"id": kery_planet(p["name"]), "score": round(p["score"], 2), "percentage": p["percentage"],
                         "dominant": p["is_dominant"]} for p in dom["planets"]],
            "planet": kery_planet(dom["dominant_planet"]) if dom.get("dominant_planet") else None,
            "element": (dom.get("dominant_element") or "").lower() or None,
            "quality": (dom.get("dominant_quality") or "").lower() or None,
        },
        "prenatalEclipses": prenatal_eclipses(jd),
        "fixedStars": fixed_stars(jd, angles_and_planets),
        "lots": None if birth.time_unknown else lots(planet_lons, chart["angles"]["asc"]["longitude"],
                                                     chart["sect"] == "day", [h["longitude"] for h in chart["houses"]]),
        "harmonics": harmonics(planet_lons),
    }


__all__ = ["calculate", "declinations", "antiscia", "prenatal_eclipses", "MODULE_ID"]
