"""Extra points for the natal chart: the four main asteroids, the Vertex and fixed-star conjunctions.

* Asteroids (Ceres, Pallas, Juno, Vesta): Swiss Ephemeris, from the bundled ``seas_*.se1`` files.
* Vertex: ``swe.houses_ex`` (ascmc[3]); it does not depend on the house system. Needs the birth time.
* Fixed stars: positions from libephemeris' Hipparcos-based catalogue (AGPL-3.0, already a kerykeion
  dependency). ``sefstars.txt`` is deliberately not used (its licensing is unclear, as kerykeion notes).
  Only a curated list of well-known stars is checked, with a tight 1° conjunction orb.
"""
from __future__ import annotations

from .._backend import swe
from ..common.zodiac import house_of, norm, separation, sign_of, split_degree

import libephemeris  # noqa: E402  (fixed-star catalogue only)

ASTEROIDS = {"ceres": swe.CERES, "pallas": swe.PALLAS, "juno": swe.JUNO, "vesta": swe.VESTA}
STARS = ["Regulus", "Spica", "Aldebaran", "Antares", "Fomalhaut", "Algol", "Sirius", "Betelgeuse", "Rigel",
         "Vega", "Arcturus", "Pollux", "Procyon", "Alcyone", "Capella"]
STAR_ORB = 1.0
STAR_TARGETS = ["sun", "moon", "mercury", "venus", "mars", "jupiter", "saturn", "uranus", "neptune", "pluto"]


def _position(lon: float) -> dict:
    d, m, s = split_degree(lon)
    return {"longitude": round(norm(lon), 6), "sign": sign_of(lon), "degree": d, "minute": m, "second": s}


def star_longitude(name: str, jd_ut: float) -> float:
    """Tropical ecliptic longitude of date (apparent) for a catalogue star."""
    xx, _, _ = libephemeris.fixstar2_ut(name, jd_ut, libephemeris.FLG_SWIEPH)
    return xx[0]


def calculate(jd_ut: float, latitude: float, longitude: float, cusps: list[float] | None,
              points: list[dict], angles: dict | None) -> dict:
    asteroids = []
    for pid, swe_id in ASTEROIDS.items():
        xx, _ = swe.calc_ut(jd_ut, swe_id, swe.FLG_SWIEPH | swe.FLG_SPEED)
        asteroids.append({"id": pid, **_position(xx[0]), "speed": round(xx[3], 6), "retrograde": xx[3] < 0,
                          "house": house_of(xx[0], cusps) if cusps else None})

    vertex = None
    if angles:
        # The Vertex does not depend on the house system; Porphyry also works inside the polar circles
        _, ascmc = swe.houses_ex(jd_ut, latitude, longitude, b"O")
        vertex = {"id": "vertex", **_position(ascmc[3]), "house": house_of(ascmc[3], cusps) if cusps else None}

    targets = [(p["id"], p["longitude"]) for p in points if p["id"] in STAR_TARGETS]
    if angles:
        targets += [(a, angles[a]["longitude"]) for a in ("asc", "mc")]
    stars = []
    for name in STARS:
        lon = star_longitude(name, jd_ut)
        for tid, tlon in targets:
            orb = separation(lon, tlon)
            if orb <= STAR_ORB:
                stars.append({"star": name.lower(), **_position(lon), "point": tid, "orb": round(orb, 4)})
    stars.sort(key=lambda s: s["orb"])
    return {"asteroids": asteroids, "vertex": vertex, "fixedStars": stars, "starOrb": STAR_ORB}
