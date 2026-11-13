from datetime import date, datetime, timezone

import pytest

from astra_engine import MODULES, BirthData, resolve_utc
from astra_engine._backend import swe
from astra_engine.vedic import chart as vedic
from astra_engine.vedic.chart import (DASHA_YEARS, nakshatra_of, navamsa_sign, dignity_of, vimshottari,
                                      VIMSHOTTARI_YEAR_DAYS)
from conftest import BIRTHS

TOL = 1 / 60


def diff(a, b):
    return abs((a - b + 180) % 360 - 180)


def test_lahiri_ayanamsa_at_j2000():
    # Lahiri ayanamsa on 2000-01-01 is about 23°51′ (23.85°) — an independent sanity anchor
    out = vedic.calculate(BIRTHS["london-2000"])
    assert 23.84 < out["ayanamsa"] < 23.87


@pytest.mark.parametrize("bid", list(BIRTHS))
def test_sidereal_positions_match_reference(bid):
    b = BIRTHS[bid]
    out = vedic.calculate(b)
    utc = resolve_utc(b.date, b.time, b.timezone).utc
    jd = swe.julday(utc.year, utc.month, utc.day, utc.hour + utc.minute / 60)
    swe.set_sid_mode(swe.SIDM_LAHIRI)
    flags = swe.FLG_SWIEPH | swe.FLG_SIDEREAL
    by_id = {g["id"]: g for g in out["grahas"]}
    for pid, sid in [("sun", swe.SUN), ("moon", swe.MOON), ("saturn", swe.SATURN), ("rahu", swe.MEAN_NODE)]:
        assert diff(by_id[pid]["longitude"], swe.calc_ut(jd, sid, flags)[0][0]) < TOL, pid
    # Sidereal = tropical − ayanamsa
    trop = swe.calc_ut(jd, swe.SUN, swe.FLG_SWIEPH)[0][0]
    assert diff(by_id["sun"]["longitude"], trop - out["ayanamsa"]) < TOL
    assert diff(by_id["ketu"]["longitude"], by_id["rahu"]["longitude"] + 180) < 1e-6
    # Whole-sign bhavas from the lagna
    lagna_idx = vedic.SIGNS.index(out["lagna"]["sign"])
    for g in out["grahas"]:
        assert g["house"] == (vedic.SIGNS.index(g["sign"]) - lagna_idx) % 12 + 1


@pytest.mark.parametrize("lon,nak,pada,lord", [
    (0.0, "ashwini", 1, "ketu"), (3.34, "ashwini", 2, "ketu"), (13.34, "bharani", 1, "venus"),
    (40.0, "rohini", 1, "moon"), (359.99, "revati", 4, "mercury"), (120.0, "magha", 1, "ketu"),
])
def test_nakshatras(lon, nak, pada, lord):
    n = nakshatra_of(lon)
    assert (n["id"], n["pada"], n["lord"]) == (nak, pada, lord)


@pytest.mark.parametrize("lon,d9", [
    (0.0, "aries"), (3.34, "taurus"), (29.9, "sagittarius"),   # movable sign starts from itself
    (30.0, "capricorn"),                                       # fixed sign starts from its 9th
    (60.0, "libra"),                                           # dual sign starts from its 5th... (Gemini -> Libra)
    (90.0, "cancer"), (359.9, "pisces"),
])
def test_navamsa(lon, d9):
    assert navamsa_sign(lon) == d9


@pytest.mark.parametrize("graha,sign,expected", [
    ("sun", "aries", "exalted"), ("sun", "libra", "debilitated"), ("sun", "leo", "own"),
    ("saturn", "libra", "exalted"), ("moon", "scorpio", "debilitated"), ("rahu", "taurus", None),
])
def test_dignities(graha, sign, expected):
    assert dignity_of(graha, sign) == expected


def test_vimshottari_from_start_of_ashwini():
    birth = datetime(2000, 1, 1, tzinfo=timezone.utc)
    d = vimshottari(0.0, birth, now=birth)
    assert d["startLord"] == "ketu" and d["balanceYears"] == 7
    assert d["mahadashas"][0]["start"] == "2000-01-01"
    assert [m["lord"] for m in d["mahadashas"]] == ["ketu", "venus", "sun", "moon", "mars", "rahu", "jupiter",
                                                   "saturn", "mercury"]
    assert sum(m["years"] for m in d["mahadashas"]) == 120


