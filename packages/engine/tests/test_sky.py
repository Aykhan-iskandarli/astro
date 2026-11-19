"""Sky (now / calendar) and the transit timeline, checked against raw Swiss Ephemeris."""
from datetime import date, datetime, timezone

import pytest
import swisseph as swe

from astra_engine import MODULES, SKY
from astra_engine.sky.common import jd_of, longitude
from conftest import BIRTHS

AT = datetime(2026, 11, 10, 12, 0, tzinfo=timezone.utc)
ANGLES = {"conjunction": 0, "sextile": 60, "square": 90, "trine": 120, "opposition": 180}


def _jd(stamp: str) -> float:
    return jd_of(datetime.fromisoformat(stamp.replace("Z", "+00:00")))


def _sep(a: float, b: float) -> float:
    d = abs((a - b) % 360)
    return min(d, 360 - d)


def test_sky_now_positions_match_swisseph():
    out = SKY["sky.now"].calculate(AT)
    jd = jd_of(AT)
    for p in out["points"]:
        assert _sep(p["longitude"], longitude(p["id"], jd)[0]) < 1 / 3600
    assert out["retrogrades"] == [p["id"] for p in out["points"]
                                  if p["id"] in SKY["sky.now"].RETRO_CAPABLE and p["speed"] < 0]
    assert 0 <= out["moon"]["illumination"] <= 1


def test_void_of_course_last_aspect_and_ingress_are_exact():
    voc = SKY["sky.now"].calculate(AT)["moon"]["voidOfCourse"]
    last = voc["lastAspect"]
    jd = _jd(last["exact"])
    moon = longitude("moon", jd)[0]
    other = longitude(last["planet"], jd)[0]
    assert abs(_sep(moon, other) - ANGLES[last["aspect"]]) < 1 / 60
    # Void ends when the Moon enters the next sign (a multiple of 30°)
    ingress = longitude("moon", _jd(voc["end"]))[0]
    assert _sep(ingress, round(ingress / 30) * 30) < 1 / 60


def test_full_moon_is_fully_lit_and_opposite_the_sun():
    cal = SKY["sky.calendar"].calculate(date(2026, 11, 1), date(2026, 12, 1))
    full = next(x for x in cal["lunations"] if x["phase"] == "full")
    jd = _jd(full["at"])
    assert abs(_sep(longitude("moon", jd)[0], longitude("sun", jd)[0]) - 180) < 1 / 60
    assert swe.pheno_ut(jd, swe.MOON, swe.FLG_SWIEPH)[1] > 0.99


def test_calendar_rejects_long_ranges():
    with pytest.raises(ValueError):
        SKY["sky.calendar"].calculate(date(2026, 1, 1), date(2028, 1, 1))


def test_timeline_events_are_exact_and_complete():
    birth = BIRTHS["baku-1990"]
    out = MODULES["western.timeline"].calculate(birth, start=date(2026, 1, 1), days=365)
    natal = MODULES["western.natal"].calculate(birth)
    targets = {p["id"]: p["longitude"] for p in natal["points"]}
    targets.update({a: natal["angles"][a]["longitude"] for a in ("asc", "mc")})
    assert out["events"]
    for e in out["events"]:
        lon = longitude(e["transit"], _jd(e["at"]))[0]
        assert abs(_sep(lon, targets[e["natal"]]) - ANGLES[e["aspect"]]) < 1 / 60
    # Independent hourly scan for one slow pair: the same number of exact passes
    jd0 = jd_of(datetime(2026, 1, 1, tzinfo=timezone.utc))
    for pid in ("saturn", "jupiter"):
        for tid in ("sun", "moon", "asc"):
            for name, ang in ANGLES.items():
                offs = {ang, -ang} if ang not in (0, 180) else {ang}
                count = 0
                for off in offs:
                    prev = None
                    for h in range(365 * 24 + 1):
                        f = (longitude(pid, jd0 + h / 24)[0] - targets[tid] - off + 180) % 360 - 180
                        if prev is not None and prev * f < 0 and abs(f) < 30:
                            count += 1
                        prev = f
                got = sum(1 for e in out["events"] if (e["transit"], e["natal"], e["aspect"]) == (pid, tid, name))
                assert got == count, (pid, tid, name)


