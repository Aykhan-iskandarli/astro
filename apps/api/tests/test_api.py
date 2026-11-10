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
