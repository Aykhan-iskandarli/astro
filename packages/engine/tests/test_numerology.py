from datetime import date

import pytest

from astra_engine import MODULES, BirthData
from astra_engine.numerology import core as num


def birth(d, name=None):
    return BirthData(date=d, latitude=0, longitude=0, timezone="UTC", name=name)


@pytest.mark.parametrize("n,expected,debt", [(7, 7, None), (19, 1, 19), (29, 11, None), (38, 11, None),
                                             (44, 8, None), (13, 4, 13), (14, 5, 14), (16, 7, 16),
                                             (22, 22, None), (33, 33, None), (49, 4, 13), (99, 9, None)])
def test_reduce(n, expected, debt):
    assert num.reduce_number(n) == (expected, debt)


def test_pythagorean_table():
    assert [num.VALUES[c] for c in "aijsrz"] == [1, 9, 1, 1, 9, 8]


def test_life_path_reduces_parts_first():
    # 15.06.1990: day 15 -> 6, month 6, year 1990 -> 19 -> 1; 6 + 6 + 1 = 13 -> 4 (karmic debt 13)
    lp = num.life_path(date(1990, 6, 15))
    assert lp["parts"] == {"day": 6, "month": 6, "year": 1}
    assert (lp["value"], lp["karmicDebt"]) == (4, 13)


def test_life_path_keeps_master_numbers():
    # 29.11.1980: day 29 -> 11, month 11, year 1980 -> 18 -> 9; 11 + 11 + 9 = 31 -> 4
    assert num.life_path(date(1980, 11, 29))["value"] == 4
    # 11.02.1999: 2 + 2 + (28 -> 10 -> 1)... day 11 kept, month 2, year 28 -> 10 -> 1; 11+2+1 = 14 -> 5 (debt 14)
    lp = num.life_path(date(1999, 2, 11))
    assert lp["parts"]["day"] == 11 and (lp["value"], lp["karmicDebt"]) == (5, 14)


def test_classic_name_example():
    # "John Smith": J1 O6 H8 N5 = 20, S1 M4 I9 T2 H8 = 24 → 44 → 8; vowels O, I = 15 → 6; consonants 29 → 11
    n = num.name_numbers("John Smith")
    assert n["expression"]["value"] == 8
    assert n["soulUrge"]["value"] == 6
    assert n["personality"]["value"] == 11 and n["personality"]["master"] is True


def test_azerbaijani_letters_map_to_base_letters():
    a = num.name_numbers("Şəhla Çələbi")
    b = num.name_numbers("Sehla Celebi")
    assert a["expression"] == b["expression"] and a["soulUrge"] == b["soulUrge"]
    assert {x["letter"] for x in a["letters"]} >= {"ş", "ə", "ç"}
    assert num.name_numbers("Ağa Iğdır")["ignored"] == []


def test_non_latin_letters_are_reported():
    n = num.name_numbers("Анна Ann")
    assert n["ignored"] == ["а", "н"]
    assert n["expression"]["compound"] == 1 + 5 + 5


def test_personal_year_and_month():
    out = num.calculate(birth(date(1990, 6, 15)), full_name="John Smith", today=date(2026, 11, 10))
    # 6 + 6 + (2026 -> 10 -> 1) = 13 -> 4; personal month = 4 + 11 = 15 -> 6
    assert out["personalYear"]["value"] == 4
    assert out["personalMonth"]["value"] == 6
    assert out["maturity"]["value"] == num.reduce_number(4 + 8)[0]


def test_without_name_only_date_numbers():
    out = num.calculate(birth(date(1990, 6, 15)), today=date(2026, 1, 1))
    assert out["expression"] is None and out["maturity"] is None and out["lifePath"]["value"] == 4


def test_registered():
    assert MODULES["numerology.core"] is num


