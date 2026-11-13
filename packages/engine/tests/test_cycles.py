from datetime import date, datetime

import pytest

from astra_engine import MODULES, BirthData
from astra_engine._backend import swe
from astra_engine.common.zodiac import SIGNS, sign_index
from astra_engine.western import cycles, natal

from conftest import BIRTHS

ONE_ARCSEC = 1 / 3600
IDS = {"jupiter": swe.JUPITER, "saturn": swe.SATURN, "chiron": swe.CHIRON}


def _jd(iso: str) -> float:
    dt = datetime.fromisoformat(iso.replace("Z", "+00:00"))
    return swe.julday(dt.year, dt.month, dt.day, dt.hour + dt.minute / 60 + dt.second / 3600)


def test_registered():
    assert MODULES["western.cycles"] is cycles


def test_every_pass_is_exactly_on_the_natal_degree(birth):
    _, b = birth
    out = cycles.calculate(b, on=date(2026, 11, 13))
    lons = {p["id"]: p["longitude"] for p in natal.calculate(b)["points"]}
    for pid, returns in out["returns"].items():
        assert returns, pid
        for r in returns:
            # Odd number of passes, alternating direct/retrograde, starting and ending direct (1, 3, or 5 when a
            # slow body stations near its natal degree in two consecutive loops)
            assert len(r["passes"]) % 2 == 1, (pid, r)
            for p in r["passes"]:
                lon = swe.calc_ut(_jd(p["at"]), IDS[pid], swe.FLG_SWIEPH)[0][0]
                # Pass times are rounded to the second; slow planets move far less than 1" per second
                assert abs((lon - lons[pid] + 180) % 360 - 180) < ONE_ARCSEC, (pid, p)
            assert [p["retrograde"] for p in r["passes"]] == [i % 2 == 1 for i in range(len(r["passes"]))], (pid, r)


def test_return_ages_follow_the_periods():
    out = cycles.calculate(BIRTHS["baku-1990"], on=date(2026, 11, 13))
    saturn = out["returns"]["saturn"]
    assert 28.5 < saturn[0]["ageYears"] < 30.5
    assert 57.5 < saturn[1]["ageYears"] < 60.5
    jupiter = [r["ageYears"] for r in out["returns"]["jupiter"]]
    assert all(abs(age - 11.86 * (i + 1)) < 1.2 for i, age in enumerate(jupiter))
    assert 48 < out["returns"]["chiron"][0]["ageYears"] < 53


def test_status_relative_to_date():
    out = cycles.calculate(BIRTHS["baku-1990"], on=date(2026, 11, 13))
    first_saturn = out["returns"]["saturn"][0]  # around 2019-2020
    assert first_saturn["status"] == "past"
    assert out["returns"]["chiron"][0]["status"] == "future"


@pytest.mark.parametrize("on,age,house", [(date(1990, 6, 15), 0, 1), (date(1991, 6, 14), 0, 1),
                                          (date(1991, 6, 15), 1, 2), (date(2002, 6, 15), 12, 1),
                                          (date(2026, 11, 13), 36, 1), (date(2027, 6, 15), 37, 2)])
def test_profection_age_house_sign_and_lord(on, age, house):
    b = BIRTHS["baku-1990"]
    chart = natal.calculate(b)
    asc_sign = sign_index(chart["angles"]["asc"]["longitude"])
    cur = cycles.calculate(b, on=on)["profections"]["current"]
    assert (cur["age"], cur["house"]) == (age, house)
    assert cur["sign"] == SIGNS[(asc_sign + age) % 12]
    rulers = {"aries": "mars", "taurus": "venus", "gemini": "mercury", "cancer": "moon", "leo": "sun",
              "virgo": "mercury", "libra": "venus", "scorpio": "mars", "sagittarius": "jupiter",
              "capricorn": "saturn", "aquarius": "saturn", "pisces": "jupiter"}
    assert cur["lord"] == rulers[cur["sign"]]
    lord = next(p for p in chart["points"] if p["id"] == cur["lord"])
    assert cur["lordNatal"] == {"sign": lord["sign"], "house": lord["house"]}


def test_profection_years_are_contiguous():
    years = cycles.calculate(BIRTHS["baku-1990"], on=date(2026, 11, 13))["profections"]["years"]
    assert len(years) == 12
    for a, b in zip(years, years[1:]):
        assert date.fromisoformat(a["end"]).toordinal() + 1 == date.fromisoformat(b["start"]).toordinal()


def test_leap_day_birthday():
    b = BirthData(date=date(1996, 2, 29), time=time_(10, 0), latitude=40.4, longitude=49.9, timezone="Asia/Baku")
    cur = cycles.calculate(b, on=date(2027, 2, 28))["profections"]["current"]
    assert cur["age"] == 30  # 1 March is the birthday in a common year
    assert cycles.calculate(b, on=date(2027, 3, 1))["profections"]["current"]["age"] == 31


def test_time_unknown_has_returns_but_no_profections():
    b = BIRTHS["london-2000"].model_copy(update={"time": None})
    out = cycles.calculate(b, on=date(2026, 11, 13))
    assert out["profections"] is None
    assert out["returns"]["saturn"]


def time_(h, m):
    from datetime import time
    return time(h, m)


@pytest.mark.parametrize("pid", list(cycles.BODIES))
def test_speed_bound_holds(pid):
    """The adaptive scan relies on BODIES' speed bound: check it over 1801-2398 (inside the bundled ephemeris)."""
    body, _, _, bound = cycles.BODIES[pid]
    start = swe.julday(1801, 1, 1, 0)
    fastest = max(abs(swe.calc_ut(start + d, body, swe.FLG_SWIEPH | swe.FLG_SPEED)[0][3])
                  for d in range(0, 598 * 365, 3))
    assert fastest < bound * 0.95, (pid, fastest)