def test_vimshottari_balance_and_antardashas():
    birth = datetime(1990, 6, 15, 9, 30, tzinfo=timezone.utc)
    moon = 13 + 20 / 60 + NAK_HALF  # middle of Bharani (Venus)
    d = vimshottari(moon, birth, now=birth)
    assert d["startLord"] == "venus"
    assert abs(d["balanceYears"] - 10) < 1e-6
    first = d["mahadashas"][0]
    assert first["current"] is True
    # Antardashas start with the mahadasha lord, follow the cycle, and fill the mahadasha exactly
    assert [a["lord"] for a in first["antardashas"]][:3] == ["venus", "sun", "moon"]
    assert abs(sum(a["years"] for a in first["antardashas"]) - DASHA_YEARS["venus"]) < 1e-3
    assert first["antardashas"][0]["start"] == first["start"]
    assert first["antardashas"][-1]["end"] == first["end"]


NAK_HALF = (360 / 27) / 2


def test_dasha_year_length_documented():
    assert VIMSHOTTARI_YEAR_DAYS == 365.25


def test_time_unknown_has_no_lagna_or_houses():
    b = BirthData(date=date(1990, 6, 15), latitude=40.4, longitude=49.9, timezone="Asia/Baku")
    out = vedic.calculate(b)
    assert out["lagna"] is None and all(g["house"] is None for g in out["grahas"])
    assert out["meta"]["timeUnknown"] is True


def test_registered():
    assert MODULES["vedic.chart"] is vedic


from datetime import datetime as _dt, timezone as _tz  # noqa: E402

from astra_engine.vedic import chart as _vedic  # noqa: E402


def _jd_iso(iso):
    d = _dt.fromisoformat(iso.replace("Z", "+00:00"))
    return swe.julday(d.year, d.month, d.day, d.hour + d.minute / 60 + d.second / 3600)


def test_sade_sati_periods(birth):
    _, b = birth
    out = _vedic.calculate(b, now=_dt(2026, 11, 13, tzinfo=_tz.utc))
    ss = out["sadeSati"]
    moon = next(g for g in out["grahas"] if g["id"] == "moon")
    assert ss["moonSign"] == moon["sign"]
    assert 2 <= len(ss["periods"]) <= 5  # Saturn's ~29.5-year cycle over 100 years
    swe.set_sid_mode(swe.SIDM_LAHIRI)
    flags = swe.FLG_SWIEPH | swe.FLG_SIDEREAL
    moon_idx = _vedic.SIGNS.index(ss["moonSign"])
    for p in ss["periods"]:
        years = (_jd_iso(p["end"]) - _jd_iso(p["start"])) / 365.25
        if not (p["startClipped"] or p["endClipped"]):
            assert 6.5 < years < 9.5, p  # about 7.5 years
            assert [x["phase"] for x in p["phases"]] == ["rising", "peak", "setting"]
        for ph in p["phases"]:
            # Saturn is in the phase sign just after its first entry and just before its last exit
            rel = {"rising": -1, "peak": 0, "setting": 1}[ph["phase"]]
            for jd in (_jd_iso(ph["start"]) + 0.01, _jd_iso(ph["end"]) - 0.01):
                sat = int(swe.calc_ut(jd, swe.SATURN, flags)[0][0] // 30)
                assert _vedic.SIGNS[sat] == ph["sign"]
                assert (sat - moon_idx + 6) % 12 - 6 == rel
        starts = [_jd_iso(x["start"]) for x in p["phases"]]
        assert starts == sorted(starts)


def test_saturn_sign_changes_are_exact():
    swe.set_sid_mode(swe.SIDM_LAHIRI)
    flags = swe.FLG_SWIEPH | swe.FLG_SIDEREAL
    start = swe.julday(2000, 1, 1, 0)
    changes = _vedic.saturn_sign_changes(start, start + 30 * 365.25)
    assert len(changes) >= 12  # a full circuit, plus retrograde re-entries
    for jd, sign in changes:
        assert int(swe.calc_ut(jd + 0.001, swe.SATURN, flags)[0][0] // 30) == sign
        assert int(swe.calc_ut(jd - 0.001, swe.SATURN, flags)[0][0] // 30) != sign


def test_saturn_speed_bound():
    start = swe.julday(1801, 1, 1, 0)
    fastest = max(abs(swe.calc_ut(start + d, swe.SATURN, swe.FLG_SWIEPH | swe.FLG_SPEED)[0][3]) for d in range(0, 598 * 365, 3))
    assert fastest < _vedic.SATURN_SPEED_BOUND * 0.95
