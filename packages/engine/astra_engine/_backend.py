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

import threading  # noqa: E402

import swisseph as _swe  # noqa: E402
from kerykeion.ephemeris_backend import backend as _kery_backend  # noqa: E402

# Swiss Ephemeris keeps its settings per thread (thread-local storage), and kerykeion closes the session
# (which clears the path) after each of its calculations. A path set once at import therefore does not reach
# the API's worker threads: planets would silently fall back to the lower-precision Moshier model and Chiron
# would fail. So the path is applied once per thread, and again after every kerykeion reset in that thread.
# (Setting it before every call would be correct too, but it reopens the files each time and is very slow.)
_local = threading.local()


def _ensure_path() -> None:
    if not getattr(_local, "ready", False):
        _swe.set_ephe_path(EPHE_PATH)
        _local.ready = True


_kery_reset = _kery_backend.reset_ephemeris_session


def _reset_and_forget() -> None:
    try:
        _kery_reset()
    finally:
        _local.ready = False


_kery_backend.reset_ephemeris_session = _reset_and_forget

_COMPUTE = {"calc_ut", "calc", "pheno_ut", "pheno", "houses", "houses_ex", "houses_armc", "fixstar_ut",
            "fixstar2_ut", "get_ayanamsa_ut", "get_ayanamsa_ex_ut", "nod_aps_ut", "rise_trans",
            "sol_eclipse_when_glob", "lun_eclipse_when"}


class _EphemerisProxy:
    """`swe` for the engine: computing functions make sure this thread uses our ephemeris files."""

    def __init__(self, module):
        self._m = module

    def __getattr__(self, name):
        attr = getattr(self._m, name)
        if name not in _COMPUTE:
            return attr

        def call(*args, **kwargs):
            _ensure_path()
            return attr(*args, **kwargs)
        return call


swe = _EphemerisProxy(_swe)
_ensure_path()

if BACKEND_NAME != "swisseph":  # pragma: no cover - guarded by tests
    raise RuntimeError(f"astra_engine requires the swisseph backend, got {BACKEND_NAME!r}")

from importlib.metadata import version as _v  # noqa: E402

LIBRARY_VERSION = f"kerykeion {_v('kerykeion')} / swisseph {swe.version}"

__all__ = ["kerykeion", "swe", "EPHE_PATH", "LIBRARY_VERSION", "BACKEND_NAME"]
