"""Astra API: thin HTTP layer over astra_engine. Stateless — birth data is never stored or logged."""
from __future__ import annotations

import os
from datetime import date as Date, datetime as DateTime, time as Time, timezone as TimeZone
from typing import Literal

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, ConfigDict, Field, ValidationError
from pydantic.alias_generators import to_camel

from astra_engine import MODULES, BirthData
from astra_engine._backend import LIBRARY_VERSION

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
