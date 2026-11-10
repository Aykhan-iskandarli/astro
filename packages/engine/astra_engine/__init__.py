"""Astra calculation engine.

Every module exposes the same interface: ``calculate(birth_data, **options) -> dict`` (JSON-serialisable),
pure and deterministic. Modules are registered in ``MODULES`` by id.
"""
from typing import Callable, Protocol

from . import _backend  # noqa: F401  (must run before kerykeion is imported anywhere)
from .common.birth import BirthData, resolve_utc
from .destiny import matrix as destiny_matrix
from .vedic import chart as vedic_chart
from .western import natal, synastry, transits


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
    # Phase 5+: "numerology.core", "chinese.bazi", ...
}

__all__ = ["BirthData", "MODULES", "EngineModule", "resolve_utc"]
