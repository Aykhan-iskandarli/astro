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


def test_name_analysis_worked_example():
    # AYSEL MƏMMƏDOVA: A1 Y7 S1 E5 L3 | M4 Ə5 M4 M4 Ə5 D4 O6 V4 A1
    out = num.name_analysis("Aysel Məmmədova")
    assert out["expression"]["value"] == 9                      # 17 + 37 = 54 -> 9
    assert out["cornerstone"]["letter"] == "a" and out["capstone"]["letter"] == "l"
    assert out["firstVowel"]["letter"] == "a"
    assert out["inclusion"] == {"1": 3, "2": 0, "3": 1, "4": 5, "5": 3, "6": 1, "7": 1, "8": 0, "9": 0}
    assert out["karmicLessons"] == [2, 8, 9]
    assert out["hiddenPassion"] == [4]
    assert out["subconsciousSelf"] == 6
    assert out["balance"]["value"] == 5                           # initials A(1) + M(4)
    assert sum(out["planes"].values()) == 14
    assert out["planes"]["physical"] == 7                         # E, M, M, M, D + Ə Ə (-> e)
    assert out["dominantPlane"] == "physical"
    # Chaldean: A1 Y1 S3 E5 L3 = 13; M4 Ə5 M4 M4 Ə5 D4 O7 V6 A1 = 40 -> 53 -> 8
    assert out["chaldean"] == {"compound": 53, "value": 8}
    assert out["lifePath"] is None


def test_name_analysis_with_date_and_edge_cases():
    out = num.name_analysis("Aysel", date(1990, 6, 15))
    assert out["lifePath"]["value"] == 4 and out["maturity"] is not None
    empty = num.name_analysis("Айсель")                            # Cyrillic only: nothing to count
    assert empty["expression"] is None and empty["cornerstone"] is None and empty["ignored"]
    assert empty["subconsciousSelf"] is None


def test_planes_cover_the_alphabet():
    letters = set().union(*num.PLANES.values())
    assert letters == set("abcdefghijklmnopqrstuvwxyz") and sum(len(v) for v in num.PLANES.values()) == 26
    assert set(num.CHALDEAN) == set("abcdefghijklmnopqrstuvwxyz") and 9 not in num.CHALDEAN.values()


def test_psychomatrix_classic():
    # 15.06.1990: digits 1 5 0 6 1 9 9 0 -> 1st 31, 2nd 4, 3rd 31 - 2*1 = 29, 4th 11
    out = num.psychomatrix(date(1990, 6, 15))
    assert out["workNumbers"] == [31, 4, 29, 11] and out["variant"] == "classic"
    # digits: 15061990 + 31 + 4 + 29 + 11
    assert out["counts"] == {"1": 5, "2": 1, "3": 1, "4": 1, "5": 1, "6": 1, "7": 0, "8": 0, "9": 3}
    assert out["lines"]["selfEsteem"] == 7 and out["lines"]["talent"] == 3 and out["lines"]["spirit"] == 9


def test_psychomatrix_day_with_leading_zero_and_2000s():
    # 05.03.1985: 1st = 0+5+0+3+1+9+8+5 = 31; first non-zero day digit is 5 -> 3rd = 31 - 10 = 21; 4th = 3
    out = num.psychomatrix(date(1985, 3, 5))
    assert out["workNumbers"] == [31, 4, 21, 3]
    # 12.04.2003: 1st = 1+2+0+4+2+0+0+3 = 12; 2nd 3; 3rd = 12 + 19 = 31; 4th 4
    out = num.psychomatrix(date(2003, 4, 12))
    assert out["workNumbers"] == [12, 3, 31, 4] and out["variant"] == "2000+"


def test_psychomatrix_in_outputs():
    assert num.calculate(birth(date(1990, 6, 15)), today=date(2026, 11, 13))["psychomatrix"]["workNumbers"][0] == 31
    assert num.name_analysis("Aysel")["psychomatrix"] is None
    assert num.name_analysis("Aysel", date(1990, 6, 15))["psychomatrix"]["workNumbers"][0] == 31
