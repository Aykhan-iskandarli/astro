"""Shape, determinism and edge cases of the natal module."""
import json
from datetime import date

from astra_engine import MODULES, BirthData
from astra_engine._backend import BACKEND_NAME
from astra_engine.western import natal
from conftest import BIRTHS


def test_backend_is_swiss_ephemeris():
    assert BACKEND_NAME == "swisseph"


def test_registered_under_common_interface():
    assert MODULES["western.natal"].calculate is natal.calculate


def test_deterministic_and_json_serialisable():
    b = BIRTHS["baku-1990"]
    a, c = natal.calculate(b), natal.calculate(b)
    assert json.dumps(a, sort_keys=True) == json.dumps(c, sort_keys=True)


def test_baku_known_values():
    """Spot values cross-checked with the spike's kerykeion SVG (astro-seek style output)."""
    out = natal.calculate(BIRTHS["baku-1990"])
    by_id = {p["id"]: p for p in out["points"]}
    sun = by_id["sun"]
    assert (sun["sign"], sun["degree"], sun["minute"], sun["house"]) == ("gemini", 24, 1, 9)
    assert by_id["saturn"]["retrograde"] is True and by_id["saturn"]["sign"] == "capricorn"
    assert by_id["saturn"]["dignity"] == "domicile"
    assert out["angles"]["asc"]["sign"] == "libra"
    assert out["lunarPhase"]["phase"] == "disseminating"
    assert len(out["points"]) == 15 and len(out["houses"]) == 12


def test_time_unknown_has_no_houses_but_moon_range():
    b = BirthData(date=date(1990, 6, 15), latitude=40.4093, longitude=49.8671, timezone="Asia/Baku")
    out = natal.calculate(b)
    assert out["meta"]["timeUnknown"] is True
    assert out["houses"] is None and out["angles"] is None and out["sect"] is None
    assert all(p["house"] is None for p in out["points"])
    assert "partOfFortune" not in {p["id"] for p in out["points"]}
    assert not any(a["p1"] in ("asc", "mc") or a["p2"] in ("asc", "mc") for a in out["aspects"])
    start, end = out["moonRange"]["start"]["longitude"], out["moonRange"]["end"]["longitude"]
    assert 11 < (end - start) % 360 < 16  # the Moon moves ~12-15° per day


def test_polar_latitude_falls_back_to_porphyry_and_says_so():
    from datetime import time
    from astra_engine._backend import swe
    b = BirthData(date=date(1990, 12, 21), time=time(12, 0), latitude=69.6492, longitude=18.9553,
                  timezone="Europe/Oslo")  # Tromso
    out = natal.calculate(b, house_system="P")
    assert out["meta"]["houseSystemRequested"] == "placidus"
    assert out["meta"]["houseSystem"] == "porphyry"
    jd = out["input"]["julianDay"]
    cusps, _ = swe.houses_ex(jd, b.latitude, b.longitude, b"O")
    assert all(abs((h["longitude"] - c + 180) % 360 - 180) < 1 / 60 for h, c in zip(out["houses"], cusps))
    # Whole Sign is defined everywhere and must not be flagged
    assert natal.calculate(b, house_system="W")["meta"]["houseSystem"] == "wholeSign"


def test_south_node_opposite_north():
    out = natal.calculate(BIRTHS["sydney-1985"])
    by_id = {p["id"]: p for p in out["points"]}
    d = (by_id["southNode"]["longitude"] - by_id["northNode"]["longitude"]) % 360
    assert abs(d - 180) < 1e-6


def test_house_rulers_follow_cusp_sign_and_planet_positions():
    from astra_engine.western.dignities import rulers_of
    out = natal.calculate(BIRTHS["baku-1990"])
    points = {p["id"]: p for p in out["points"]}
    for h in out["houses"]:
        assert [r["id"] for r in h["rulers"]] == rulers_of(h["sign"])
        assert h["rulers"][0]["kind"] == "traditional"
        for r in h["rulers"]:
            assert r["sign"] == points[r["id"]]["sign"] and r["house"] == points[r["id"]]["house"]
    assert rulers_of("scorpio") == ["mars", "pluto"] and rulers_of("leo") == ["sun"]
