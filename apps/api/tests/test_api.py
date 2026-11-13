from fastapi.testclient import TestClient

from app.geo import PlaceIndex, normalize
from app.main import app

client = TestClient(app)


def test_health_reports_swisseph():
    r = client.get("/api/health")
    assert r.status_code == 200
    assert "swisseph" in r.json()["library"]


def test_natal_end_to_end_baku():
    r = client.post("/api/charts/natal", json={"date": "1990-06-15", "time": "14:30", "latitude": 40.4093,
                                               "longitude": 49.8671, "timezone": "Asia/Baku",
                                               "houseSystem": "P"})
    assert r.status_code == 200
    body = r.json()
    assert body["input"]["utcDatetime"] == "1990-06-15T09:30:00Z"
    assert body["meta"]["houseSystem"] == "placidus"


def test_natal_time_unknown():
    r = client.post("/api/charts/natal", json={"date": "1990-06-15", "time": None, "latitude": 40.4,
                                               "longitude": 49.8, "timezone": "Asia/Baku"})
    assert r.status_code == 200 and r.json()["houses"] is None


def test_natal_validation_errors():
    base = {"date": "1990-06-15", "time": "14:30", "latitude": 40.4, "longitude": 49.8, "timezone": "Asia/Baku"}
    assert client.post("/api/charts/natal", json={**base, "date": "1700-01-01"}).status_code == 422
    assert client.post("/api/charts/natal", json={**base, "timezone": "Nope/Nope"}).status_code == 422
    assert client.post("/api/charts/natal", json={**base, "houseSystem": "Z"}).status_code == 422


def test_normalize_azerbaijani_letters():
    assert normalize("Gəncə") == "gence"
    assert normalize("Bakı") == "baki"
    assert normalize("Şəki") == "seki"


def test_place_index_prefix_and_ranking():
    idx = PlaceIndex([
        {"id": 1, "name": "Baku", "ascii": "Baku", "alt": ["Bakı", "Баку"], "lat": 40.4, "lng": 49.9, "cc": "AZ",
         "country": "Azerbaijan", "admin1": "Baku", "pop": 2_000_000, "tz": "Asia/Baku"},
        {"id": 2, "name": "Bakal", "ascii": "Bakal", "alt": [], "lat": 54.9, "lng": 58.8, "cc": "RU",
         "country": "Russia", "admin1": None, "pop": 20_000, "tz": "Asia/Yekaterinburg"},
    ])
    assert [p["id"] for p in idx.search("bak")] == [1, 2]
    assert idx.search("Bakı")[0]["timezone"] == "Asia/Baku"
    assert idx.search("баку")[0]["id"] == 1
    assert idx.search("b") == []


def test_exact_diacritic_match_ranks_first():
    idx = PlaceIndex([
        {"id": 1, "name": "Sekimachi", "ascii": "Sekimachi", "alt": ["Seki"], "lat": 0, "lng": 0, "cc": "JP",
         "country": "Japan", "admin1": None, "pop": 90_000, "tz": "Asia/Tokyo"},
        {"id": 2, "name": "Sheki", "ascii": "Sheki", "alt": ["Şəki"], "lat": 41.2, "lng": 47.2, "cc": "AZ",
         "country": "Azerbaijan", "admin1": None, "pop": 63_000, "tz": "Asia/Baku"},
    ])
    assert idx.search("şəki")[0]["id"] == 2
    assert idx.search("seki")[0]["id"] == 1  # no diacritics typed: population decides
    assert normalize("Gǝncǝ") == "gence"  # GeoNames sometimes uses U+01DD


def test_destiny_matrix_endpoint():
    r = client.post("/api/charts/destiny-matrix", json={"date": "1990-07-15"})
    assert r.status_code == 200
    body = r.json()
    assert body["points"]["E"] == 10 and body["purposes"]["spiritual"] == 12
    assert client.post("/api/charts/destiny-matrix", json={"date": "1700-01-01"}).status_code == 422


BAKU = {"date": "1990-06-15", "time": "14:30", "latitude": 40.4093, "longitude": 49.8671, "timezone": "Asia/Baku"}
LONDON = {"date": "2000-01-01", "time": "12:00", "latitude": 51.5074, "longitude": -0.1278, "timezone": "Europe/London"}


