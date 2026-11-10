"""Unit tests for our own pure functions (no ephemeris involved)."""
import pytest

from astra_engine.common.zodiac import house_of, separation, sign_of, split_degree
from astra_engine.western.aspects import AspectPoint, find_aspects
from astra_engine.western.balance import balance
from astra_engine.western.dignities import dignity_of
from astra_engine.western.lunar import lunar_phase
from astra_engine.western.patterns import find_patterns

PLANETS = ["sun", "moon", "mercury", "venus", "mars", "jupiter", "saturn", "uranus", "neptune", "pluto"]


# --- zodiac ---------------------------------------------------------------
@pytest.mark.parametrize("lon,sign", [(0, "aries"), (29.9999, "aries"), (30, "taurus"), (359.9, "pisces"),
                                      (360, "aries"), (-1, "pisces")])
def test_sign_of(lon, sign):
    assert sign_of(lon) == sign


def test_split_degree_never_rounds_into_next_sign():
    assert split_degree(29.99999999) == (29, 59, 59)
    assert split_degree(84.0300650911) == (24, 1, 48)  # Sun, Baku 1990 (astro-seek: 24°01'48")


def test_separation_wraps():
    assert separation(350, 10) == 20
    assert separation(10, 190) == 180


def test_house_of_handles_wrap_around_aries():
    cusps = [184.6, 211.1, 241.7, 275.3, 308.7, 338.9, 4.6, 31.1, 61.7, 95.3, 128.7, 158.9]
    assert house_of(184.6, cusps) == 1
    assert house_of(0.0, cusps) == 6
    assert house_of(5.0, cusps) == 7
    assert house_of(84.03, cusps) == 9
    assert house_of(184.5, cusps) == 12


# --- aspects ----------------------------------------------------------------
def pts(**lons):
    return [AspectPoint(k, v, 1.0) for k, v in lons.items()]


def test_aspect_orbs_and_luminary_bonus():
    found = find_aspects(pts(sun=0, mars=129.5, venus=200))
    # sun-mars: 129.5 vs trine 120 = 9.5 > 7+2 -> none; sun-venus 160 -> none within 8+2 of 180 is 20 -> none
    assert found == [] or all(a["type"] != "trine" for a in found)
    found = find_aspects(pts(sun=0, mars=128.5))
    assert found[0]["type"] == "trine" and found[0]["orb"] == 8.5
    assert find_aspects(pts(venus=0, mars=128.5)) == []  # no luminary -> orb 7


def test_skip_node_axis():
    found = find_aspects([AspectPoint("northNode", 10, -0.05), AspectPoint("southNode", 190, -0.05)])
    assert found == []


def test_applying_vs_separating():
    fast = AspectPoint("moon", 115, 13.0)
    slow = AspectPoint("saturn", 0, 0.03)
    assert find_aspects([fast, slow])[0]["applying"] is True   # moving toward 120
    fast = AspectPoint("moon", 125, 13.0)
    assert find_aspects([fast, slow])[0]["applying"] is False


def test_angles_only_major_with_tight_orb():
    asc = AspectPoint("asc", 0, None, is_angle=True)
    assert find_aspects([asc, AspectPoint("venus", 150, 1)]) == []  # quincunx not used for angles
    assert find_aspects([asc, AspectPoint("venus", 96, 1)]) == []   # square orb 6 > 5
    assert find_aspects([asc, AspectPoint("venus", 94, 1)])[0]["applying"] is None


# --- patterns ---------------------------------------------------------------
def signs_for(lons):
    return {k: sign_of(v) for k, v in lons.items()}


def detect(**lons):
    full = {p: 15 + i * 7.3 for i, p in enumerate(PLANETS)}  # filler spread
    full.update(lons)
    aspects = find_aspects([AspectPoint(k, v, 1.0) for k, v in full.items()])
    return {p["type"] for p in find_patterns(aspects, signs_for(full), {k: None for k in full})}, full


def test_grand_trine_and_kite():
    types, _ = detect(sun=1, moon=121, mars=241, venus=301, mercury=200, jupiter=170, saturn=330, uranus=280,
                      neptune=95, pluto=50)
    assert "grandTrine" in types and "kite" in types


def test_t_square_and_grand_cross():
    types, _ = detect(sun=10, moon=190, mars=100, mercury=40, venus=60, jupiter=150, saturn=230, uranus=320,
                      neptune=345, pluto=170)
    assert "tSquare" in types and "grandCross" not in types
    types, _ = detect(sun=10, moon=190, mars=100, saturn=280, mercury=40, venus=60, jupiter=150, uranus=320,
                      neptune=345, pluto=170)
    assert "grandCross" in types


def test_yod():
    types, _ = detect(sun=0, moon=60, pluto=210, mercury=100, venus=130, mars=170, jupiter=260, saturn=280,
                      uranus=320, neptune=345)
    assert "yod" in types


def test_mystic_rectangle():
    types, _ = detect(sun=0, moon=60, mars=180, venus=240, mercury=100, jupiter=140, saturn=290, uranus=320,
                      neptune=345, pluto=200)
    assert "mysticRectangle" in types


def test_stellium_by_sign():
    full = {p: 15 + i * 33 for i, p in enumerate(PLANETS)}
    full.update(sun=91, mercury=95, venus=100)  # three in cancer
    pats = find_patterns([], signs_for(full), {k: None for k in full})
    assert {"type": "stellium", "points": ["mercury", "sun", "venus"], "sign": "cancer"} in pats


# --- dignities, balance, lunar ---------------------------------------------
@pytest.mark.parametrize("planet,sign,expected", [
    ("sun", "leo", "domicile"), ("sun", "aries", "exaltation"), ("sun", "aquarius", "detriment"),
    ("sun", "libra", "fall"), ("mercury", "virgo", "domicile"), ("mars", "cancer", "fall"),
    ("pluto", "scorpio", "domicile"), ("pluto", "taurus", "detriment"), ("venus", "gemini", None),
    ("chiron", "aries", None),
])
def test_dignities(planet, sign, expected):
    assert dignity_of(planet, sign) == expected


def test_balance_counts_ten_planets():
    signs = {p: "aries" for p in PLANETS}
    signs.update(moon="taurus", venus="gemini")
    b = balance(signs)
    assert sum(b["elements"].values()) == 10
    assert b["elements"] == {"fire": 8, "earth": 1, "air": 1, "water": 0}
    assert b["polarity"] == {"positive": 9, "negative": 1}
    assert b["dominant"]["element"] == ["fire"]
    assert b["missing"]["element"] == ["water"]


@pytest.mark.parametrize("sun,moon,phase", [(0, 1, "newMoon"), (0, 90, "firstQuarter"), (0, 181, "fullMoon"),
                                            (84.03, 343.97, "disseminating"), (10, 5, "balsamic")])
def test_lunar_phase(sun, moon, phase):
    assert lunar_phase(sun, moon)["phase"] == phase
