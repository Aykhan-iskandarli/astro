from datetime import date, time

import pytest
from lunar_python import Solar

from astra_engine import MODULES, BirthData
from astra_engine.chinese import bazi
from conftest import BIRTHS

CN_TEN_GODS = {"比肩": "friend", "劫财": "robWealth", "食神": "eatingGod", "伤官": "hurtingOfficer",
               "偏财": "indirectWealth", "正财": "directWealth", "七杀": "sevenKillings", "正官": "directOfficer",
               "偏印": "indirectResource", "正印": "directResource"}


def gz(p):
    return p["stem"]["char"] + p["branch"]["char"]


def test_known_chart_beijing_birth():
    # A birth in Beijing: local time == UTC+8, so every pillar equals lunar_python's own result
    b = BirthData(date=date(1990, 6, 15), time=time(14, 30), latitude=39.9, longitude=116.4, timezone="Asia/Shanghai")
    out = bazi.calculate(b)
    assert [gz(out["pillars"][k]) for k in ("year", "month", "day", "hour")] == ["庚午", "壬午", "辛亥", "乙未"]
    assert out["dayMaster"]["id"] == "xin" and out["dayMaster"]["element"] == "metal"
    assert out["animal"] == "horse"


def test_day_pillar_matches_independent_formula():
    # Sexagenary day index = (JDN + 49) mod 60 (0 = 甲子), independent of lunar_python
    for d in [date(1990, 6, 15), date(2000, 1, 1), date(1985, 11, 3), date(2024, 2, 29)]:
        jdn = d.toordinal() + 1721425
        idx = (jdn + 49) % 60
        expected = bazi.STEM_CN[idx % 10] + bazi.BRANCH_CN[idx % 12]
        b = BirthData(date=d, time=time(12, 0), latitude=0, longitude=0, timezone="UTC")
        assert gz(bazi.calculate(b)["pillars"]["day"]) == expected, d


def test_ten_gods_match_lunar_python():
    ec = Solar.fromYmdHms(1990, 6, 15, 14, 30, 0).getLunar().getEightChar()
    b = BirthData(date=date(1990, 6, 15), time=time(14, 30), latitude=39.9, longitude=116.4, timezone="Asia/Shanghai")
    out = bazi.calculate(b)
    assert out["pillars"]["year"]["tenGod"] == CN_TEN_GODS[ec.getYearShiShenGan()]
    assert out["pillars"]["month"]["tenGod"] == CN_TEN_GODS[ec.getMonthShiShenGan()]
    assert out["pillars"]["hour"]["tenGod"] == CN_TEN_GODS[ec.getTimeShiShenGan()]
    assert [h["tenGod"] for h in out["pillars"]["year"]["hidden"]] == [CN_TEN_GODS[x] for x in ec.getYearShiShenZhi()]


@pytest.mark.parametrize("dm,other,expected", [
    ("甲", "甲", "friend"), ("甲", "乙", "robWealth"), ("甲", "丙", "eatingGod"), ("甲", "丁", "hurtingOfficer"),
    ("甲", "戊", "indirectWealth"), ("甲", "己", "directWealth"), ("甲", "庚", "sevenKillings"),
    ("甲", "辛", "directOfficer"), ("甲", "壬", "indirectResource"), ("甲", "癸", "directResource"),
])
def test_ten_god_rules(dm, other, expected):
    assert bazi.ten_god(bazi.stem_info(dm), bazi.stem_info(other)) == expected


def test_month_pillar_uses_the_solar_term_instant():
    # Lichun 2024 = 2024-02-04 16:27 CST (08:27 UTC). In London (UTC+0) 2024-02-04 10:00 local is 18:00 CST,
    # i.e. after Lichun: year pillar must already be 甲辰 and month 丙寅.
    b = BirthData(date=date(2024, 2, 4), time=time(10, 0), latitude=51.5, longitude=-0.1, timezone="Europe/London")
    out = bazi.calculate(b)
    assert gz(out["pillars"]["year"]) == "甲辰" and gz(out["pillars"]["month"]) == "丙寅"
    # 07:00 London = 15:00 CST, before Lichun: still the previous (癸卯) year and 乙丑 month
    b2 = BirthData(date=date(2024, 2, 4), time=time(7, 0), latitude=51.5, longitude=-0.1, timezone="Europe/London")
    out2 = bazi.calculate(b2)
    assert gz(out2["pillars"]["year"]) == "癸卯" and gz(out2["pillars"]["month"]) == "乙丑"


def test_luck_pillars_direction_depends_on_gender():
    b = BIRTHS["baku-1990"]  # Yang year (庚): male forward, female backward
    male, female = bazi.calculate(b, gender="male"), bazi.calculate(b, gender="female")
    assert male["luck"]["forward"] is True and female["luck"]["forward"] is False
    assert len(male["luck"]["pillars"]) >= 8
    ages = [p["startAge"] for p in male["luck"]["pillars"]]
    assert all(b - a == 10 for a, b in zip(ages, ages[1:]))


def test_elements_count_eight_characters():
    out = bazi.calculate(BIRTHS["london-2000"])
    assert sum(out["elements"].values()) == 8


def test_time_unknown_has_three_pillars():
    b = BirthData(date=date(1990, 6, 15), latitude=40.4, longitude=49.9, timezone="Asia/Baku")
    out = bazi.calculate(b)
    assert out["pillars"]["hour"] is None and sum(out["elements"].values()) == 6


def test_registered():
    assert MODULES["chinese.bazi"] is bazi


from datetime import date as _date  # noqa: E402

from astra_engine.chinese import bazi as _bazi  # noqa: E402


@pytest.mark.parametrize("a,b,rel", [
    ("rat", "ox", "sixHarmony"), ("tiger", "pig", "sixHarmony"), ("horse", "goat", "sixHarmony"),
    ("monkey", "rat", "threeHarmony"), ("rat", "dragon", "threeHarmony"), ("tiger", "dog", "threeHarmony"),
    ("rat", "horse", "clash"), ("tiger", "monkey", "clash"), ("snake", "pig", "clash"),
    ("rat", "goat", "harm"), ("rabbit", "dragon", "harm"), ("rooster", "dog", "harm"),
    ("dog", "dog", "same"), ("rat", "tiger", "neutral"),
])
def test_branch_relations(a, b, rel):
    i, j = _bazi.ANIMALS.index(a), _bazi.ANIMALS.index(b)
    assert _bazi.branch_relation(i, j) == rel
    assert _bazi.branch_relation(j, i) == rel


def test_relation_table_is_complete():
    # every animal: 1 six-harmony partner, 2 three-harmony partners, 1 clash, 1 harm, 1 same, 6 neutral
    for i in range(12):
        rels = [_bazi.branch_relation(i, j) for j in range(12)]
        assert [rels.count(r) for r in ("same", "sixHarmony", "threeHarmony", "clash", "harm", "neutral")] == [1, 1, 2, 1, 1, 6]


def test_year_branch_changes_at_lichun():
    assert _bazi.year_branch(_date(1990, 2, 3))["animal"] == "snake"   # before Lichun 1990 (4 Feb)
    assert _bazi.year_branch(_date(1990, 2, 5))["animal"] == "horse"
    out = _bazi.compatibility(_date(1990, 6, 15), _date(1988, 3, 2))
    assert (out["first"]["animal"], out["second"]["animal"], out["relation"]) == ("horse", "dragon", "neutral")
