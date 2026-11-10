"""Golden tests: engine output vs raw pyswisseph with the same ephemeris files. Tolerance < 1 arcminute."""
import pytest

from astra_engine import resolve_utc
from astra_engine._backend import swe
from astra_engine.common.zodiac import norm
from astra_engine.western import natal

TOL_DEG = 1 / 60
FLAGS = swe.FLG_SWIEPH | swe.FLG_SPEED
REF_IDS = {"sun": swe.SUN, "moon": swe.MOON, "mercury": swe.MERCURY, "venus": swe.VENUS, "mars": swe.MARS,
           "jupiter": swe.JUPITER, "saturn": swe.SATURN, "uranus": swe.URANUS, "neptune": swe.NEPTUNE,
           "pluto": swe.PLUTO, "northNode": swe.TRUE_NODE, "lilith": swe.MEAN_APOG, "chiron": swe.CHIRON}


def diff(a, b):
    return abs((a - b + 180) % 360 - 180)


def reference(b, hsys="P"):
    utc = resolve_utc(b.date, b.time, b.timezone).utc
    jd = swe.julday(utc.year, utc.month, utc.day, utc.hour + utc.minute / 60 + utc.second / 3600)
    bodies = {}
    for pid, sid in REF_IDS.items():
        xx, flag = swe.calc_ut(jd, sid, FLAGS)
        assert flag & swe.FLG_SWIEPH, f"{pid}: reference fell back from Swiss Ephemeris files"
        bodies[pid] = xx[0]
    bodies["southNode"] = norm(bodies["northNode"] + 180)
    cusps, ascmc = swe.houses_ex(jd, b.latitude, b.longitude, hsys.encode())
    return bodies, list(cusps), ascmc[0], ascmc[1]


def test_utc_resolution(birth):
    bid, b = birth
    expected = {"baku-1990": "1990-06-15T09:30:00Z", "london-2000": "2000-01-01T12:00:00Z",
                "sydney-1985": "1985-11-02T21:15:00Z", "newyork-1975-night": "1975-03-11T03:40:00Z"}[bid]
    assert natal.calculate(b)["input"]["utcDatetime"] == expected


def test_points_match_reference(birth):
    _, b = birth
    out = natal.calculate(b)
    ref, *_ = reference(b)
    by_id = {p["id"]: p for p in out["points"]}
    for pid, lon in ref.items():
        assert diff(by_id[pid]["longitude"], lon) < TOL_DEG, pid


@pytest.mark.parametrize("hsys", ["P", "K", "W", "A"])
def test_houses_and_angles_match_reference(birth, hsys):
    _, b = birth
    out = natal.calculate(b, house_system=hsys)
    _, cusps, asc, mc = reference(b, hsys)
    assert out["meta"]["houseSystem"] == natal.HOUSE_SYSTEM_NAMES[hsys]
    for h, c in zip(out["houses"], cusps):
        assert diff(h["longitude"], c) < TOL_DEG, f"cusp {h['number']}"
    assert diff(out["angles"]["asc"]["longitude"], asc) < TOL_DEG
    assert diff(out["angles"]["mc"]["longitude"], mc) < TOL_DEG
    assert diff(out["angles"]["dc"]["longitude"], asc + 180) < TOL_DEG
    assert diff(out["angles"]["ic"]["longitude"], mc + 180) < TOL_DEG


def test_part_of_fortune_sect_formula(birth):
    _, b = birth
    out = natal.calculate(b)
    ref, _, asc, _ = reference(b)
    is_day = norm(ref["sun"] - asc) > 180
    expected = norm(asc + ref["moon"] - ref["sun"]) if is_day else norm(asc + ref["sun"] - ref["moon"])
    pof = next(p for p in out["points"] if p["id"] == "partOfFortune")
    assert out["sect"] == ("day" if is_day else "night")
    assert diff(pof["longitude"], expected) < TOL_DEG


def test_night_birth_is_night():
    from conftest import BIRTHS
    assert natal.calculate(BIRTHS["newyork-1975-night"])["sect"] == "night"
