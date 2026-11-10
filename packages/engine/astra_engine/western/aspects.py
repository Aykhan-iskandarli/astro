"""Aspects between chart points. Pure functions over longitudes and speeds."""
from __future__ import annotations

from dataclasses import dataclass

from ..common.zodiac import norm, separation

# name -> exact angle, base orb. Luminaries (Sun/Moon) get LUMINARY_BONUS extra on major aspects.
ASPECTS: dict[str, tuple[float, float]] = {
    "conjunction": (0, 8),
    "opposition": (180, 8),
    "trine": (120, 7),
    "square": (90, 7),
    "sextile": (60, 5),
    "quincunx": (150, 3),
    "semisextile": (30, 2),
    "semisquare": (45, 2),
    "sesquiquadrate": (135, 2),
}
MAJOR = {"conjunction", "opposition", "trine", "square", "sextile"}
LUMINARIES = {"sun", "moon"}
LUMINARY_BONUS = 2.0
ANGLE_ORB = 5.0  # ASC/MC: major aspects only, tighter orb

# Pairs that are structurally fixed and therefore not reported as aspects
SKIP_PAIRS = {frozenset({"northNode", "southNode"}), frozenset({"asc", "mc"})}


@dataclass(frozen=True)
class AspectPoint:
    id: str
    longitude: float
    speed: float | None  # deg/day; None for angles (treated as not moving)
    is_angle: bool = False


def orb_limit(aspect: str, a: AspectPoint, b: AspectPoint) -> float | None:
    angle, orb = ASPECTS[aspect]
    if a.is_angle or b.is_angle:
        return ANGLE_ORB if aspect in MAJOR else None
    if aspect in MAJOR and (a.id in LUMINARIES or b.id in LUMINARIES):
        orb += LUMINARY_BONUS
    return orb


def _is_applying(a: AspectPoint, b: AspectPoint, angle: float) -> bool | None:
    if a.speed is None or b.speed is None or a.is_angle or b.is_angle:
        return None
    dt = 0.01  # days
    now = abs(separation(a.longitude, b.longitude) - angle)
    later = abs(separation(norm(a.longitude + a.speed * dt), norm(b.longitude + b.speed * dt)) - angle)
    return later < now


def find_aspects(points: list[AspectPoint]) -> list[dict]:
    """Return the closest qualifying aspect for every pair, sorted by orb."""
    found = []
    for i, a in enumerate(points):
        for b in points[i + 1:]:
            if frozenset({a.id, b.id}) in SKIP_PAIRS:
                continue
            sep = separation(a.longitude, b.longitude)
            best = None
            for name, (angle, _) in ASPECTS.items():
                limit = orb_limit(name, a, b)
                if limit is None:
                    continue
                orb = abs(sep - angle)
                if orb <= limit and (best is None or orb < best[1]):
                    best = (name, orb, angle)
            if best:
                name, orb, angle = best
                found.append({"p1": a.id, "p2": b.id, "type": name, "angle": angle,
                              "orb": round(orb, 4), "applying": _is_applying(a, b, angle),
                              "major": name in MAJOR})
    return sorted(found, key=lambda x: x["orb"])


def find_cross_aspects(first: list[AspectPoint], second: list[AspectPoint], orbs: dict[str, float],
                       moving: str | None = None) -> list[dict]:
    """Aspects between two point sets (transit-to-natal, synastry). p1 is from `first`, p2 from `second`.

    orbs: aspect name -> max orb (aspects missing from the dict are not used).
    moving: "first" when only the first set moves (transits): applying/separating is computed with the second
    set held still. None leaves `applying` empty (synastry has no time direction).
    """
    found = []
    for a in first:
        for b in second:
            sep = separation(a.longitude, b.longitude)
            best = None
            for name, limit in orbs.items():
                angle = ASPECTS[name][0]
                orb = abs(sep - angle)
                if orb <= limit and (best is None or orb < best[1]):
                    best = (name, orb, angle)
            if not best:
                continue
            name, orb, angle = best
            applying = None
            if moving == "first" and a.speed is not None:
                applying = _is_applying(a, AspectPoint(b.id, b.longitude, 0.0), angle)
            found.append({"p1": a.id, "p2": b.id, "type": name, "angle": angle, "orb": round(orb, 4),
                          "applying": applying, "major": name in MAJOR})
    return sorted(found, key=lambda x: x["orb"])
