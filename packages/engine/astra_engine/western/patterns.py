"""Aspect patterns (configurations) detected from an aspect list. Pure functions."""
from __future__ import annotations

from collections import defaultdict
from itertools import combinations

from ..common.zodiac import element_of, modality_of

PATTERN_BODIES = {"sun", "moon", "mercury", "venus", "mars", "jupiter", "saturn", "uranus", "neptune", "pluto"}


def _graph(aspects: list[dict]) -> dict[frozenset, str]:
    return {frozenset({a["p1"], a["p2"]}): a["type"] for a in aspects
            if a["p1"] in PATTERN_BODIES and a["p2"] in PATTERN_BODIES}


def _has(g: dict, a: str, b: str, kind: str) -> bool:
    return g.get(frozenset({a, b})) == kind


def find_patterns(aspects: list[dict], signs: dict[str, str], houses: dict[str, int | None]) -> list[dict]:
    """
    aspects: output of find_aspects; signs: point id -> sign; houses: point id -> house (or None).
    Only the ten planets take part (nodes, Lilith, Chiron and angles are excluded).
    """
    g = _graph(aspects)
    bodies = sorted({p for pair in g for p in pair})
    out: list[dict] = []

    grand_trines = [t for t in combinations(bodies, 3)
                    if all(_has(g, x, y, "trine") for x, y in combinations(t, 2))]
    for t in grand_trines:
        elements = {element_of(signs[p]) for p in t}
        out.append({"type": "grandTrine", "points": list(t),
                    "element": elements.pop() if len(elements) == 1 else None})

    for a, b in combinations(bodies, 2):
        if not _has(g, a, b, "opposition"):
            continue
        for c in bodies:
            if c in (a, b) or not (_has(g, a, c, "square") and _has(g, b, c, "square")):
                continue
            # Grand cross: a fourth point opposite the apex, square to a and b
            cross = [d for d in bodies if d not in (a, b, c) and _has(g, c, d, "opposition")
                     and _has(g, a, d, "square") and _has(g, b, d, "square")]
            if not cross:
                out.append({"type": "tSquare", "points": [a, b, c], "apex": c,
                            "modality": modality_of(signs[c])})
        for c, d in combinations([x for x in bodies if x not in (a, b)], 2):
            if (_has(g, c, d, "opposition") and _has(g, a, c, "square") and _has(g, a, d, "square")
                    and _has(g, b, c, "square") and _has(g, b, d, "square")):
                out.append({"type": "grandCross", "points": sorted([a, b, c, d]),
                            "modality": modality_of(signs[a])})
            # Mystic rectangle: two oppositions joined by trines and sextiles
            if _has(g, c, d, "opposition"):
                for x, y, z, w in ((a, c, b, d), (a, d, b, c)):
                    if ((_has(g, x, y, "trine") and _has(g, z, w, "trine")
                         and _has(g, x, w, "sextile") and _has(g, y, z, "sextile"))
                            or (_has(g, x, y, "sextile") and _has(g, z, w, "sextile")
                                and _has(g, x, w, "trine") and _has(g, y, z, "trine"))):
                        out.append({"type": "mysticRectangle", "points": sorted([a, b, c, d])})
                        break

    for a, b in combinations(bodies, 2):
        if not _has(g, a, b, "sextile"):
            continue
        for c in bodies:
            if c not in (a, b) and _has(g, a, c, "quincunx") and _has(g, b, c, "quincunx"):
                out.append({"type": "yod", "points": [a, b, c], "apex": c})

    for t in grand_trines:
        for d in bodies:
            if d in t:
                continue
            for i, opp in enumerate(t):
                others = [p for j, p in enumerate(t) if j != i]
                if _has(g, d, opp, "opposition") and all(_has(g, d, o, "sextile") for o in others):
                    out.append({"type": "kite", "points": sorted([*t, d]), "apex": d})

    by_sign: dict[str, list[str]] = defaultdict(list)
    by_house: dict[int, list[str]] = defaultdict(list)
    for p in sorted(PATTERN_BODIES):
        by_sign[signs[p]].append(p)
        if houses.get(p) is not None:
            by_house[houses[p]].append(p)
    for sign, ps in by_sign.items():
        if len(ps) >= 3:
            out.append({"type": "stellium", "points": ps, "sign": sign})
    for house, ps in by_house.items():
        if len(ps) >= 3:
            out.append({"type": "stellium", "points": ps, "house": house})

    # Deduplicate (mystic rectangles/grand crosses are found from both oppositions)
    seen, unique = set(), []
    for p in out:
        key = (p["type"], tuple(sorted(p["points"])), p.get("sign"), p.get("house"))
        if key not in seen:
            seen.add(key)
            unique.append(p)
    return unique
