"""Astra API: thin HTTP layer over astra_engine. Stateless — birth data is never stored or logged."""
from __future__ import annotations

import os
from datetime import date as Date, datetime as DateTime, time as Time, timezone as TimeZone
from typing import Literal

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, ConfigDict, Field, ValidationError
from pydantic.alias_generators import to_camel

from astra_engine import MODULES, SKY, BirthData
from astra_engine._backend import LIBRARY_VERSION
from astra_engine.chinese import bazi as bazi_module
from astra_engine.other import systems as other_systems
from astra_engine.vedic import match as vedic_match
from astra_engine.numerology import core as numerology_core

from .geo import load_index

CITIES_PATH = os.environ.get("ASTRA_CITIES_PATH", "/data/cities.json")
SOURCE_URL = os.environ.get("ASTRA_SOURCE_URL", "https://github.com/Aykhan-iskandarli/astro")  # AGPL §13

app = FastAPI(title="Astra API", version="0.1.0", docs_url="/api/docs", openapi_url="/api/openapi.json")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[o for o in os.environ.get("ASTRA_CORS_ORIGINS", "").split(",") if o],
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type"],
)


class NatalRequest(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)

    name: str | None = Field(default=None, max_length=80)
    date: Date
    time: Time | None = None
    latitude: float
    longitude: float
    timezone: str
    place: str | None = Field(default=None, max_length=160)
    house_system: Literal["P", "K", "W", "A"] = "P"


class TransitRequest(NatalRequest):
    at: DateTime | None = None  # ISO 8601; naive values are treated as UTC; default: now


class SynastryRequest(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)

    first: NatalRequest
    second: NatalRequest
    house_system: Literal["P", "K", "W", "A"] = "P"


def _birth(req: NatalRequest) -> BirthData:
    try:
        return BirthData(**req.model_dump(include={"name", "date", "time", "latitude", "longitude", "timezone",
                                                   "place"}))
    except ValidationError as e:
        raise HTTPException(status_code=422, detail=[err["msg"] for err in e.errors()]) from e


class BaziRequest(NatalRequest):
    gender: Literal["male", "female"] = "male"


class PlaceInput(BaseModel):
    latitude: float = Field(ge=-90, le=90)
    longitude: float = Field(ge=-180, le=180)
    timezone: str
    name: str | None = Field(default=None, max_length=160)


class ReturnRequest(NatalRequest):
    kind: Literal["solar", "lunar"] = "solar"
    year: int | None = Field(default=None, ge=1800, le=2998)
    after: Date | None = None
    relocate: PlaceInput | None = None


class ProgressionRequest(NatalRequest):
    target: DateTime | None = None


class TimelineRequest(NatalRequest):
    start: Date | None = None
    days: int = Field(default=365, ge=1, le=400)


class NumerologyRequest(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)

    full_name: str | None = Field(default=None, max_length=120)
    date: Date


class NumerologyPerson(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)

    full_name: str | None = Field(default=None, max_length=120)
    date: Date


class NumerologyCompatibilityRequest(BaseModel):
    first: NumerologyPerson
    second: NumerologyPerson


class NameAnalysisRequest(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)

    full_name: str = Field(min_length=1, max_length=120)
    date: Date | None = None


class ChineseCompatibilityRequest(BaseModel):
    first: Date
    second: Date


class GunaMilanRequest(BaseModel):
    groom: NatalRequest
    bride: NatalRequest


class OtherSystemsRequest(BaseModel):
    date: Date
    gender: Literal["male", "female"] = "male"


class CyclesRequest(NatalRequest):
    on: Date | None = None  # default: today


class DestinyMatrixRequest(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)

    name: str | None = Field(default=None, max_length=80)
    date: Date


@app.get("/api/health")
def health() -> dict:
    return {"status": "ok", "library": LIBRARY_VERSION, "modules": sorted(MODULES), "source": SOURCE_URL}


@app.get("/api/places")
def places(q: str = Query(min_length=2, max_length=80), limit: int = Query(8, ge=1, le=20)) -> list[dict]:
    return load_index(CITIES_PATH).search(q, limit)


@app.post("/api/charts/natal")
def natal_chart(req: NatalRequest) -> dict:
    try:
        birth = BirthData(**req.model_dump(exclude={"house_system"}))
    except ValidationError as e:
        raise HTTPException(status_code=422, detail=[err["msg"] for err in e.errors()]) from e
    return MODULES["western.natal"].calculate(birth, house_system=req.house_system)


