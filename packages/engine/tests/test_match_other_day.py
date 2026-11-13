from datetime import date

import pytest

from astra_engine import SKY
from astra_engine.other import systems
from astra_engine.sky import day
from astra_engine.vedic import match

from conftest import BIRTHS


# --- Guna Milan --------------------------------------------------------------------------------------------------
def test_tables_match_pyjhora_index_lists():
    # PyJHora _find_gana / naadi lists (0-based nakshatras)
    deva, manushya = [0, 4, 6, 7, 12, 14, 16, 21, 26], [1, 3, 5, 10, 11, 19, 20, 24, 25]
    assert [0 if n in deva else 1 if n in manushya else 2 for n in range(27)] == match.NAKSHATRA_GANA
    assert match.NAKSHATRA_NADI == [0, 1, 2, 2, 1, 0, 0, 1, 2, 2, 1, 0, 0, 1, 2, 2, 1, 0, 0, 1, 2, 2, 1, 0, 0, 1, 2]
    assert all(match.YONI_TABLE[i][i] == 4 for i in range(14))
    assert all(match.YONI_TABLE[i][j] == match.YONI_TABLE[j][i] for i in range(14) for j in range(14))
    # classic enemy pairs score 0: horse-buffalo, elephant-lion, sheep-monkey, serpent-mongoose, dog-deer, cat-rat, cow-tiger
    for a, b in [("horse", "buffalo"), ("elephant", "lion"), ("sheep", "monkey"), ("serpent", "mongoose"),
                 ("dog", "deer"), ("cat", "rat"), ("cow", "tiger")]:
        assert match.YONI_TABLE[match.YONI.index(a)][match.YONI.index(b)] == 0


def test_koota_totals_and_ranges():
    out = match.calculate(BIRTHS["baku-1990"], BIRTHS["london-2000"])
    assert [k["id"] for k in out["kootas"]] == ["varna", "vashya", "tara", "yoni", "maitri", "gana", "bhakoot", "nadi"]
    assert sum(k["max"] for k in out["kootas"]) == 36
    assert all(0 <= k["score"] <= k["max"] for k in out["kootas"])
    assert out["total"] == sum(k["score"] for k in out["kootas"])


def test_same_person_rules():
    # Same Moon nakshatra: same nadi -> 0, same rashi -> bhakoot 7, same yoni -> 4, tara both counts 1 -> 3
    out = match.calculate(BIRTHS["baku-1990"], BIRTHS["baku-1990"])
    k = {x["id"]: x["score"] for x in out["kootas"]}
    assert (k["nadi"], k["bhakoot"], k["yoni"], k["tara"], k["varna"]) == (0, 7, 4, 3.0, 1)


def test_bhakoot_rule():
    for g in range(12):
        for b in range(12):
            gi = {"rashi": g, "nak": 0, "moonDeg": 1}
            bi = {"rashi": b, "nak": 0, "moonDeg": 1}
            score = next(x["score"] for x in match.koota({"_idx": gi}, {"_idx": bi}) if x["id"] == "bhakoot")
            d1, d2 = (g - b) % 12 + 1, (b - g) % 12 + 1
            bad = {d1, d2} in ({2, 12}, {5, 9}, {6, 8})
            assert score == (0 if bad else 7)


def test_manglik_houses():
    p = match.person(BIRTHS["baku-1990"])
    for ref, house in p["manglik"]["marsHouse"].items():
        expected = house in (1, 2, 4, 7, 8, 12)
        assert p["manglik"]["fromLagna" if ref == "lagna" else "fromMoon"] == expected


# --- Tarot, Tzolkin, Kua -----------------------------------------------------------------------------------------
def test_tarot_cards():
    assert systems.tarot_cards(date(1990, 6, 15)) == [4]        # 6 + 15 + 1990 = 2011 -> 4 (The Emperor)
    assert systems.tarot_cards(date(1999, 1, 19)) == [12, 3]    # 1 + 19 + 1999 = 2019 -> 12 -> 3
    assert systems.tarot_cards(date(1985, 9, 28)) == [6]        # 9 + 28 + 1985 = 2022 -> 6
    assert all(1 <= c <= 22 for y in range(1900, 2030) for c in systems.tarot_cards(date(y, 12, 31)))


def test_tzolkin_anchor_dates():
    # 21 Dec 2012 (13.0.0.0.0) is 4 Ajaw, kin 160; the next day is 5 Imix
    assert systems.tzolkin(date(2012, 12, 21)) == {"tone": 4, "sign": "ahau", "signNumber": 20, "kin": 160}
    nxt = systems.tzolkin(date(2012, 12, 22))
    assert (nxt["tone"], nxt["sign"], nxt["kin"]) == (5, "imix", 161)


@pytest.mark.parametrize("year,male,female", [
    (1990, 1, 8),   # 9 + 0 = 9: men 10 - 9 = 1; women 9 + 5 = 14 -> 5 -> 8
    (1986, 2, 1),   # 8 + 6 = 14 -> 5: men 10 - 5 = 5 -> 2; women 5 + 5 = 10 -> 1
    (2000, 9, 6),   # 0: men 9 - 0 = 9; women 0 + 6 = 6
    (2005, 4, 2),   # 5: men 9 - 5 = 4; women 5 + 6 = 11 -> 2
])
def test_kua_numbers(year, male, female):
    assert systems.kua(date(year, 6, 1), "male")["number"] == male
    assert systems.kua(date(year, 6, 1), "female")["number"] == female


def test_kua_rules():
    assert systems.kua(date(1991, 2, 1), "male")["chineseYear"] == 1990   # before Lichun 1991
    for y in range(1930, 2030):
        for g in ("male", "female"):
            k = systems.kua(date(y, 7, 1), g)
            assert k["number"] != 5 and k["group"] == ("east" if k["number"] in (1, 3, 4, 9) else "west")


# --- The day: planetary hours and Panchang ------------------------------------------------------------------------
def test_day_planetary_hours_and_panchang():
    out = day.calculate(date(2026, 11, 13), 40.4093, 49.8671, "Asia/Baku")
    assert SKY["sky.day"] is day
    assert out["dayRuler"] == "venus"                       # Friday
    assert len(out["hours"]) == 24 and out["hours"][0]["ruler"] == "venus"
    chaldean = ["saturn", "jupiter", "mars", "sun", "venus", "mercury", "moon"]
    rulers = [h["ruler"] for h in out["hours"]]
    for a, b in zip(rulers, rulers[1:]):
        assert chaldean[(chaldean.index(a) + 1) % 7] == b
    p = out["panchang"]
    assert p["vara"] == "Shukravara"
    assert 1 <= p["tithi"]["number"] <= 30 and 1 <= p["yoga"]["number"] <= 27
    assert p["karana"]["name"]