def test_pinnacles_and_challenges_worked_example():
    # 15.06.1990: month 6, day 15 -> 6, year 1990 -> 19 -> 1; life path 4 (13/4)
    # pinnacles 6+6=12->3, 6+1=7, 3+7=10->1, 6+1=7; challenges |6-6|=0, |6-1|=5, |0-5|=5, |6-1|=5
    # first pinnacle ends at 36 - 4 = 32, then 33-41, 42-50, 51+
    out = num.pinnacles(date(1990, 6, 15), 4, today=date(2026, 11, 13))
    assert [p["value"] for p in out] == [3, 7, 1, 7]
    assert [p["challenge"] for p in out] == [0, 5, 5, 5]
    assert [(p["fromAge"], p["toAge"]) for p in out] == [(0, 32), (33, 41), (42, 50), (51, None)]
    assert [p["current"] for p in out] == [False, True, False, False]  # age 36
    assert (out[1]["fromYear"], out[1]["toYear"]) == (2023, 2031)


def test_pinnacle_keeps_master_numbers():
    # 11.09.1999: month 9, day 11 -> 2; first pinnacle 9 + 2 = 11 is kept as a master number
    out = num.pinnacles(date(1999, 9, 11), 11, today=date(2026, 1, 1))
    assert out[0]["value"] == 11 and out[0]["master"] is True
    assert out[0]["toAge"] == 34  # master life path 11 counts as 2


def test_personal_day():
    # personal year 2026 for 15.06: 6 + 6 + 1 = 13 -> 4; November: 4 + 11 = 15 -> 6; 13th: 6 + 4 = 10 -> 1
    out = num.calculate(birth(date(1990, 6, 15)), today=date(2026, 11, 13))
    assert out["personalYear"]["value"] == 4
    assert out["personalMonth"]["value"] == 6
    assert out["personalDay"] == {"value": 1, "date": "2026-11-13"}
    assert len(out["pinnacles"]) == 4


@pytest.mark.parametrize("a,b,rel", [(1, 5, "harmonious"), (5, 7, "harmonious"), (2, 8, "harmonious"),
                                     (3, 9, "harmonious"), (1, 2, "different"), (4, 9, "different"),
                                     (6, 6, "same"), (11, 2, "same"), (22, 8, "harmonious"), (33, 3, "harmonious")])
def test_relation(a, b, rel):
    assert num.relation(a, b) == rel
    assert num.relation(b, a) == rel


def test_compatibility_with_and_without_names():
    out = num.compatibility((date(1990, 6, 15), "Aysel Məmmədova"), (date(1988, 3, 2), None))
    assert [p["kind"] for p in out["pairs"]] == ["lifePath"]  # second person has no name
    out = num.compatibility((date(1990, 6, 15), "Aysel"), (date(1988, 3, 2), "Orxan"))
    assert [p["kind"] for p in out["pairs"]] == ["lifePath", "expression", "soulUrge"]
    lp = out["pairs"][0]
    assert (lp["first"], lp["second"]) == (4, 4)  # 1988-03-02: 2 + 3 + (26 -> 8) = 13 -> 4
    assert lp["relation"] == "same"


def test_lo_shu_grid():
    # 15.06.1990 -> digits 1 5 0 6 1 9 9 0 -> 1,5,6,1,9,9 (zeros ignored)
    out = num.lo_shu(date(1990, 6, 15))
    assert out["counts"] == {"1": 2, "2": 0, "3": 0, "4": 0, "5": 1, "6": 1, "7": 0, "8": 0, "9": 2}
    assert out["missing"] == [2, 3, 4, 7, 8]
    lines = {line["id"]: line for line in out["lines"]}
    assert lines["will"]["complete"] is True          # 9 5 1
    assert lines["emotional"]["complete"] is False    # 3 5 7: only 5
    assert lines["thought"]["empty"] is True          # 4 3 8: none
    assert sorted(n for row in out["grid"] for n in row) == list(range(1, 10))
    assert all(sum(row) == 15 for row in out["grid"])  # the magic square


def test_lo_shu_in_calculate():
    assert "loShu" in num.calculate(birth(date(1990, 6, 15)), today=date(2026, 11, 13))
