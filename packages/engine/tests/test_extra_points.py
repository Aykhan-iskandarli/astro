"""Extra points: asteroids and Vertex against raw Swiss Ephemeris; fixed stars against an independent
J2000 catalogue position precessed to the date."""
import swisseph as swe

import libephemeris
from astra_engine import MODULES
from astra_engine.common.birth import resolve_utc
from astra_engine.sky.common import jd_of
from astra_engine.western import extra_points
from conftest import BIRTHS

BIRTH = BIRTHS["baku-1990"]


def _sep(a, b):
    d = abs(a - b) % 360
    return min(d, 360 - d)


def _jd():
    return jd_of(resolve_utc(BIRTH.date, BIRTH.time, BIRTH.timezone).utc)


def test_asteroids_and_vertex_match_swisseph():
    out = MODULES["western.natal"].calculate(BIRTH)["extras"]
    jd = _jd()
    for a in out["asteroids"]:
        xx, _ = swe.calc_ut(jd, extra_points.ASTEROIDS[a["id"]], swe.FLG_SWIEPH)
        assert _sep(a["longitude"], xx[0]) < 1 / 3600
    _, ascmc = swe.houses_ex(jd, BIRTH.latitude, BIRTH.longitude, b"P")  # Placidus here: same Vertex
    assert _sep(out["vertex"]["longitude"], ascmc[3]) < 1 / 3600
    # The Vertex always falls on the western side of the chart (houses 5-8) outside the polar regions
    assert 5 <= out["vertex"]["house"] <= 8


def test_fixed_star_positions_match_precessed_catalogue():
    jd = _jd()
    t = (jd - 2451545.0) / 36525  # Julian centuries from J2000
    eps2000 = 23.4392911
    catalogue = {s.name: s for s in libephemeris.list_fixed_stars()}
    for name in extra_points.STARS:
        star = catalogue[name]
        ra, dec = star.data.ra_j2000, star.data.dec_j2000
        # swe.cotrans: positive obliquity converts equatorial -> ecliptic
        lon2000, _, _ = swe.cotrans((ra, dec, 1.0), eps2000)
        # IAU 2006 general precession in longitude (arcsec), plus proper motion is negligible here
        precessed = lon2000 + (5028.796195 * t + 1.1054348 * t * t) / 3600
        # Nutation and aberration make the apparent position differ by well under 1'
        assert _sep(extra_points.star_longitude(name, jd), precessed) < 2 / 60, name


def test_star_conjunctions_respect_the_orb():
    out = MODULES["western.natal"].calculate(BIRTH)
    lon = {p["id"]: p["longitude"] for p in out["points"]}
    lon.update({a: out["angles"][a]["longitude"] for a in ("asc", "mc")})
    for s in out["extras"]["fixedStars"]:
        assert s["orb"] <= extra_points.STAR_ORB
        assert abs(_sep(s["longitude"], lon[s["point"]]) - s["orb"]) < 1e-3


def test_unknown_time_has_no_vertex():
    from datetime import date
    from astra_engine import BirthData
    out = MODULES["western.natal"].calculate(BirthData(date=date(1990, 6, 15), latitude=40.4, longitude=49.87,
                                                       timezone="Asia/Baku"))
    assert out["extras"]["vertex"] is None and len(out["extras"]["asteroids"]) == 4
    assert all(s["point"] != "moon" for s in out["extras"]["fixedStars"])