def test_worker_threads_use_the_swiss_ephemeris_files():
    """Swiss Ephemeris settings are thread-local; the API runs calculations in worker threads."""
    from concurrent.futures import ThreadPoolExecutor

    from astra_engine._backend import swe as proxied

    def in_thread():
        xx, flag = proxied.calc_ut(jd_of(AT), swe.CHIRON, swe.FLG_SWIEPH)
        moon_flag = proxied.calc_ut(jd_of(AT), swe.MOON, swe.FLG_SWIEPH)[1]
        vedic = MODULES["vedic.chart"].calculate(BIRTHS["baku-1990"])
        return xx[0], flag & swe.FLG_SWIEPH, moon_flag & swe.FLG_SWIEPH, (vedic["grahas"], vedic["lagna"], vedic["ayanamsa"])

    v = MODULES["vedic.chart"].calculate(BIRTHS["baku-1990"])
    main = (v["grahas"], v["lagna"], v["ayanamsa"])
    with ThreadPoolExecutor(1) as pool:
        chiron, flag, moon_flag, vedic = pool.submit(in_thread).result()
    assert flag == swe.FLG_SWIEPH and moon_flag == swe.FLG_SWIEPH  # not the Moshier fallback
    assert vedic == main


# ---- collective sky of a year ----

def test_collective_aspects_are_exact_and_complete():
    out = SKY["sky.collective"].calculate(2026)
    assert out["aspects"], "2026 has slow-planet aspects"
    for a in out["aspects"]:
        jd = _jd(a["at"])
        p, q = a["planets"]
        assert _sep(longitude(p, jd)[0], longitude(q, jd)[0]) == pytest.approx(ANGLES[a["aspect"]], abs=0.01), a
    # an independent fine scan finds exactly the same set of (pair, aspect) hits in the year
    lo, hi = _jd("2026-01-01T00:00:00Z"), _jd("2027-01-01T00:00:00Z")
    pairs = [("jupiter", "saturn"), ("jupiter", "uranus"), ("jupiter", "neptune"), ("jupiter", "pluto"),
             ("saturn", "uranus"), ("saturn", "neptune"), ("saturn", "pluto"),
             ("uranus", "neptune"), ("uranus", "pluto"), ("neptune", "pluto")]
    found = 0
    for p, q in pairs:
        for name, ang in ANGLES.items():
            for target in ((ang,) if ang in (0, 180) else (ang, -ang)):
                prev = None
                jd = lo
                while jd < hi:
                    d = (longitude(p, jd)[0] - longitude(q, jd)[0] - target + 180) % 360 - 180
                    if prev is not None and (d > 0) != (prev > 0) and abs(d) < 5 and abs(prev) < 5:
                        found += 1
                    prev = d
                    jd += 0.5
    assert found == len(out["aspects"])


def test_collective_known_events_2026():
    out = SKY["sky.collective"].calculate(2026)
    pos = {p["id"]: p for p in out["positions"]}
    assert (pos["saturn"]["signAtStart"], pos["saturn"]["signAtEnd"]) == ("pisces", "aries")
    assert pos["saturn"]["stays"][0]["end"][:10] == "2026-02-14"
    assert pos["neptune"]["stays"][0]["end"][:10] == "2026-01-26"
    assert pos["jupiter"]["stays"][0]["end"][:10] == "2026-06-30"
    assert pos["pluto"]["stays"] == [{"sign": "aquarius", "start": None, "end": None}]
    sn = [a for a in out["aspects"] if a["planets"] == ["saturn", "neptune"] and a["aspect"] == "conjunction"]
    assert len(sn) == 1 and sn[0]["at"][:10] == "2026-02-20"
    assert [(e["kind"], e["at"][:10]) for e in out["eclipses"]] == [
        ("solar", "2026-02-17"), ("lunar", "2026-03-03"), ("solar", "2026-08-12"), ("lunar", "2026-08-28")]
    assert {r["planet"] for r in out["retrogrades"]} <= {"jupiter", "saturn", "uranus", "neptune", "pluto"}


def test_collective_great_conjunction_2020():
    out = SKY["sky.collective"].calculate(2020)
    js = [a for a in out["aspects"] if a["planets"] == ["jupiter", "saturn"] and a["aspect"] == "conjunction"]
    assert len(js) == 1 and js[0]["at"][:10] == "2020-12-21"
    sp = [a for a in out["aspects"] if a["planets"] == ["saturn", "pluto"] and a["aspect"] == "conjunction"]
    assert len(sp) == 1 and sp[0]["at"][:10] == "2020-01-12"
    # a retrograde dip across a boundary is listed as separate stays
    sat = next(p for p in out["positions"] if p["id"] == "saturn")
    assert [s["sign"] for s in sat["stays"]] == ["capricorn", "aquarius", "capricorn", "aquarius"]


def test_collective_year_range():
    with pytest.raises(ValueError):
        SKY["sky.collective"].calculate(1700)
