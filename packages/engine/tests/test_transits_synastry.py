from datetime import date, datetime, time, timezone

import pytest

from astra_engine import MODULES, BirthData
from astra_engine._backend import swe
from astra_engine.common.zodiac import house_of, separation
from astra_engine.western import synastry, transits
from astra_engine.western.aspects import ASPECTS, AspectPoint, find_cross_aspects
from conftest import BIRTHS

TOL = 1 / 60
AT = datetime(2026, 11, 10, 9, 0, tzinfo=timezone.utc)


def diff(a, b):
    return abs((a - b + 180) % 360 - 180)


# --- cross aspects (pure) --------------------------------------------------------------
def test_cross_aspects_orbs_and_direction():
    first = [AspectPoint("saturn", 92.0, 0.05)]
    second = [AspectPoint("sun", 0.0, 0.0), AspectPoint("moon", 200.0, 0.0)]  # 108° from Saturn: nothing
    found = find_cross_aspects(first, second, {"square": 3.0, "opposition": 3.0})
    assert [(a["p1"], a["type"], a["p2"]) for a in found] == [("saturn", "square", "sun")]
    assert found[0]["applying"] is None  # synastry-style: no time direction
    moving = find_cross_aspects(first, second, {"square": 3.0}, moving="first")
    assert moving[0]["applying"] is False  # 92° moving forward away from 90°


def test_cross_aspects_ignore_aspects_not_in_orb_table():
    found = find_cross_aspects([AspectPoint("a", 0, 1)], [AspectPoint("b", 30, 0)], {"square": 3})
    assert found == []


# --- transits ---------------------------------------------------------------------------
def test_transit_positions_match_reference():
    out = transits.calculate(BIRTHS["baku-1990"], at=AT)
    assert out["at"] == "2026-11-10T09:00:00Z"
    jd = swe.julday(2026, 11, 10, 9.0)
    ids = {"sun": swe.SUN, "moon": swe.MOON, "mars": swe.MARS, "saturn": swe.SATURN, "pluto": swe.PLUTO}
    by_id = {p["id"]: p for p in out["points"]}
    for pid, sid in ids.items():
        xx, _ = swe.calc_ut(jd, sid, swe.FLG_SWIEPH)
        assert diff(by_id[pid]["longitude"], xx[0]) < TOL, pid


def test_transit_aspects_are_consistent_with_positions():
    from astra_engine.western import natal
    b = BIRTHS["baku-1990"]
    out = transits.calculate(b, at=AT)
    base = natal.calculate(b)
    natal_lon = {p["id"]: p["longitude"] for p in base["points"]}
    natal_lon.update({k: v["longitude"] for k, v in base["angles"].items()})
    tr_lon = {p["id"]: p["longitude"] for p in out["points"]}
    assert out["aspects"], "expected at least one transit aspect"
    for a in out["aspects"]:
        sep = separation(tr_lon[a["p1"]], natal_lon[a["p2"]])
        assert abs(abs(sep - ASPECTS[a["type"]][0]) - a["orb"]) < 1e-3
        assert a["orb"] <= transits.TRANSIT_ORBS[a["type"]]


def test_transit_houses_are_natal_houses():
    from astra_engine.western import natal
    b = BIRTHS["london-2000"]
    out = transits.calculate(b, at=AT)
    cusps = [h["longitude"] for h in natal.calculate(b)["houses"]]
    for p in out["points"]:
        assert p["house"] == house_of(p["longitude"], cusps)


def test_transits_time_unknown_has_no_houses():
    b = BirthData(date=date(1990, 6, 15), latitude=40.4, longitude=49.9, timezone="Asia/Baku")
    out = transits.calculate(b, at=AT)
    assert all(p["house"] is None for p in out["points"])
    assert not any(a["p2"] in ("asc", "mc") for a in out["aspects"])


def test_transits_default_to_now():
    out = transits.calculate(BIRTHS["london-2000"])
    at = datetime.fromisoformat(out["at"].replace("Z", "+00:00"))
    assert abs((datetime.now(timezone.utc) - at).total_seconds()) < 120


# --- synastry ---------------------------------------------------------------------------
@pytest.fixture(scope="module")
def pair():
    return BIRTHS["baku-1990"], BIRTHS["sydney-1985"]


def test_synastry_aspects_are_cross_only(pair):
    out = synastry.calculate(*pair)
    first = {p["id"]: p["longitude"] for p in out["first"]["points"]}
    first.update({k: v["longitude"] for k, v in out["first"]["angles"].items()})
    second = {p["id"]: p["longitude"] for p in out["second"]["points"]}
    second.update({k: v["longitude"] for k, v in out["second"]["angles"].items()})
    for a in out["aspects"]:
        sep = separation(first[a["p1"]], second[a["p2"]])
        assert abs(abs(sep - ASPECTS[a["type"]][0]) - a["orb"]) < 1e-3


def test_synastry_overlays(pair):
    out = synastry.calculate(*pair)
    cusps_b = [h["longitude"] for h in out["second"]["houses"]]
    first = {p["id"]: p["longitude"] for p in out["first"]["points"]}
    for o in out["overlays"]["firstInSecond"]:
        assert o["house"] == house_of(first[o["id"]], cusps_b)
    assert len(out["overlays"]["secondInFirst"]) == len(synastry.SYNASTRY_BODIES)


def test_synastry_score_matches_kerykeion(pair):
    from kerykeion import RelationshipScoreFactory
    from astra_engine.western import natal
    from astra_engine import resolve_utc
    subjects = [natal.build_subject(b, resolve_utc(b.date, b.time, b.timezone).utc) for b in pair]
    expected = RelationshipScoreFactory(*subjects).get_relationship_score()
    out = synastry.calculate(*pair)["score"]
    assert out["value"] == expected.score_value
    assert out["value"] == sum(x["points"] for x in out["breakdown"])
    assert out["level"] == synastry.level_of(out["value"])


def test_synastry_without_birth_time_drops_ascendant_rules():
    a = BirthData(date=date(1990, 6, 15), latitude=40.4, longitude=49.9, timezone="Asia/Baku")
    b = BIRTHS["london-2000"]
    score = synastry.calculate(a, b)["score"]
    assert not any(x["rule"] in synastry.ASCENDANT_RULES for x in score["breakdown"])
    assert score["value"] == sum(x["points"] for x in score["breakdown"])


@pytest.mark.parametrize("value,level", [(0, "minimal"), (5, "medium"), (12, "important"), (19, "veryImportant"),
                                         (24, "exceptional"), (31, "rareExceptional")])
def test_score_levels(value, level):
    assert synastry.level_of(value) == level


def test_registered():
    assert MODULES["western.transits"] is transits and MODULES["western.synastry"] is synastry
    assert time  # imported for fixtures readability
