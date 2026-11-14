from datetime import date, datetime, time, timezone

import pytest

from astra_engine import MODULES, BirthData
from astra_engine._backend import swe
from astra_engine.sky.common import jd_of
from astra_engine.western import natal, transformations

KNOWN = BirthData(date=date(1990, 6, 15), time=time(14, 30), latitude=40.4, longitude=49.9, timezone="Asia/Baku")
DATE_ONLY = BirthData(date=date(1997, 3, 14), time=None, latitude=0, longitude=0, timezone="UTC")
ANGLE = {"conjunction": 0, "sextile": 60, "square": 90, "trine": 120, "opposition": 180}


def lon(body, jd):
    return swe.calc_ut(jd, body, swe.FLG_SWIEPH)[0][0]


BODY = {"jupiter": swe.JUPITER, "saturn": swe.SATURN, "uranus": swe.URANUS, "neptune": swe.NEPTUNE, "pluto": swe.PLUTO,
        "sun": swe.SUN, "mercury": swe.MERCURY, "venus": swe.VENUS, "mars": swe.MARS, "moon": swe.MOON}


def jd(iso):
    return jd_of(datetime.fromisoformat(iso.replace("Z", "+00:00")))


@pytest.fixture(scope="module")
def known():
    return transformations.calculate(KNOWN, 2024, 6)


def natal_lon(birth, tid):
    chart = natal.calculate(birth)
    if tid in ("asc", "mc"):
        return chart["angles"][tid]["longitude"]
    return next(p["longitude"] for p in chart["points"] if p["id"] == tid)


def test_registered_and_sorted(known):
    assert "western.transformations" in MODULES
    starts = [e["start"] for e in known["episodes"]]
    assert starts == sorted(starts) and known["episodes"]


def test_every_pass_is_exact(known):
    for e in known["episodes"]:
        target = natal_lon(KNOWN, e["natal"])
        for p in e["passes"]:
            d = (lon(BODY[e["transit"]], jd(p["at"])) - target - ANGLE[e["aspect"]]) % 360
            d = min(d, 360 - d)
            sides = min(abs(((lon(BODY[e["transit"]], jd(p["at"])) - target) % 360) - a) for a in (ANGLE[e["aspect"]], 360 - ANGLE[e["aspect"]]))
            assert sides < 2e-3, (e["transit"], e["aspect"], e["natal"], p["at"], sides)


def test_no_pass_is_missed_against_a_finer_independent_scan(known):
    a, b = jd_of(datetime(2024, 1, 1, tzinfo=timezone.utc)), jd_of(datetime(2030, 1, 1, tzinfo=timezone.utc))
    found = {}
    for e in known["episodes"]:
        found[(e["transit"], e["natal"], e["aspect"])] = found.get((e["transit"], e["natal"], e["aspect"]), 0) + len(e["passes"])
    times = [a + i * 0.1 for i in range(int((b - a) / 0.1) + 1)]
    for pid in ("jupiter", "saturn", "uranus", "neptune", "pluto"):
        lons = [lon(BODY[pid], t) for t in times]
        for tid in ("sun", "venus", "saturn", "pluto", "mc"):
            target = natal_lon(KNOWN, tid)
            for aspect, ang in ANGLE.items():
                count = 0
                for off in ({ang} if ang in (0, 180) else {ang, -ang}):
                    vals = [((x - target - off) + 180) % 360 - 180 for x in lons]
                    count += sum(1 for x, y in zip(vals, vals[1:]) if (x < 0) != (y < 0) and abs(x) < 30 and abs(y) < 30)
                assert found.get((pid, tid, aspect), 0) == count, (pid, tid, aspect)


def test_saturn_return_and_uranus_opposition_fall_at_the_known_ages():
    out = transformations.calculate(KNOWN, 2015, 30)
    saturn = [e for e in out["episodes"] if e["sameBody"] and e["transit"] == "saturn" and e["aspect"] == "conjunction"]
    assert len(saturn) == 1 and 28.5 <= saturn[0]["ageAtStart"] <= 30.5
    uranus = [e for e in out["episodes"] if e["sameBody"] and e["transit"] == "uranus" and e["aspect"] == "opposition"]
    assert len(uranus) == 1 and 38 <= uranus[0]["ageAtStart"] <= 46
    jupiter = [e["ageAtStart"] for e in out["episodes"] if e["sameBody"] and e["transit"] == "jupiter" and e["aspect"] == "conjunction"]
    assert any(35 <= a <= 37 for a in jupiter)  # the third Jupiter return, around age 36


def test_episodes_group_retrograde_passes():
    out = transformations.calculate(DATE_ONLY, 2025, 5)
    saturn = next(e for e in out["episodes"] if e["transit"] == "saturn" and e["natal"] == "saturn" and e["aspect"] == "conjunction")
    assert len(saturn["passes"]) == 3 and [p["retrograde"] for p in saturn["passes"]] == [False, True, False]
    assert saturn["start"] == saturn["passes"][0]["at"] and saturn["end"] == saturn["passes"][-1]["at"]


def test_date_only_has_no_moon_or_angles_known_has_both(known):
    targets = {e["natal"] for e in transformations.calculate(DATE_ONLY, 2025, 5)["episodes"]}
    assert not targets & {"moon", "asc", "mc"} and "sun" in targets
    assert {"asc", "mc"} <= {e["natal"] for e in known["episodes"]}
    assert known["meta"]["timeUnknown"] is False
    assert transformations.calculate(DATE_ONLY, 2025, 1)["meta"]["timeUnknown"] is True


def test_validation():
    for bad in ({"years": 0}, {"years": 31}, {"start_year": 1500}, {"start_year": 2998}):
        with pytest.raises(ValueError):
            transformations.calculate(KNOWN, **{"start_year": 2027, "years": 5, **bad})
