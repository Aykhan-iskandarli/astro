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
