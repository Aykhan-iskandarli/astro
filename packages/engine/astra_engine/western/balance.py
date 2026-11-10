"""Element / modality / polarity balance, counted over the ten planets (one point each)."""
from __future__ import annotations

from ..common.zodiac import ELEMENTS, MODALITIES, element_of, modality_of, polarity_of

BALANCE_BODIES = ["sun", "moon", "mercury", "venus", "mars", "jupiter", "saturn", "uranus", "neptune", "pluto"]


def _dominant(counts: dict[str, int]) -> list[str]:
    top = max(counts.values())
    return [k for k, v in counts.items() if v == top]


def balance(signs: dict[str, str]) -> dict:
    elements = {e: 0 for e in ELEMENTS}
    modalities = {m: 0 for m in MODALITIES}
    polarity = {"positive": 0, "negative": 0}
    members: dict[str, list[str]] = {k: [] for k in [*ELEMENTS, *MODALITIES]}
    for body in BALANCE_BODIES:
        s = signs[body]
        e, m = element_of(s), modality_of(s)
        elements[e] += 1
        modalities[m] += 1
        polarity[polarity_of(s)] += 1
        members[e].append(body)
        members[m].append(body)
    return {
        "elements": elements,
        "modalities": modalities,
        "polarity": polarity,
        "members": members,
        "dominant": {"element": _dominant(elements), "modality": _dominant(modalities),
                     "polarity": _dominant(polarity)},
        "missing": {"element": [k for k, v in elements.items() if v == 0],
                    "modality": [k for k, v in modalities.items() if v == 0]},
    }
