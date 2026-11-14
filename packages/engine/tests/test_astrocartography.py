"""ACG lines: checked against raw Swiss Ephemeris (hour angle / altitude) and against kerykeion."""
import math
import warnings

import pytest
import swisseph as swe

from astra_engine import MODULES, BirthData
from astra_engine.common.birth import resolve_utc
from astra_engine.sky.common import jd_of
from astra_engine.western import astrocartography as acg
from conftest import BIRTHS

BIRTH = BIRTHS["baku-1990"]


def _jd():
    return jd_of(resolve_utc(BIRTH.date, BIRTH.time, BIRTH.timezone).utc)


def _lines():
    return MODULES["western.astrocartography"].calculate(BIRTH)["lines"]


def _altitude(jd, lon, lat, ra, dec):
    # Geometric altitude (no refraction): pressure 0
    _, true_alt, _ = swe.azalt(jd, swe.EQU2HOR, (lon, lat, 0), 0, 0, (ra, dec, 1))
    return true_alt


def test_mc_lines_are_where_the_planet_culminates():
    jd = _jd()
    gast = swe.sidtime(jd) * 15
    for line in _lines():
        if line["angle"] not in ("mc", "ic"):
            continue
        ra, _ = acg.equatorial(line["planet"], jd)
        lon = line["segments"][0][0][0]
        hour_angle = ((gast + lon - ra) + 180) % 360 - 180
        expected = 0 if line["angle"] == "mc" else 180
        assert abs(abs(hour_angle) - expected) < 1e-3


def test_horizon_lines_have_the_planet_on_the_horizon_rising_or_setting():
    jd = _jd()
    for line in _lines():
        if line["angle"] not in ("asc", "dsc"):
            continue
        ra, dec = acg.equatorial(line["planet"], jd)
        for seg in line["segments"]:
            for lon, lat in seg[::20]:
                assert abs(_altitude(jd, lon, lat, ra, dec)) < 0.01
                # Rising: higher a minute later; setting: lower (RA/Dec of the birth moment, Earth turning)
                later = _altitude(jd + 1 / 1440, lon, lat, ra, dec)
                assert (later > 0) == (line["angle"] == "asc")


def test_matches_kerykeion_astrocartography():
    import kerykeion as k
    from astra_engine.western import natal

    utc = resolve_utc(BIRTH.date, BIRTH.time, BIRTH.timezone).utc
    with warnings.catch_warnings():
        warnings.simplefilter("ignore")
        subject = natal.build_subject(BIRTH, utc)
        theirs = k.AstroCartographyFactory.compute(subject, planets=["Sun", "Moon", "Saturn"])
    ours = {(l["planet"], l["angle"]): l for l in _lines()}
    for line in theirs:
        mine = ours[(line.planet.lower(), line.line_type.lower())]
        pts = {round(p.latitude, 4): p.longitude for p in line.points}
        for seg in mine["segments"]:
            for lon, lat in seg:
                if round(lat, 4) in pts and abs(lat) < 60:
                    diff = abs(((lon - pts[round(lat, 4)]) + 180) % 360 - 180)
                    assert diff < 0.02, (line.planet, line.line_type, lat, lon, pts[round(lat, 4)])


def test_probe_lists_lines_near_a_place():
    out = MODULES["western.astrocartography"].calculate(BIRTH, probe=(40.4093, 49.8671))
    assert out["near"] is not None
    assert all(n["distanceKm"] <= acg.NEAR_KM for n in out["near"])
    assert out["near"] == sorted(out["near"], key=lambda n: n["distanceKm"])


def test_needs_birth_time():
    with pytest.raises(ValueError):
        MODULES["western.astrocartography"].calculate(BirthData(date=BIRTH.date, latitude=40, longitude=49,
                                                                 timezone="Asia/Baku"))