def test_transits_endpoint():
    r = client.post("/api/charts/transits", json={**BAKU, "at": "2026-11-10T09:00:00Z"})
    assert r.status_code == 200
    assert r.json()["at"] == "2026-11-10T09:00:00Z" and len(r.json()["points"]) == 12
    assert client.post("/api/charts/transits", json={**BAKU, "at": "3100-01-01T00:00:00"}).status_code == 422


def test_synastry_endpoint():
    r = client.post("/api/charts/synastry", json={"first": BAKU, "second": LONDON})
    assert r.status_code == 200
    body = r.json()
    assert body["score"]["value"] == sum(x["points"] for x in body["score"]["breakdown"])
    assert client.post("/api/charts/synastry", json={"first": BAKU, "second": {**LONDON, "timezone": "X/Y"}}).status_code == 422


def test_vedic_endpoint():
    r = client.post("/api/charts/vedic", json=BAKU)
    assert r.status_code == 200
    body = r.json()
    assert len(body["grahas"]) == 9 and body["lagna"] is not None
    assert len(body["dasha"]["mahadashas"]) == 9


def test_numerology_endpoint():
    r = client.post("/api/numerology", json={"date": "1990-06-15", "fullName": "John Smith"})
    assert r.status_code == 200
    body = r.json()
    assert body["lifePath"]["value"] == 4 and body["expression"]["value"] == 8


def test_bazi_endpoint():
    r = client.post("/api/charts/bazi", json={**BAKU, "gender": "female"})
    assert r.status_code == 200
    body = r.json()
    assert body["dayMaster"]["id"] and body["luck"]["forward"] is False
    assert client.post("/api/charts/bazi", json={**BAKU, "gender": "x"}).status_code == 422


def test_returns_endpoint():
    r = client.post("/api/charts/returns", json={**BAKU, "kind": "solar", "year": 2026})
    assert r.status_code == 200 and r.json()["at"].startswith("2026-06-1")
    r = client.post("/api/charts/returns", json={**BAKU, "kind": "lunar", "after": "2026-11-10",
                                                 "relocate": {"latitude": 51.5, "longitude": -0.1,
                                                              "timezone": "Europe/London", "name": "London"}})
    assert r.status_code == 200 and r.json()["meta"]["relocated"] is True
    assert client.post("/api/charts/returns", json={**BAKU, "relocate": {"latitude": 0, "longitude": 0,
                                                                         "timezone": "Bad/Zone"}}).status_code == 422


def test_progressions_endpoint():
    r = client.post("/api/charts/progressions", json={**BAKU, "target": "2026-11-10T00:00:00Z"})
    assert r.status_code == 200 and 36 < r.json()["ageYears"] < 37


def test_composite_endpoint():
    r = client.post("/api/charts/composite", json={"first": BAKU, "second": LONDON})
    assert r.status_code == 200 and len(r.json()["points"]) >= 14


def test_sky_endpoints():
    r = client.get("/api/sky", params={"at": "2026-11-10T12:00:00Z"})
    assert r.status_code == 200 and len(r.json()["points"]) == 12 and "voidOfCourse" in r.json()["moon"]
    r = client.get("/api/sky/calendar", params={"start": "2026-11-01", "end": "2027-01-01"})
    assert r.status_code == 200 and r.json()["lunations"]
    assert client.get("/api/sky/calendar", params={"start": "2026-01-01", "end": "2028-01-01"}).status_code == 422


def test_timeline_endpoint():
    body = {"date": "1990-06-15", "time": "14:30", "latitude": 40.4093, "longitude": 49.8671,
            "timezone": "Asia/Baku", "start": "2026-01-01", "days": 120}
    r = client.post("/api/charts/timeline", json=body)
    assert r.status_code == 200 and all("at" in e for e in r.json()["events"])
    assert client.post("/api/charts/timeline", json={**body, "days": 900}).status_code == 422


BAKU = {"date": "1990-06-15", "time": "14:30", "latitude": 40.4093, "longitude": 49.8671, "timezone": "Asia/Baku"}


def test_natal_extra_points():
    body = client.post("/api/charts/natal", json=BAKU).json()
    assert [p["id"] for p in body["extraPoints"]] == ["ceres", "pallas", "juno", "vesta", "vertex", "partOfSpirit", "selena"]
    assert all(p["id"] not in {"ceres", "vertex"} for p in body["points"])  # kept off the wheel and aspects


