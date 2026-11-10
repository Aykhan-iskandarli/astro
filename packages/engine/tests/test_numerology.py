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
