from datetime import date, time

import pytest
from pydantic import ValidationError

from astra_engine import BirthData, resolve_utc


def test_baku_1990_is_utc_plus_5():
    r = resolve_utc(date(1990, 6, 15), time(14, 30), "Asia/Baku")
    assert r.utc.strftime("%Y-%m-%dT%H:%M") == "1990-06-15T09:30"
    assert r.utc_offset == "+05:00"
    assert r.dst_note is None


def test_ambiguous_time_uses_first_occurrence():
    # London, 2021-10-31 01:30 happens twice (BST then GMT)
    r = resolve_utc(date(2021, 10, 31), time(1, 30), "Europe/London")
    assert r.dst_note == "ambiguous"
    assert r.utc_offset == "+01:00"
    assert r.utc.strftime("%H:%M") == "00:30"


def test_nonexistent_time_shifts_forward():
    # London, 2021-03-28 01:30 does not exist (clocks jump 01:00 -> 02:00)
    r = resolve_utc(date(2021, 3, 28), time(1, 30), "Europe/London")
    assert r.dst_note == "nonexistent"
    assert r.local.strftime("%H:%M") == "02:30"
    assert r.utc.strftime("%H:%M") == "01:30"


def test_southern_hemisphere_dst():
    r = resolve_utc(date(1985, 11, 3), time(8, 15), "Australia/Sydney")
    assert r.utc_offset == "+11:00"


@pytest.mark.parametrize("year", [1799, 3000])
def test_out_of_ephemeris_range_rejected(year):
    with pytest.raises(ValidationError):
        BirthData(date=date(year, 1, 1), latitude=0, longitude=0, timezone="UTC")


def test_unknown_timezone_rejected():
    with pytest.raises(ValidationError):
        BirthData(date=date(2000, 1, 1), latitude=0, longitude=0, timezone="Mars/Olympus")


@pytest.mark.parametrize("lat,lng", [(91, 0), (0, 181)])
def test_coordinates_validated(lat, lng):
    with pytest.raises(ValidationError):
        BirthData(date=date(2000, 1, 1), latitude=lat, longitude=lng, timezone="UTC")