def test_cycles_endpoint():
    r = client.post("/api/charts/cycles", json={**BAKU, "on": "2026-11-13"})
    assert r.status_code == 200
    body = r.json()
    assert set(body["returns"]) == {"jupiter", "saturn", "chiron"}
    assert body["profections"]["current"]["age"] == 36
    assert client.post("/api/charts/cycles", json={**BAKU, "on": "1700-01-01"}).status_code == 422


def test_cycles_near_the_end_of_the_ephemeris():
    r = client.post("/api/charts/cycles", json={**BAKU, "date": "2950-01-01"})
    assert r.status_code == 200


def test_numerology_extensions_and_compatibility():
    body = client.post("/api/numerology", json={"date": "1990-06-15", "fullName": "Aysel"}).json()
    assert body["personalDay"]["value"] in range(1, 10)
    assert len(body["pinnacles"]) == 4
    r = client.post("/api/numerology/compatibility", json={"first": {"date": "1990-06-15", "fullName": "Aysel"},
                                                           "second": {"date": "1988-03-02", "fullName": "Orxan"}})
    assert r.status_code == 200
    assert [p["kind"] for p in r.json()["pairs"]] == ["lifePath", "expression", "soulUrge"]
    bad = {"first": {"date": "1700-01-01"}, "second": {"date": "1988-03-02"}}
    assert client.post("/api/numerology/compatibility", json=bad).status_code == 422


def test_moon_calendar_endpoint():
    r = client.get("/api/sky/moon", params={"start": "2026-11-01", "end": "2026-11-08", "lat": 40.4, "lon": 49.9,
                                             "tz": "Asia/Baku"})
    assert r.status_code == 200
    assert len(r.json()["days"]) == 7
    bad = {"start": "2026-11-01", "end": "2026-11-08", "lat": 40.4, "lon": 49.9}
    assert client.get("/api/sky/moon", params={**bad, "tz": "Nope/Nope"}).status_code == 422
    assert client.get("/api/sky/moon", params={**bad, "tz": "Asia/Baku", "end": "2027-11-08"}).status_code == 422


def test_chinese_compatibility_endpoint():
    r = client.post("/api/chinese/compatibility", json={"first": "1990-06-15", "second": "1988-03-02"})
    assert r.status_code == 200
    assert (r.json()["first"]["animal"], r.json()["second"]["animal"]) == ("horse", "dragon")


def test_vedic_has_sade_sati():
    body = client.post("/api/charts/vedic", json=BAKU).json()
    assert body["sadeSati"]["periods"]


def test_name_analysis_endpoint():
    r = client.post("/api/numerology/name", json={"fullName": "Aysel Məmmədova"})
    assert r.status_code == 200 and r.json()["expression"]["value"] == 9 and r.json()["lifePath"] is None
    r = client.post("/api/numerology/name", json={"fullName": "Aysel", "date": "1990-06-15"})
    assert r.json()["lifePath"]["value"] == 4
    assert client.post("/api/numerology/name", json={"fullName": ""}).status_code == 422


def test_details_timing_endpoints():
    d = client.post("/api/charts/details", json=BAKU).json()
    assert {"declinations", "antiscia", "receptions", "dominants", "prenatalEclipses"} <= set(d)
    t = client.post("/api/charts/timing", json={**BAKU, "on": "2026-11-13"}).json()
    assert t["firdaria"]["periods"] and t["solarArc"]["arc"] > 30


def test_guna_milan_other_and_day_endpoints():
    r = client.post("/api/charts/guna-milan", json={"groom": BAKU, "bride": {**BAKU, "date": "1992-03-08"}})
    assert r.status_code == 200 and r.json()["max"] == 36
    o = client.post("/api/other", json={"date": "1990-06-15", "gender": "female"}).json()
    assert o["kua"]["number"] == 8 and o["tarot"] == [4]
    day = client.get("/api/sky/day", params={"date": "2026-11-13", "lat": 40.4, "lon": 49.9, "tz": "Asia/Baku"})
    assert day.status_code == 200 and day.json()["dayRuler"] == "venus"
    assert client.get("/api/sky/day", params={"date": "2026-11-13", "lat": 80, "lon": 0, "tz": "UTC"}).status_code == 422


def test_davison_endpoint():
    r = client.post("/api/charts/davison", json={"first": BAKU, "second": {**BAKU, "date": "1992-03-08"}})
    assert r.status_code == 200 and r.json()["meta"]["davison"]["utc"].startswith("1991")


def test_cartography_endpoint():
    r = client.post("/api/charts/cartography", json=BAKU)
    assert r.status_code == 200 and len(r.json()["lines"]) == 40
