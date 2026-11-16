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


G = MODULES["western.generation"]


@pytest.mark.parametrize("pid", ["saturn", "uranus", "neptune", "pluto", "northNode"])
def test_generation_stay_matches_an_independent_daily_scan(pid):
    out = {p["id"]: p for p in G.calculate(BIRTH)["planets"]}[pid]
    birth = jd_of(datetime(1990, 6, 15, 12, tzinfo=timezone.utc))
    idx = sign_index(longitude(pid, birth)[0])
    assert out["sign"] == SIGNS[idx]
    start, end = _jd(out["start"]), _jd(out["end"])
    # the sign is the birth sign just after the start and just before the end, and a different one just outside
    assert sign_index(longitude(pid, start + 0.01)[0]) == idx and sign_index(longitude(pid, end - 0.01)[0]) == idx
    assert sign_index(longitude(pid, start - 0.01)[0]) != idx and sign_index(longitude(pid, end + 0.01)[0]) != idx
    # between the first entry and the last exit the planet is in the sign except for short retrograde dips
    t, away = start + 0.01, 0.0  # the boundary instant itself can fall on either side
    while t < end - 0.01:
        if sign_index(longitude(pid, t)[0]) != idx:
            away += 1.0
        t += 1.0
    assert away < 400 * out["dips"] + 1
    assert out["daysFromStart"] == pytest.approx(birth - start, abs=0.1)
    assert out["daysToEnd"] == pytest.approx(end - birth, abs=0.1)


def test_generation_known_dates():
    pluto = {p["id"]: p for p in G.calculate(BIRTH)["planets"]}["pluto"]
    assert pluto["start"].startswith("1983-11-05") and pluto["end"].startswith("1995-11-10")


D = MODULES["western.directions"]
ASPECT_ANGLES = {"conjunction": 0, "sextile": 60, "square": 90, "trine": 120, "opposition": 180}


def _dir_setup():
    """Natal longitudes of the points the directions module uses: the ten planets and the two angles."""
    chart = MODULES["western.natal"].calculate(BIRTH)
    ids = ["sun", "moon", "mercury", "venus", "mars", "jupiter", "saturn", "uranus", "neptune", "pluto"]
    lon = {p["id"]: p["longitude"] for p in chart["points"] if p["id"] in ids}
    lon.update({a: chart["angles"][a]["longitude"] for a in ("asc", "mc")})
    return lon, None


def _birth_jd():
    from astra_engine.common.birth import resolve_utc
    from datetime import time
    return jd_of(resolve_utc(BIRTH.date, BIRTH.time or time(12, 0), BIRTH.timezone).utc)


def test_solar_arc_hits_are_exact_with_the_progressed_sun_arc():
    out = D.calculate(BIRTH, start_year=2024, years=6)
    lon, _ = _dir_setup()
    bj = _birth_jd()
    assert out["solarArc"]
    for h in out["solarArc"]:
        age = (_jd(h["at"]) - bj) / 365.2422
        arc = _d(longitude("sun", bj + age)[0] - lon["sun"])
        assert arc == pytest.approx(h["arc"], abs=0.002)
        diff = abs(_d(lon[h["directed"]] + arc - lon[h["natal"]]))
        assert diff == pytest.approx(ASPECT_ANGLES[h["aspect"]], abs=0.003), h


def test_solar_arc_finds_every_hit_of_an_independent_scan():
    out = D.calculate(BIRTH, start_year=2024, years=6)
    lon, _ = _dir_setup()
    bj = _birth_jd()
    found = {(h["directed"], h["natal"], h["aspect"], off_of) for h in out["solarArc"] for off_of in [0]}
    a0 = (_jd("2024-01-01T00:00:00Z") - bj) / 365.2422
    a1 = (_jd("2030-01-01T00:00:00Z") - bj) / 365.2422
    n = 2000
    ages = [a0 + (a1 - a0) * i / n for i in range(n + 1)]
    arcs = [_d(longitude("sun", bj + a)[0] - lon["sun"]) for a in ages]
    expected = set()
    for p in lon:
        for q in lon:
            if p == q or (p in ("asc", "mc") and q in ("asc", "mc")):
                continue
            for aspect, angle in ASPECT_ANGLES.items():
                for off in {angle, -angle}:
                    vals = [_d(lon[p] + arc - lon[q] - off) for arc in arcs]
                    if any((x < 0) != (y < 0) and abs(x) < 30 and abs(y) < 30 for x, y in zip(vals, vals[1:])):
                        expected.add((p, q, aspect, 0))
    assert found == expected


def test_progressed_aspects_are_exact():
    out = D.calculate(BIRTH, start_year=2025, years=5)
    lon, _ = _dir_setup()
    bj = _birth_jd()
    assert out["progressed"] and out["ingresses"]
    for h in out["progressed"]:
        jd = _jd(h["at"])
        prog = longitude(h["progressed"], bj + (jd - bj) / 365.2422)[0]
        assert abs(_d(prog - lon[h["natal"]])) == pytest.approx(ASPECT_ANGLES[h["aspect"]], abs=0.003) or \
            abs(abs(_d(prog - lon[h["natal"]])) - ASPECT_ANGLES[h["aspect"]]) < 0.003, h
    for h in out["ingresses"]:
        jd = _jd(h["at"])
        before = sign_index(longitude(h["progressed"], bj + (jd - 0.01 - bj) / 365.2422)[0])
        after = sign_index(longitude(h["progressed"], bj + (jd + 0.01 - bj) / 365.2422)[0])
        assert SIGNS[after] == h["sign"] and before != after


def test_progressed_moon_count_matches_a_fine_scan_and_date_only_drops_the_moon():
    out = D.calculate(BIRTH, start_year=2025, years=5)
    lon, _ = _dir_setup()
    bj = _birth_jd()
    a, b = _jd("2025-01-01T00:00:00Z"), _jd("2030-01-01T00:00:00Z")
    expected = 0
    for tid, tl in lon.items():
        if tid == "moon":
            continue
        for aspect, angle in ASPECT_ANGLES.items():
            for off in ((angle,) if angle in (0, 180) else (angle, -angle)):
                prev, t = None, a
                while t <= b:
                    v = _d(longitude("moon", bj + (t - bj) / 365.2422)[0] - tl - off)
                    if prev is not None and (prev < 0) != (v < 0) and abs(v) < 30 and abs(prev) < 30:
                        expected += 1
                    prev, t = v, t + 2.0
    assert expected == sum(1 for h in out["progressed"] if h["progressed"] == "moon")
    dateonly = D.calculate(BirthData(date=BIRTH.date, time=None, latitude=BIRTH.latitude, longitude=BIRTH.longitude, timezone=BIRTH.timezone), start_year=2025, years=3)
    assert dateonly["meta"]["timeUnknown"]
