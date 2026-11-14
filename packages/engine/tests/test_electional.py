from datetime import date, datetime, time, timedelta
from zoneinfo import ZoneInfo

import pytest

from astra_engine import MODULES, BirthData
from astra_engine._backend import swe
from astra_engine.common.zodiac import SIGNS, house_of, norm
from astra_engine.sky.common import jd_of
from astra_engine.western import electional, forecast, natal

BAKU = BirthData(date=date(1990, 6, 15), time=time(14, 30), latitude=40.4, longitude=49.9, timezone="Asia/Baku")
TZ = "Asia/Baku"
START = date(2027, 3, 1)


@pytest.fixture(scope="module")
def month():
    return electional.calculate(BAKU, START, 31, TZ)


def parse(s):
    return datetime.fromisoformat(s.replace("Z", "+00:00"))


def moon_lon(jd):
    return swe.calc_ut(jd, swe.MOON, swe.FLG_SWIEPH)[0][0]


def test_registered_and_shape(month):
    assert "western.electional" in MODULES
    assert len(month["days"]) == 31 and month["days"][0]["date"] == "2027-03-01"
    assert month["days"][-1]["date"] == "2027-03-31"


def test_day_bounds_are_local_midnights(month):
    tz = ZoneInfo(TZ)
    for i, d in enumerate(month["days"]):
        want = datetime.combine(START + timedelta(days=i), time(0), tz).astimezone(ZoneInfo("UTC"))
        assert abs((parse(d["start"]) - want).total_seconds()) <= 1


def test_house_windows_tile_each_day_and_match_independent_house(month):
    cusps = [h["longitude"] for h in natal.calculate(BAKU)["houses"]]
    for d in month["days"]:
        windows = d["houses"]
        assert windows[0]["from"] == d["start"] and windows[-1]["to"] == d["end"]
        for w, nxt in zip(windows, windows[1:]):
            assert w["to"] == nxt["from"] and w["house"] != nxt["house"]
        for w in windows:  # the Moon is in that house in the middle of every window
            mid = (parse(w["from"]) + (parse(w["to"]) - parse(w["from"])) / 2).astimezone(ZoneInfo("UTC"))
            assert house_of(moon_lon(jd_of(mid)), cusps) == w["house"]


def test_moon_signs_match_swiss_ephemeris(month):
    for d in month["days"]:
        first = d["signs"][0]
        assert first["from"] is None
        start = moon_lon(jd_of(parse(d["start"])) + 1 / 86400)
        assert first["sign"] == SIGNS[int(norm(start) // 30)]
        for s in d["signs"][1:]:
            at = jd_of(parse(s["from"]))
            assert SIGNS[int(norm(moon_lon(at + 30 / 86400)) // 30)] == s["sign"]
            assert SIGNS[int(norm(moon_lon(at - 30 / 86400)) // 30)] != s["sign"]


def test_void_periods_are_clipped_to_the_day_and_continuous_across_midnight(month):
    for d in month["days"]:
        for v in d["voidOfCourse"]:
            assert d["start"] <= v["start"] < v["end"] <= d["end"]
            if v["continuesBefore"]:
                assert v["start"] == d["start"]
            if v["continuesAfter"]:
                assert v["end"] == d["end"]
    days = month["days"]
    for a, b in zip(days, days[1:]):
        if a["voidOfCourse"] and a["voidOfCourse"][-1]["continuesAfter"]:
            assert b["voidOfCourse"] and b["voidOfCourse"][0]["continuesBefore"]
            assert b["voidOfCourse"][0]["start"] == b["start"]


def test_phase_and_waxing_follow_the_moon(month):
    waxing = [d["waxing"] for d in month["days"]]
    assert waxing.count(True) and waxing.count(False)
    ill = [d["illumination"] for d in month["days"]]
    for d, nxt in zip(month["days"], month["days"][1:]):
        assert (nxt["illumination"] > d["illumination"]) == d["waxing"] or abs(nxt["illumination"] - d["illumination"]) < 0.02
    assert max(ill) > 0.95 and min(ill) < 0.05  # a full and a new Moon fall inside the month


def test_retrograde_flags_agree_with_retrograde_periods(month):
    periods = forecast.retrogrades(BAKU, date(2026, 12, 1), 200)["retrogrades"]
    tz = ZoneInfo(TZ)
    for d in month["days"]:
        noon = datetime.combine(date.fromisoformat(d["date"]), time(12), tz)
        for p in ("mercury", "venus", "mars"):
            inside = any(r["planet"] == p and parse(r["start"]) <= noon <= parse(r["end"]) for r in periods)
            assert (p in d["retrograde"]) == inside, (d["date"], p)


def test_no_houses_without_birth_time():
    b = BirthData(date=date(1990, 6, 15), time=None, latitude=40.4, longitude=49.9, timezone="Asia/Baku")
    out = electional.calculate(b, START, 3, TZ)
    assert out["meta"]["timeUnknown"] and all(d["houses"] is None for d in out["days"])
    assert all(d["voidOfCourse"] is not None for d in out["days"])


def test_validation():
    for bad in (0, 63):
        with pytest.raises(ValueError):
            electional.calculate(BAKU, START, bad, TZ)