@app.post("/api/charts/destiny-matrix")
def destiny_matrix(req: DestinyMatrixRequest) -> dict:
    # Only the birth date matters; place/time fields are filled with neutral values for BirthData
    try:
        birth = BirthData(name=req.name, date=req.date, latitude=0, longitude=0, timezone="UTC")
    except ValidationError as e:
        raise HTTPException(status_code=422, detail=[err["msg"] for err in e.errors()]) from e
    return MODULES["destiny.matrix"].calculate(birth)


@app.post("/api/charts/transits")
def transit_chart(req: TransitRequest) -> dict:
    at = req.at
    if at is not None and at.tzinfo is None:
        at = at.replace(tzinfo=TimeZone.utc)
    if at is not None and not 1800 <= at.year <= 2999:
        raise HTTPException(status_code=422, detail=["date must be between 1800 and 2999"])
    return MODULES["western.transits"].calculate(_birth(req), at=at, house_system=req.house_system)


@app.post("/api/charts/synastry")
def synastry_chart(req: SynastryRequest) -> dict:
    return MODULES["western.synastry"].calculate(_birth(req.first), _birth(req.second),
                                                 house_system=req.house_system)


@app.post("/api/charts/vedic")
def vedic_chart(req: NatalRequest) -> dict:
    return MODULES["vedic.chart"].calculate(_birth(req))


@app.post("/api/numerology")
def numerology(req: NumerologyRequest) -> dict:
    try:
        birth = BirthData(date=req.date, latitude=0, longitude=0, timezone="UTC")
    except ValidationError as e:
        raise HTTPException(status_code=422, detail=[err["msg"] for err in e.errors()]) from e
    return MODULES["numerology.core"].calculate(birth, full_name=req.full_name)


@app.post("/api/numerology/name")
def name_analysis(req: NameAnalysisRequest) -> dict:
    """Name analysis from the full name alone; the birth date is optional (adds life path and maturity)."""
    if req.date is not None and not 1800 <= req.date.year <= 2999:
        raise HTTPException(status_code=422, detail=["date must be between 1800 and 2999"])
    return numerology_core.name_analysis(req.full_name, req.date)


@app.post("/api/numerology/compatibility")
def numerology_compatibility(req: NumerologyCompatibilityRequest) -> dict:
    for p in (req.first, req.second):
        try:
            BirthData(date=p.date, latitude=0, longitude=0, timezone="UTC")
        except ValidationError as e:
            raise HTTPException(status_code=422, detail=[err["msg"] for err in e.errors()]) from e
    return numerology_core.compatibility((req.first.date, req.first.full_name), (req.second.date, req.second.full_name))


@app.post("/api/charts/cycles")
def life_cycles(req: CyclesRequest) -> dict:
    if req.on is not None and not 1800 <= req.on.year <= 2999:
        raise HTTPException(status_code=422, detail=["date must be between 1800 and 2999"])
    return MODULES["western.cycles"].calculate(_birth(req), on=req.on)


@app.post("/api/charts/bazi")
def bazi_chart(req: BaziRequest) -> dict:
    return MODULES["chinese.bazi"].calculate(_birth(req), gender=req.gender)


@app.post("/api/charts/returns")
def return_chart(req: ReturnRequest) -> dict:
    place = req.relocate.model_dump() if req.relocate else None
    if place:
        try:
            BirthData(date=req.date, latitude=place["latitude"], longitude=place["longitude"], timezone=place["timezone"])
        except ValidationError as e:
            raise HTTPException(status_code=422, detail=[err["msg"] for err in e.errors()]) from e
    return MODULES["western.returns"].calculate(_birth(req), kind=req.kind, year=req.year, after=req.after,
                                                place=place, house_system=req.house_system)


@app.post("/api/charts/progressions")
def progression_chart(req: ProgressionRequest) -> dict:
    target = req.target
    if target is not None and target.tzinfo is None:
        target = target.replace(tzinfo=TimeZone.utc)
    if target is not None and not 1800 <= target.year <= 2999:
        raise HTTPException(status_code=422, detail=["date must be between 1800 and 2999"])
    return MODULES["western.progressions"].calculate(_birth(req), target=target, house_system=req.house_system)


@app.post("/api/charts/composite")
def composite_chart(req: SynastryRequest) -> dict:
    return MODULES["western.composite"].calculate(_birth(req.first), _birth(req.second),
                                                  house_system=req.house_system)


def _utc(at: DateTime | None) -> DateTime | None:
    if at is not None and at.tzinfo is None:
        at = at.replace(tzinfo=TimeZone.utc)
    if at is not None and not 1800 <= at.year <= 2999:
        raise HTTPException(status_code=422, detail=["date must be between 1800 and 2999"])
    return at


