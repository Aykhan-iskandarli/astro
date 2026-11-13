from datetime import date, datetime

from astra_engine import SKY
from astra_engine._backend import swe
from astra_engine.sky import moon

BAKU = (40.4093, 49.8671, "Asia/Baku")
ONE_ARCSEC = 1 / 3600


def _jd(iso):
    d = datetime.fromisoformat(iso.replace("Z", "+00:00"))
    return swe.julday(d.year, d.month, d.day, d.hour + d.minute / 60 + d.second / 3600)


def _moon(jd):
    return swe.calc_ut(jd, swe.MOON, swe.FLG_SWIEPH)[0][0]


def _sep(a, b):
    return abs((a - b + 180) % 360 - 180)


def test_registered():
    assert SKY["sky.moon"] is moon


def test_void_of_course_rules():
    out = moon.calculate(date(2026, 11, 1), date(2026, 12, 1), *BAKU)
    voc = out["voidOfCourse"]
    assert 10 <= len(voc) <= 16  # about one per sign change, ~13 a month
    for v in voc:
        s, e = _jd(v["start"]), _jd(v["end"])
        assert s < e
        # ends exactly when the Moon enters the next sign
        assert int(_moon(e + 1e-4) // 30) == moon.SIGNS.index(v["nextSign"])
        assert int(_moon(e - 1e-4) // 30) == moon.SIGNS.index(v["sign"])
        # starts at an exact aspect, and no exact Ptolemaic aspect follows before the sign change
        la = v["lastAspect"]
        body = moon.VOC_BODIES[la["body"]]
        angle = {"conjunction": 0, "sextile": 60, "square": 90, "trine": 120, "opposition": 180}[la["aspect"]]
        sep = _sep(_moon(s), swe.calc_ut(s, body, swe.FLG_SWIEPH)[0][0])
        assert abs(sep - angle) < ONE_ARCSEC
        assert not [x for x in moon.moon_aspects(s + 1e-3, e - 1e-3)]


def test_lunar_days_restart_at_new_moon_and_follow_moonrises():
    starts = moon.lunar_day_starts(swe.julday(2026, 11, 1, 0), swe.julday(2026, 12, 1, 0), BAKU[0], BAKU[1])
    numbers = [n for _, n in starts]
    assert max(numbers) <= 30
    for (_, a), (jd, b) in zip(starts, starts[1:]):
        assert b == a + 1 or b == 1
        if b == 1:  # New Moon: Sun and Moon conjunct
            assert _sep(_moon(jd), swe.calc_ut(jd, swe.SUN, swe.FLG_SWIEPH)[0][0]) < ONE_ARCSEC
        else:  # moonrise at Baku: the Moon is on the horizon (altitude near the refraction/semi-diameter offset)
            xx = swe.calc_ut(jd, swe.MOON, swe.FLG_SWIEPH | swe.FLG_EQUATORIAL)[0]
            az = swe.azalt(jd, swe.EQU2HOR, (BAKU[1], BAKU[0], 0), 0, 0, (xx[0], xx[1], xx[2]))
            assert -1.5 < az[1] < 0.5


def test_days_cover_the_range():
    out = moon.calculate(date(2026, 11, 1), date(2026, 11, 8), *BAKU)
    assert [d["date"] for d in out["days"]] == [f"2026-11-0{i}" for i in range(1, 8)]
    for d in out["days"]:
        assert d["lunarDays"] and d["lunarDays"][0]["number"] >= 1
        assert d["signs"][0]["sign"] in moon.SIGNS
        assert 0 <= d["illumination"] <= 1


def test_range_limits():
    import pytest
    with pytest.raises(ValueError):
        moon.calculate(date(2026, 1, 1), date(2026, 6, 1), *BAKU)


def test_phase_names_are_centred():
    # 2026-11-09 is the New Moon (Baku); four days later the Moon is a waxing crescent, not "new"
    out = moon.calculate(date(2026, 11, 9), date(2026, 11, 14), *BAKU)
    by_date = {d["date"]: d for d in out["days"]}
    assert by_date["2026-11-09"]["phase"] == "newMoon"
    assert by_date["2026-11-13"]["phase"] == "waxingCrescent"
    assert by_date["2026-11-13"]["waxing"] is True
