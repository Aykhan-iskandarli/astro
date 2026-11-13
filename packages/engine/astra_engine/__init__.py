"""Astra calculation engine.

Every module exposes the same interface: ``calculate(birth_data, **options) -> dict`` (JSON-serialisable),
pure and deterministic. Modules are registered in ``MODULES`` by id.
"""
from typing import Callable, Protocol

from . import _backend  # noqa: F401  (must run before kerykeion is imported anywhere)
from .common.birth import BirthData, resolve_utc
from .chinese import bazi
from .destiny import matrix as destiny_matrix
from .numerology import core as numerology
from .vedic import chart as vedic_chart
from .sky import calendar as sky_calendar, moon as sky_moon, now as sky_now
from .western import composite, cycles, natal, progressions, returns, synastry, timeline, transits


class EngineModule(Protocol):
    MODULE_ID: str
    MODULE_VERSION: str
    calculate: Callable[..., dict]


MODULES: dict[str, EngineModule] = {
    natal.MODULE_ID: natal,                      # Phase 1
    destiny_matrix.MODULE_ID: destiny_matrix,    # Phase 2
    transits.MODULE_ID: transits,                # Phase 3
    synastry.MODULE_ID: synastry,                # Phase 3
    vedic_chart.MODULE_ID: vedic_chart,          # Phase 4
    numerology.MODULE_ID: numerology,            # Phase 5
    bazi.MODULE_ID: bazi,                        # Phase 6 (Zi Wei Dou Shu runs in the web app via iztro)
    returns.MODULE_ID: returns,                  # Phase 7
    progressions.MODULE_ID: progressions,        # Phase 7
    composite.MODULE_ID: composite,              # Phase 7
    timeline.MODULE_ID: timeline,                # transit timeline
    cycles.MODULE_ID: cycles,                    # planetary returns (Jupiter/Saturn/Chiron) + profections
}

# The sky itself is not tied to a birth chart: calculate(at) / calculate(start, end)
SKY: dict[str, EngineModule] = {sky_now.MODULE_ID: sky_now, sky_calendar.MODULE_ID: sky_calendar,
                                 sky_moon.MODULE_ID: sky_moon}

__all__ = ["BirthData", "MODULES", "SKY", "EngineModule", "resolve_utc"]
