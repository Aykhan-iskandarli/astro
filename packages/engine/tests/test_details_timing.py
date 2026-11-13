from datetime import date

from astra_engine import MODULES
from astra_engine._backend import swe
from astra_engine.common.birth import resolve_utc
from astra_engine.common.zodiac import norm
from astra_engine.western import details, natal, timing

from conftest import BIRTHS


def _jd(b):
    u = resolve_utc(b.date, b.time, b.timezone).utc
    return swe.julday(u.year, u.month, u.day, u.hour + u.minute / 60 + u.second / 3600)


def test_registered():
    assert MODULES["western.details"] is details and MODULES["western.timing"] is timing


def test_declinations_and_out_of_bounds(birth):
    _, b = birth
    out = details.calculate(b)["declinations"]
    jd = _jd(b)
    for p in out["points"]:
        dec = swe.calc_ut(jd, details.BODIES[p["id"]], swe.FLG_SWIEPH | swe.FLG_EQUATORIAL)[0][1]
        assert abs(p["declination"] - dec) < 1e-3
        assert p["outOfBounds"] == (abs(dec) > out["obliquity"])
    assert 23.4 < out["obliquity"] < 23.5


def test_antiscia_formula_and_contacts(birth):
    _, b = birth
    out = details.calculate(b)["antiscia"]
    lons = {p["id"]: p["longitude"] for p in natal.calculate(b)["points"]}
    for m in out["points"]:
        assert abs(m["antiscion"]["longitude"] - norm(180 - lons[m["id"]])) < 1e-3
        assert abs(m["contra"]["longitude"] - norm(360 - lons[m["id"]])) < 1e-3
    for c in out["contacts"]:
        mirror = 180 - lons[c["a"]] if c["kind"] == "antiscion" else 360 - lons[c["a"]]
        assert abs((norm(mirror) - lons[c["b"]] + 180) % 360 - 180) <= details.ANTISCIA_ORB


def test_prenatal_eclipses_known_dates():
    out = details.calculate(BIRTHS["baku-1990"])["prenatalEclipses"]
    assert out["solar"]["at"].startswith("1990-01-26") and out["solar"]["type"] == "annular"
    assert out["lunar"]["at"].startswith("1990-02-09") and out["lunar"]["type"] == "total"


def test_prenatal_eclipses_precede_birth(birth):
    _, b = birth
    out = details.calculate(b)["prenatalEclipses"]
    birth_iso = resolve_utc(b.date, b.time, b.timezone).utc.isoformat()
    assert out["solar"]["at"] < birth_iso and out["lunar"]["at"] < birth_iso


def test_receptions_and_dominants_shape(birth):
    _, b = birth
    out = details.calculate(b)
    planets = {"sun", "moon", "mercury", "venus", "mars", "jupiter", "saturn", "uranus", "neptune", "pluto"}
    assert all(r["a"] in planets and r["b"] in planets and r["type"] in ("domicile", "exaltation") for r in out["receptions"])
    assert {p["id"] for p in out["dominants"]["planets"]} == planets
    assert out["dominants"]["planet"] in planets


def test_firdaria_sequence_follows_sect():
    day = timing.calculate(BIRTHS["baku-1990"], on=date(2026, 11, 13))["firdaria"]
    night = timing.calculate(BIRTHS["newyork-1975-night"], on=date(2026, 11, 13))["firdaria"]
    assert day["diurnal"] is True and day["periods"][0]["lord"] == "sun"
    assert night["diurnal"] is False and night["periods"][0]["lord"] == "moon"
    assert [p["lord"] for p in day["periods"][:9]] == ["sun", "venus", "mercury", "moon", "saturn", "jupiter", "mars",
                                                       "northNode", "southNode"]
    assert sum(p["years"] for p in day["periods"][:9]) == 75
    assert all(len(p["sub"]) == 7 for p in day["periods"][:7])  # the nodes have no sub-periods


def test_solar_arc_is_about_one_degree_a_year(birth):
    _, b = birth
    out = timing.calculate(b, on=date(2026, 11, 13))["solarArc"]
    age = (date(2026, 11, 13) - b.date).days / 365.2422
    assert abs(out["arc"] - age) < 0.1 * age + 1  # the Sun moves 0.95-1.02° a day
    natal_sun = next(p for p in natal.calculate(b)["points"] if p["id"] == "sun")["longitude"]
    directed_sun = next(p for p in out["points"] if p["id"] == "sun")["longitude"]
    assert abs(norm(directed_sun - natal_sun) - out["arc"]) < 1e-3
    assert all(a["orb"] <= timing.SOLAR_ARC_ORB for a in out["aspects"])


