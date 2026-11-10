"""Forces kerykeion onto the Swiss Ephemeris backend with our bundled .se1 files.

Must be imported before anything imports kerykeion. See docs/spike-report.md: the default
libephemeris backend computes Chiron by a Keplerian approximation (2.3' error measured).
"""
import os
import warnings
from pathlib import Path

EPHE_PATH = str(Path(__file__).parent / "ephe")

os.environ["KERYKEION_BACKEND"] = "swisseph"
os.environ["KERYKEION_EPHE_PATH"] = EPHE_PATH

with warnings.catch_warnings():
    warnings.simplefilter("ignore")
    import kerykeion  # noqa: E402
    from kerykeion.ephemeris_backend.backend import BACKEND_NAME  # noqa: E402

import swisseph as swe  # noqa: E402

swe.set_ephe_path(EPHE_PATH)

if BACKEND_NAME != "swisseph":  # pragma: no cover - guarded by tests
    raise RuntimeError(f"astra_engine requires the swisseph backend, got {BACKEND_NAME!r}")

from importlib.metadata import version as _v  # noqa: E402

LIBRARY_VERSION = f"kerykeion {_v('kerykeion')} / swisseph {swe.version}"

__all__ = ["kerykeion", "swe", "EPHE_PATH", "LIBRARY_VERSION", "BACKEND_NAME"]
