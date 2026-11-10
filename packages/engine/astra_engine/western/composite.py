"""Composite chart (midpoint method): each point and house cusp is the shorter-arc midpoint of the two
natal positions. Calculated by kerykeion's CompositeSubjectFactory, then shaped like a natal chart."""
from __future__ import annotations

import warnings
from datetime import time

from ..common.birth import BirthData, HouseSystem, resolve_utc
from . import natal

from kerykeion import CompositeSubjectFactory  # noqa: E402

MODULE_ID = "western.composite"
MODULE_VERSION = "0.1.0"
SKIP = {"partOfFortune"}


def calculate(birth: BirthData, partner: BirthData, house_system: HouseSystem = "P") -> dict:
    subjects = [natal.build_subject(b, resolve_utc(b.date, b.time or time(12, 0), b.timezone).utc, house_system)
                for b in (birth, partner)]
    with warnings.catch_warnings():
        warnings.simplefilter("ignore")
        comp = CompositeSubjectFactory(subjects[0], subjects[1]).get_midpoint_composite_subject_model()
    raw = {}
    for pid, attr, _ in natal.POINTS:
        p = getattr(comp, attr, None)
        if p is not None and pid not in SKIP:
            raw[pid] = (p.abs_pos, None, False)
    time_known = not (birth.time_unknown or partner.time_unknown)
    cusps = [getattr(comp, f"{h}_house").abs_pos for h in natal.HOUSE_ATTRS] if time_known else None
    angles = None
    if time_known:
        angles = {aid: getattr(comp, attr).abs_pos for aid, attr in natal.ANGLES}
    return {
        "module": MODULE_ID,
        "meta": {"engineVersion": MODULE_VERSION, "method": "midpoint", "timeUnknown": not time_known},
        "input": {"name": " & ".join(n for n in (birth.name, partner.name) if n) or None},
        **natal.assemble(raw, cusps, angles),
    }
