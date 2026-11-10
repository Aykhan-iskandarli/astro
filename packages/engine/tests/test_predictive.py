from datetime import date, datetime, time, timedelta, timezone

import pytest

from astra_engine import MODULES, BirthData, resolve_utc
from astra_engine._backend import swe
from astra_engine.common.zodiac import norm, separation
from astra_engine.western import composite, natal, progressions, returns
from astra_engine.western.aspects import ASPECTS
from conftest import BIRTHS

TOL = 1 / 60


def diff(a, b):
    return abs((a - b + 180) % 360 - 180)


def lon(chart, pid):
    return next(p["longitude"] for p in chart["points"] if p["id"] == pid)


# --- returns ----------------------------------------------------------------------------
@pytest.mark.parametrize("bid", list(BIRTHS))
def test_solar_return_sun_back_at_natal_longitude(bid):
    b = BIRTHS[bid]
    out = returns.calculate(b, kind="solar", year=2026)
    at = datetime.fromisoformat(out["at"].replace("Z", "+00:00"))
    # The return can fall a day before the birthday (even in the previous calendar year for 1 January)
    assert abs((at.date() - b.date.replace(year=2026)).days) <= 2
    natal_sun = lon(natal.calculate(b), "sun")
    jd = swe.julday(at.year, at.month, at.day, at.hour + at.minute / 60 + at.second / 3600)
    assert diff(swe.calc_ut(jd, swe.SUN, swe.FLG_SWIEPH)[0][0], natal_sun) < TOL
    assert diff(lon(out["chart"], "sun"), natal_sun) < TOL


def test_lunar_return_is_next_after_date():
    b = BIRTHS["baku-1990"]
    after = date(2026, 11, 10)
    out = returns.calculate(b, kind="lunar", after=after)
    at = datetime.fromisoformat(out["at"].replace("Z", "+00:00"))
    assert date(2026, 11, 10) <= at.date() <= date(2026, 12, 9)  # within one lunar cycle (~27.3 days)
    assert diff(lon(out["chart"], "moon"), lon(natal.calculate(b), "moon")) < TOL


def test_relocated_return_changes_houses_not_planets():
    b = BIRTHS["baku-1990"]
    home = returns.calculate(b, year=2026)
    away = returns.calculate(b, year=2026, place={"latitude": 51.5074, "longitude": -0.1278,
                                                   "timezone": "Europe/London", "name": "London"})
    assert home["at"] == away["at"]
    assert diff(lon(home["chart"], "venus"), lon(away["chart"], "venus")) < 1e-6
    assert diff(home["chart"]["angles"]["asc"]["longitude"], away["chart"]["angles"]["asc"]["longitude"]) > 10
    assert away["local"].endswith("+00:00") or away["local"].endswith("+01:00")


def test_solar_return_for_29_february_birth():
    b = BirthData(date=date(1996, 2, 29), time=time(10, 0), latitude=40.4, longitude=49.9, timezone="Asia/Baku")
    out = returns.calculate(b, year=2027)
    assert out["at"].startswith("2027-02-2") or out["at"].startswith("2027-03-01")


# --- progressions ----------------------------------------------------------------------
def test_progressed_moment_is_a_day_per_year():
    b = BIRTHS["london-2000"]
    target = datetime(2030, 1, 1, 12, 0, tzinfo=timezone.utc)
    out = progressions.calculate(b, target=target)
    birth_utc = resolve_utc(b.date, b.time, b.timezone).utc
    age = (target - birth_utc).total_seconds() / 86400 / 365.2422
    expected = birth_utc + timedelta(days=age)
    got = datetime.fromisoformat(out["progressedMoment"].replace("Z", "+00:00"))
    assert abs((got - expected).total_seconds()) <= 1
    assert abs(out["ageYears"] - age) < 1e-3


def test_progressed_planets_match_ephemeris_and_solar_arc_mc():
    b = BIRTHS["baku-1990"]
    out = progressions.calculate(b, target=datetime(2026, 11, 10, tzinfo=timezone.utc))
    pm = datetime.fromisoformat(out["progressedMoment"].replace("Z", "+00:00"))
    jd = swe.julday(pm.year, pm.month, pm.day, pm.hour + pm.minute / 60 + pm.second / 3600)
    for pid, sid in [("sun", swe.SUN), ("moon", swe.MOON), ("venus", swe.VENUS)]:
        assert diff(lon(out["chart"], pid), swe.calc_ut(jd, sid, swe.FLG_SWIEPH)[0][0]) < TOL, pid
    base = natal.calculate(b)
    arc = norm(lon(out["chart"], "sun") - lon(base, "sun"))
    assert diff(out["solarArc"], arc) < 1e-6
    # Solar arc ≈ 1°/year: 36.4 years → roughly 35°
    assert 30 < out["solarArc"] < 40
    assert diff(out["chart"]["angles"]["mc"]["longitude"], base["angles"]["mc"]["longitude"] + arc) < TOL
    # Ascendant/cusps are derived from that MC: the first cusp equals the ASC
    assert diff(out["chart"]["houses"][0]["longitude"], out["chart"]["angles"]["asc"]["longitude"]) < TOL


def test_progressed_aspects_to_natal_are_tight():
    out = progressions.calculate(BIRTHS["sydney-1985"], target=datetime(2026, 1, 1, tzinfo=timezone.utc))
    base = natal.calculate(BIRTHS["sydney-1985"])
    prog = {p["id"]: p["longitude"] for p in out["chart"]["points"]}
    prog.update({k: v["longitude"] for k, v in out["chart"]["angles"].items()})
    nat = {p["id"]: p["longitude"] for p in base["points"]}
    nat.update({k: v["longitude"] for k, v in base["angles"].items()})
    for a in out["aspectsToNatal"]:
        assert a["orb"] <= 1.0
        assert abs(abs(separation(prog[a["p1"]], nat[a["p2"]]) - ASPECTS[a["type"]][0]) - a["orb"]) < 1e-3


def test_progressions_time_unknown_has_no_angles():
    b = BirthData(date=date(1990, 6, 15), latitude=40.4, longitude=49.9, timezone="Asia/Baku")
    out = progressions.calculate(b, target=datetime(2026, 1, 1, tzinfo=timezone.utc))
    assert out["chart"]["angles"] is None and out["chart"]["houses"] is None


# --- composite --------------------------------------------------------------------------
def shorter_midpoint(a, b):
    d = norm(b - a)
    return norm(a + d / 2) if d <= 180 else norm(b + (360 - d) / 2)


def test_composite_points_are_shorter_arc_midpoints():
    a, b = BIRTHS["baku-1990"], BIRTHS["london-2000"]
    out = composite.calculate(a, b)
    na, nb = natal.calculate(a), natal.calculate(b)
    for pid in ["sun", "moon", "mercury", "venus", "mars", "saturn", "pluto"]:
        assert diff(lon(out, pid), shorter_midpoint(lon(na, pid), lon(nb, pid))) < TOL, pid
    assert len(out["houses"]) == 12 and out["angles"] is not None
    assert out["meta"]["method"] == "midpoint"


def test_composite_without_birth_time_has_no_houses():
    a = BirthData(date=date(1990, 6, 15), latitude=40.4, longitude=49.9, timezone="Asia/Baku")
    out = composite.calculate(a, BIRTHS["london-2000"])
    assert out["houses"] is None and out["angles"] is None


def test_registered():
    for mid, mod in [("western.returns", returns), ("western.progressions", progressions),
                     ("western.composite", composite)]:
        assert MODULES[mid] is mod
