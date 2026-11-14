"""Profections, firdaria and solar arc, cross-checked against kerykeion and our progressions module."""
import warnings
from datetime import date, datetime, timezone

import pytest

from astra_engine import MODULES, BirthData
from astra_engine.common.birth import resolve_utc
from astra_engine.western import natal
from conftest import BIRTHS

ON = date(2026, 11, 11)


def _kery_subject(birth):
    utc = resolve_utc(birth.date, birth.time, birth.timezone).utc
    with warnings.catch_warnings():
        warnings.simplefilter("ignore")
        return natal.build_subject(birth, utc)


def _night_birth():
    return BirthData(date=date(1985, 3, 2), time=__import__("datetime").time(23, 40), latitude=40.4093,
                     longitude=49.8671, timezone="Asia/Baku")


@pytest.mark.parametrize("birth", [BIRTHS["baku-1990"], _night_birth()])
def test_profections_match_kerykeion(birth):
    import kerykeion as k
    ours = MODULES["western.timelords"].calculate(birth, on=ON)["profections"]
    with warnings.catch_warnings():
        warnings.simplefilter("ignore")
        theirs = k.ProfectionsFactory.from_subject(_kery_subject(birth), target_date=ON.isoformat())
    cur = next(y for y in ours["years"] if y["age"] == ours["currentAge"])
    assert cur["age"] == theirs.current.age and cur["house"] == theirs.current.house
    assert cur["lord"] == theirs.current.lord.lower()
    assert cur["sign"][:3] == theirs.current.sign.lower()


@pytest.mark.parametrize("birth", [BIRTHS["baku-1990"], _night_birth()])
def test_firdaria_matches_kerykeion(birth):
    import kerykeion as k
    ours = MODULES["western.timelords"].calculate(birth, on=ON)["firdaria"]
    with warnings.catch_warnings():
        warnings.simplefilter("ignore")
        theirs = k.FirdariaFactory.from_subject(_kery_subject(birth), target_date=ON.isoformat())
    assert ours["diurnal"] == theirs.is_diurnal
    norm = lambda x: x.lower().replace("_node", "Node").replace("northnode", "northNode").replace("southnode", "southNode")
    for mine, other in zip(ours["periods"], theirs.periods):
        assert mine["lord"] == norm(other.lord) and mine["years"] == other.years
        assert mine["start"][:16] == other.start[:16]
        for ms, os_ in zip(mine["subPeriods"], other.sub_periods):
            assert ms["lord"] == os_.lord.lower() and ms["start"][:16] == os_.start[:16]
    cur = next(p for p in ours["periods"] if p["current"])
    assert cur["lord"] == theirs.current.lord.lower()
    assert next(s for s in cur["subPeriods"] if s["current"])["lord"] == theirs.current_sub.lord.lower()


def test_solar_arc_matches_progressions_and_is_applied_to_every_point():
    birth = BIRTHS["baku-1990"]
    out = MODULES["western.timelords"].calculate(birth, on=ON)["solarArc"]
    prog = MODULES["western.progressions"].calculate(birth, target=datetime(2026, 11, 11, 12, tzinfo=timezone.utc))
    assert abs(out["arc"] - prog["solarArc"]) < 1 / 3600
    chart = MODULES["western.natal"].calculate(birth)
    natal_lon = {p["id"]: p["longitude"] for p in chart["points"]}
    natal_lon.update({a: chart["angles"][a]["longitude"] for a in ("asc", "mc")})
    for p in out["points"]:
        assert abs(((p["longitude"] - natal_lon[p["id"]] - out["arc"]) + 180) % 360 - 180) < 1e-5
    assert all(a["orb"] <= 1.0 and a["p1"] != a["p2"] for a in out["aspects"])


def test_needs_birth_time():
    with pytest.raises(ValueError):
        MODULES["western.timelords"].calculate(BirthData(date=date(1990, 6, 15), latitude=40, longitude=49,
                                                         timezone="Asia/Baku"))