def test_zodiacal_releasing_needs_birth_time():
    out = timing.calculate(BIRTHS["baku-1990"], on=date(2026, 11, 13))
    assert [z["lot"] for z in out["zodiacalReleasing"]] == ["fortune", "spirit"]
    unknown = timing.calculate(BIRTHS["baku-1990"].model_copy(update={"time": None}), on=date(2026, 11, 13))
    assert unknown["zodiacalReleasing"] is None


def test_fixed_stars_known_position():
    out = details.calculate(BIRTHS["baku-1990"])["fixedStars"]
    regulus = next(s for s in out["stars"] if s["id"] == "regulus")
    assert regulus["sign"] == "leo" and regulus["degree"] == 29          # Regulus ~29°42' Leo in 1990
    assert len(out["stars"]) == len(details.FIXED_STARS)
    assert all(c["orb"] <= details.FIXED_STAR_ORB for c in out["contacts"])


def test_lots_follow_their_formulas(birth):
    _, b = birth
    chart = natal.calculate(b)
    p = {x["id"]: x["longitude"] for x in chart["points"]}
    asc, day = chart["angles"]["asc"]["longitude"], chart["sect"] == "day"
    fortune = asc + p["moon"] - p["sun"] if day else asc + p["sun"] - p["moon"]
    spirit = asc + p["sun"] - p["moon"] if day else asc + p["moon"] - p["sun"]
    lots = {x["id"]: x["longitude"] for x in details.calculate(b)["lots"]}
    eros = asc + p["venus"] - spirit if day else asc + spirit - p["venus"]
    nemesis = asc + fortune - p["saturn"] if day else asc + p["saturn"] - fortune
    assert abs((lots["eros"] - norm(eros) + 180) % 360 - 180) < 1e-3
    assert abs((lots["nemesis"] - norm(nemesis) + 180) % 360 - 180) < 1e-3
    # Our Fortune agrees with the natal chart's Part of Fortune
    pof = next(x for x in chart["points"] if x["id"] == "partOfFortune")["longitude"]
    assert abs((norm(fortune) - pof + 180) % 360 - 180) < 1 / 60


def test_harmonics():
    out = details.calculate(BIRTHS["baku-1990"])["harmonics"]
    sun = next(x for x in natal.calculate(BIRTHS["baku-1990"])["points"] if x["id"] == "sun")["longitude"]
    h7 = next(x for x in out["charts"]["7"]["points"] if x["id"] == "sun")["longitude"]
    assert abs(h7 - norm(sun * 7)) < 1e-3
    assert all(c["orb"] <= details.HARMONIC_ORB for c in out["charts"]["5"]["conjunctions"])


def test_lots_need_birth_time():
    assert details.calculate(BIRTHS["baku-1990"].model_copy(update={"time": None}))["lots"] is None


def test_davison_midpoint():
    from astra_engine.western import davison
    a, b = BIRTHS["baku-1990"], BIRTHS["london-2000"]
    moment, lat, lon = davison.midpoint(a, b)
    ua, ub = (resolve_utc(x.date, x.time, x.timezone).utc for x in (a, b))
    assert abs((moment - ua) - (ub - moment)).total_seconds() < 1
    assert abs(lat - (a.latitude + b.latitude) / 2) < 1e-9
    assert abs(lon - (a.longitude + b.longitude) / 2) < 1e-6        # both in the same hemisphere: plain mean
    # Across the antimeridian the shorter way round is used: 170°E and 170°W -> 180°
    east = a.model_copy(update={"longitude": 170.0})
    west = a.model_copy(update={"longitude": -170.0})
    assert abs(abs(davison.midpoint(east, west)[2]) - 180) < 1e-6
    out = davison.calculate(a, b)
    assert out["module"] == "western.davison" and len(out["points"]) == 15 and out["houses"]


def test_cartography_mc_line_is_where_the_planet_culminates():
    from astra_engine.western import cartography
    b = BIRTHS["baku-1990"]
    out = cartography.calculate(b)
    assert len(out["lines"]) == 40 and {l["type"] for l in out["lines"]} == {"mc", "ic", "asc", "dsc"}
    jd = _jd(b)
    gst = swe.sidtime(jd) * 15  # Greenwich sidereal time in degrees
    for pid, body in (("sun", swe.SUN), ("jupiter", swe.JUPITER)):
        ra = swe.calc_ut(jd, body, swe.FLG_SWIEPH | swe.FLG_EQUATORIAL)[0][0]
        mc = next(l for l in out["lines"] if l["planet"] == pid and l["type"] == "mc")
        lon = mc["points"][0][0]
        assert all(abs(p[0] - lon) < 1e-6 for p in mc["points"])          # a meridian
        assert abs(((gst + lon) - ra + 180) % 360 - 180) < 0.05           # local sidereal time = RA
        ic = next(l for l in out["lines"] if l["planet"] == pid and l["type"] == "ic")
        assert abs(abs(((ic["points"][0][0] - lon) + 180) % 360 - 180) - 180) < 1e-6