@app.get("/api/sky")
def sky_now(at: DateTime | None = None) -> dict:
    """The sky at a moment (default: now). Not personal: no birth data involved."""
    return SKY["sky.now"].calculate(_utc(at))


@app.get("/api/sky/calendar")
def sky_calendar(start: Date, end: Date) -> dict:
    if not (1800 <= start.year and end.year <= 2999):
        raise HTTPException(status_code=422, detail=["date must be between 1800 and 2999"])
    try:
        return SKY["sky.calendar"].calculate(start, end)
    except ValueError as e:
        raise HTTPException(status_code=422, detail=[str(e)]) from e


@app.get("/api/sky/moon")
def sky_moon(start: Date, end: Date, lat: float = Query(ge=-90, le=90), lon: float = Query(ge=-180, le=180),
             tz: str = Query(max_length=64)) -> dict:
    """Moon calendar for a place: lunar days (from moonrise), Moon sign, phase, void-of-course periods."""
    if not (1800 <= start.year and end.year <= 2999):
        raise HTTPException(status_code=422, detail=["date must be between 1800 and 2999"])
    try:
        BirthData(date=start, latitude=lat, longitude=lon, timezone=tz)  # validates the IANA zone
        return SKY["sky.moon"].calculate(start, end, lat, lon, tz)
    except ValidationError as e:
        raise HTTPException(status_code=422, detail=[err["msg"] for err in e.errors()]) from e
    except ValueError as e:
        raise HTTPException(status_code=422, detail=[str(e)]) from e


@app.post("/api/chinese/compatibility")
def chinese_compatibility(req: ChineseCompatibilityRequest) -> dict:
    for d in (req.first, req.second):
        if not 1800 <= d.year <= 2999:
            raise HTTPException(status_code=422, detail=["date must be between 1800 and 2999"])
    return bazi_module.compatibility(req.first, req.second)


@app.post("/api/charts/details")
def chart_details(req: NatalRequest) -> dict:
    """Declinations, antiscia, mutual receptions, dominants and prenatal eclipses."""
    return MODULES["western.details"].calculate(_birth(req))


@app.post("/api/charts/timing")
def chart_timing(req: CyclesRequest) -> dict:
    """Firdaria, zodiacal releasing and solar arc directions (for the date 'on', default today)."""
    if req.on is not None and not 1800 <= req.on.year <= 2999:
        raise HTTPException(status_code=422, detail=["date must be between 1800 and 2999"])
    return MODULES["western.timing"].calculate(_birth(req), on=req.on)


@app.post("/api/charts/cartography")
def cartography(req: NatalRequest) -> dict:
    return MODULES["western.cartography"].calculate(_birth(req))


@app.post("/api/charts/davison")
def davison_chart(req: SynastryRequest) -> dict:
    return MODULES["western.davison"].calculate(_birth(req.first), _birth(req.second), house_system=req.house_system)


@app.post("/api/charts/guna-milan")
def guna_milan(req: GunaMilanRequest) -> dict:
    return vedic_match.calculate(_birth(req.groom), _birth(req.bride))


@app.post("/api/other")
def other(req: OtherSystemsRequest) -> dict:
    """Tarot birth cards, Maya Tzolkin and Kua number from the birth date."""
    if not 1800 <= req.date.year <= 2999:
        raise HTTPException(status_code=422, detail=["date must be between 1800 and 2999"])
    return other_systems.calculate(req.date, req.gender)


@app.get("/api/sky/day")
def sky_day(date: Date, lat: float = Query(ge=-66, le=66), lon: float = Query(ge=-180, le=180),
            tz: str = Query(max_length=64)) -> dict:
    """Planetary hours and Panchang for a day at a place (needs a sunrise, so polar latitudes are excluded)."""
    if not 1800 <= date.year <= 2999:
        raise HTTPException(status_code=422, detail=["date must be between 1800 and 2999"])
    try:
        BirthData(date=date, latitude=lat, longitude=lon, timezone=tz)
    except ValidationError as e:
        raise HTTPException(status_code=422, detail=[err["msg"] for err in e.errors()]) from e
    return SKY["sky.day"].calculate(date, lat, lon, tz)


@app.post("/api/charts/timeline")
def transit_timeline(req: TimelineRequest) -> dict:
    if req.start is not None and not 1800 <= req.start.year <= 2998:
        raise HTTPException(status_code=422, detail=["date must be between 1800 and 2999"])
    return MODULES["western.timeline"].calculate(_birth(req), start=req.start, days=req.days,
                                                 house_system=req.house_system)
