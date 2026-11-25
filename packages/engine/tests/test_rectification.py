"""Rectification: candidate birth times ranked against dated events, checked on a chart whose time is known."""
from datetime import date, datetime, time, timezone

import pytest

from astra_engine import MODULES
from astra_engine.common.birth import resolve_utc
from astra_engine.sky.common import jd_of, longitude
from conftest import BIRTHS

B = BIRTHS["baku-1990"]  # born 14:30 local
R = MODULES["western.rectification"]
ANGLE = {"conjunction": 0, "square": 90, "opposition": 180}


def _sep(a, b):
    d = abs((a - b) % 360)
    return min(d, 360 - d)


def _events():
    """Dates when a slow planet made a hard aspect to the true Ascendant or MC (from the transformations module)."""
    tr = MODULES["western.transformations"].calculate(B, start_year=2000, years=26)
    ev = [e for e in tr["episodes"] if e["natal"] in ("asc", "mc") and e["aspect"] in ANGLE]
    return sorted({date.fromisoformat(e["passes"][0]["at"][:10]) for e in ev})[:6]


def test_the_true_time_ranks_first():
    out = R.calculate(B, events=_events())
    best = datetime.strptime(out["top"][0]["time"], "%H:%M")
    assert abs((best - datetime(1900, 1, 1, 14, 30)).total_seconds()) <= 8 * 60
    assert out["top"][0]["events"] == 6
    assert len(out["curve"]) == 360  # every 4 minutes of the day


def test_the_options_are_separate_peaks():
    out = R.calculate(B, events=_events())
    mins = [int(c["time"][:2]) * 60 + int(c["time"][3:]) for c in out["top"]]
    assert all(abs(a - b) >= 20 for i, a in enumerate(mins) for b in mins[i + 1:])
    assert [c["score"] for c in out["top"]] == sorted((c["score"] for c in out["top"]), reverse=True)


def test_transit_hits_are_real_separations():
    out = R.calculate(B, events=_events())
    top = out["top"][0]
    t = datetime.strptime(top["time"], "%H:%M").time()
    import swisseph as swe
    jd = jd_of(resolve_utc(B.date, t, B.timezone).utc)
    _, ascmc = swe.houses_ex(jd, B.latitude, B.longitude, b"P")
    angles = {"asc": ascmc[0], "mc": ascmc[1]}
    events = [date.fromisoformat(e) for e in out["events"]]
    for h in (h for h in top["hits"] if h["kind"] == "transit"):
        ev = events[h["event"]]
        plon = longitude(h["from"], jd_of(datetime(ev.year, ev.month, ev.day, 12, tzinfo=timezone.utc)))[0]
        assert abs(_sep(plon, angles[h["to"]]) - ANGLE[h["aspect"]]) == pytest.approx(h["orb"], abs=0.01)
        assert h["orb"] <= 2.0


def test_window_limits_the_candidates():
    out = R.calculate(B, events=_events(), start=time(14, 0), end=time(15, 0))
    assert out["curve"][0]["time"] == "14:00" and out["curve"][-1]["time"] == "15:00" and len(out["curve"]) == 16


def test_validation():
    with pytest.raises(ValueError):
        R.calculate(B, events=[])
    with pytest.raises(ValueError):
        R.calculate(B, events=[date(1980, 1, 1)])
    with pytest.raises(ValueError):
        R.calculate(B, events=[date(2000, 1, 1)], start=time(12, 0), end=time(11, 0))
