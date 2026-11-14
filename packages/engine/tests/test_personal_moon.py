"""Personal Moon: every event is checked against raw Swiss Ephemeris, and completeness against an independent
finer scan. Lunations: elongation at each moment, houses, and two real eclipses of 2026."""
from datetime import date, datetime, timezone

import pytest
import swisseph as swe

from astra_engine import MODULES, BirthData
from astra_engine.common.zodiac import house_of, lunar_mansion
from astra_engine.sky.common import jd_of, longitude
from conftest import BIRTHS

BIRTH = BIRTHS["baku-1990"]
START = datetime(2026, 11, 14, 0, 0, tzinfo=timezone.utc)
ANGLES = {"conjunction": 0, "sextile": 60, "square": 90, "trine": 120, "opposition": 180}
MOD = MODULES["western.personalmoon"]


def _jd(stamp: str) -> float:
    return jd_of(datetime.fromisoformat(stamp.replace("Z", "+00:00")))


def _moon(jd: float) -> float:
    return longitude("moon", jd)[0]


def _d(x: float) -> float:
    return (x + 180) % 360 - 180


def _natal():
    from astra_engine.western.personal_moon import TARGETS
    chart = MODULES["western.natal"].calculate(BIRTH)
    pts = {p["id"]: p["longitude"] for p in chart["points"] if p["id"] in TARGETS}  # the engine's targets
    pts.update({a: chart["angles"][a]["longitude"] for a in ("asc", "mc")})
    return chart, pts


def test_day_events_are_exact():
    out = MOD.calculate(BIRTH, kind="day", start=START, hours=24)
    chart, pts = _natal()
    cusps = [h["longitude"] for h in chart["houses"]]
    assert out["events"], "the Moon always does something in 24 hours"
    last = ""
    for e in out["events"]:
        assert e["at"] >= last
        last = e["at"]
        moon = _moon(_jd(e["at"]))
        if e["type"] == "aspect":
            assert abs(_d(moon - pts[e["point"]] - _signed(e["aspect"], moon, pts[e["point"]]))) < 0.002, e
        elif e["type"] == "sign":
            assert min(moon % 30, 30 - moon % 30) < 0.002, e  # a sign boundary is a multiple of 30°
        else:
            assert abs(_d(moon - cusps[e["house"] - 1])) < 0.002, e


def _signed(aspect: str, moon: float, target: float) -> float:
    """The exact angle (with sign) the event refers to: whichever side the Moon is on at that moment."""
    ang = ANGLES[aspect]
    return min((ang, -ang), key=lambda a: abs(_d(moon - target - a)))


def test_day_is_complete_against_a_ten_minute_scan():
    out = MOD.calculate(BIRTH, kind="day", start=START, hours=24)
    chart, pts = _natal()
    cusps = [h["longitude"] for h in chart["houses"]]
    a = jd_of(START)
    n = 24 * 6
    moon = [_moon(a + i / (24 * 6)) for i in range(n + 1)]

    def crossings(edge):
        c = 0
        for x, y in zip(moon, moon[1:]):
            fx, fy = _d(x - edge), _d(y - edge)
            if (fx < 0) != (fy < 0) and abs(fx - fy) < 90:
                c += 1
        return c

    for kind, edges in (("house", cusps), ("sign", [k * 30.0 for k in range(12)])):
        expected = sum(crossings(e) for e in edges)
        assert sum(1 for e in out["events"] if e["type"] == kind) == expected, kind
    expected = 0
    for tid, tlon in pts.items():
        edges = {round((tlon + g) % 360, 9) for ang in ANGLES.values() for g in (ang, -ang)}  # +180 and -180 are one
        expected += sum(crossings(e) for e in edges)
    assert sum(1 for e in out["events"] if e["type"] == "aspect") == expected


def test_day_start_position_and_house():
    out = MOD.calculate(BIRTH, kind="day", start=START, hours=1)
    chart, _ = _natal()
    cusps = [h["longitude"] for h in chart["houses"]]
    lon = _moon(jd_of(START))
    assert abs(out["moon"]["longitude"] - lon % 360) < 1e-4
    assert out["moon"]["house"] == house_of(lon, cusps) and out["moon"]["mansion"] == lunar_mansion(lon)


def test_lunations_are_exact_and_in_houses():
    out = MOD.calculate(BIRTH, kind="lunations", start=date(2026, 11, 14), days=90)
    chart, pts = _natal()
    cusps = [h["longitude"] for h in chart["houses"]]
    items = out["lunations"]
    assert [x["phase"] for x in items[:4]] == ["first_quarter", "full", "last_quarter", "new"]
    assert len(items) == 12 or len(items) == 13  # a 90-day window holds three lunar months
    want = {"new": 0, "first_quarter": 90, "full": 180, "last_quarter": 270}
    for x in items:
        jd = _jd(x["at"])
        assert abs(_d(_moon(jd) - longitude("sun", jd)[0] - want[x["phase"]])) < 0.002
        assert x["house"] == house_of(x["longitude"], cusps)
        assert (x["sunHouse"] is not None) == (x["phase"] == "full")
        assert all(a["orb"] <= 3.0 for a in x["aspects"])


def test_known_eclipses_of_2026_are_marked():
    out = MOD.calculate(BIRTH, kind="lunations", start=date(2026, 1, 1), days=366)
    eclipses = [(x["at"][:10], x["eclipse"]["kind"], x["phase"]) for x in out["lunations"] if x["eclipse"]]
    assert ("2026-03-03", "lunar", "full") in eclipses     # total lunar eclipse
    assert ("2026-08-12", "solar", "new") in eclipses      # total solar eclipse
    assert ("2026-02-17", "solar", "new") in eclipses      # annular solar eclipse
    assert len(eclipses) == 4


def test_unknown_time_has_no_houses_or_angles():
    b = BirthData(date=BIRTH.date, latitude=BIRTH.latitude, longitude=BIRTH.longitude, timezone=BIRTH.timezone)
    day = MOD.calculate(b, kind="day", start=START, hours=48)
    assert day["meta"]["timeUnknown"] and day["moon"]["house"] is None
    assert all(e["type"] != "house" and e.get("point") not in ("asc", "mc", "moon") for e in day["events"])
    lun = MOD.calculate(b, kind="lunations", start=date(2026, 11, 14), days=40)
    assert all(x["house"] is None and x["sunHouse"] is None for x in lun["lunations"])


def test_mansions():
    assert lunar_mansion(0) == 1 and lunar_mansion(12.85) == 1 and lunar_mansion(12.86) == 2
    assert lunar_mansion(359.99) == 28 and lunar_mansion(-0.01) == 28
    assert [lunar_mansion(i * 360 / 28 + 0.001) for i in range(28)] == list(range(1, 29))


def test_limits():
    with pytest.raises(ValueError):
        MOD.calculate(BIRTH, kind="day", start=START, hours=100)
    with pytest.raises(ValueError):
        MOD.calculate(BIRTH, kind="lunations", start=date(2026, 1, 1), days=900)
