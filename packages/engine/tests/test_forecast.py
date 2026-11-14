"""Life timeline, retrograde calendar and year forecast, checked against raw Swiss Ephemeris and an independent
finer scan."""
from datetime import date, datetime, timezone

import pytest

from astra_engine import MODULES, BirthData
from astra_engine.common.zodiac import SIGNS, house_of, sign_index
from astra_engine.sky.common import jd_of, longitude
from conftest import BIRTHS

BIRTH = BIRTHS["baku-1990"]
F = MODULES["western.forecast"]


def _jd(stamp: str) -> float:
    return jd_of(datetime.fromisoformat(stamp.replace("Z", "+00:00")))


def _cusps():
    return [h["longitude"] for h in MODULES["western.natal"].calculate(BIRTH)["houses"]]


def _d(x: float) -> float:
    return (x + 180) % 360 - 180


def _scan(pid, a, b, step, index_of):
    seq, t = [], a
    while t <= b:
        r = index_of(longitude(pid, t)[0])
        if not seq or seq[-1] != r:
            seq.append(r)
        t += step
    return seq


def test_lifeline_boundaries_are_real_cusp_crossings():
    out = F.calculate(BIRTH, kind="lifeline", start=date(2026, 1, 1), years=12)
    cusps = _cusps()
    for pid, v in out["planets"].items():
        for prev, nxt in zip(v["houses"], v["houses"][1:]):
            lon = longitude(pid, _jd(nxt["start"]))[0]
            assert min(abs(_d(lon - c)) for c in cusps) < 0.002, (pid, nxt)
            assert prev["end"] == nxt["start"] and prev["region"] != nxt["region"]
        assert v["houses"][0]["startClipped"] and v["houses"][-1]["endClipped"]


@pytest.mark.parametrize("pid", ["saturn", "uranus", "neptune", "pluto", "jupiter"])
def test_lifeline_matches_an_independent_scan(pid):
    start = date(2026, 1, 1)
    out = F.calculate(BIRTH, kind="lifeline", start=start, years=10)["planets"][pid]
    cusps = _cusps()
    a, b = _jd(out["houses"][0]["start"]), _jd(out["houses"][-1]["end"])
    assert [s["region"] for s in out["houses"]] == _scan(pid, a, b, 0.1, lambda lon: house_of(lon, cusps))
    assert [s["sign"] for s in out["signs"]] == [SIGNS[i] for i in _scan(pid, a, b, 0.1, lambda lon: sign_index(lon))]


def test_lifeline_without_birth_time_has_only_signs():
    b = BirthData(date=BIRTH.date, latitude=BIRTH.latitude, longitude=BIRTH.longitude, timezone=BIRTH.timezone)
    out = F.calculate(b, kind="lifeline", start=date(2026, 1, 1), years=5)
    assert all(v["houses"] is None and v["signs"] for v in out["planets"].values())


def test_retrograde_stations_have_zero_speed_and_periods_run_backwards():
    out = F.calculate(BIRTH, kind="retrogrades", start=date(2027, 1, 1), days=365)["retrogrades"]
    assert out
    for r in out:
        a, b = _jd(r["start"]), _jd(r["end"])
        if not r["startClipped"]:
            assert abs(longitude(r["planet"], a)[1]) < 0.02, r
        if not r["endClipped"]:
            assert abs(longitude(r["planet"], b)[1]) < 0.02, r
        assert longitude(r["planet"], (a + b) / 2)[1] < 0, r  # retrograde in the middle
        assert r["houses"] and r["houses"][0] == r["from"]["house"] and r["houses"][-1] == r["to"]["house"]


def test_retrograde_count_matches_speed_sign_changes():
    out = F.calculate(BIRTH, kind="retrogrades", start=date(2027, 1, 1), days=365)["retrogrades"]
    a = jd_of(datetime(2027, 1, 1, tzinfo=timezone.utc))
    for pid in ("mercury", "venus", "mars", "jupiter", "saturn", "uranus", "neptune", "pluto"):
        starts = 0
        prev = longitude(pid, a)[1] < 0
        t = a + 0.25
        while t <= a + 365:
            now = longitude(pid, t)[1] < 0
            if now and not prev:
                starts += 1
            prev, t = now, t + 0.25
        began_before = longitude(pid, a)[1] < 0
        got = sum(1 for r in out if r["planet"] == pid and not r["startClipped"])
        assert got == starts, (pid, got, starts, began_before)


def test_year_2027():
    out = F.calculate(BIRTH, kind="year", year=2027)
    assert out["year"] == 2027
    # Born 15 June 1990: age 36 until 15 June 2027, then 37
    assert [y["age"] for y in out["profections"]] == [36, 37]
    assert [y["house"] for y in out["profections"]] == [1, 2]
    # Solar return: the Sun is back on its natal longitude
    natal_sun = next(p for p in MODULES["western.natal"].calculate(BIRTH)["points"] if p["id"] == "sun")["longitude"]
    assert abs(_d(out["solarReturn"]["sun"]["longitude"] - natal_sun)) < 1 / 60
    assert out["solarReturn"]["at"].startswith("2027-06-1")
    # Months add up to the transits, and the transits stay inside the year
    assert sum(m["hits"] for m in out["months"]) == len(out["transits"])
    assert all(e["at"].startswith("2027") for e in out["transits"])
    # Only New and Full Moons; the two solar eclipses of 2027 are marked
    assert {x["phase"] for x in out["lunations"]} == {"new", "full"}
    solar = [(x["at"][:10]) for x in out["lunations"] if x["eclipse"] and x["eclipse"]["kind"] == "solar"]
    assert solar == ["2027-02-06", "2027-08-02"]
    assert set(out["slowPlanets"]) == {"jupiter", "saturn", "uranus", "neptune", "pluto"}
    assert out["firdaria"]["periods"] and out["retrogrades"]


def test_year_without_birth_time_has_no_houses_or_profections():
    b = BirthData(date=BIRTH.date, latitude=BIRTH.latitude, longitude=BIRTH.longitude, timezone=BIRTH.timezone)
    out = F.calculate(b, kind="year", year=2027)
    assert out["profections"] is None and out["solarReturn"]["asc"] is None
    assert all(x["house"] is None for x in out["lunations"]) and out["transits"]


def test_limits():
    with pytest.raises(ValueError):
        F.calculate(BIRTH, kind="lifeline", years=99)
    with pytest.raises(ValueError):
        F.calculate(BIRTH, kind="retrogrades", days=5000)
    with pytest.raises(ValueError):
        F.calculate(BIRTH, kind="year", year=1500)
