"""Birth data input and local-time -> UTC resolution with historical DST (IANA tzdata)."""
from __future__ import annotations

from datetime import date, datetime, time, timedelta, timezone
from datetime import date as Date, time as Time
from typing import Literal
from zoneinfo import ZoneInfo, ZoneInfoNotFoundError

from pydantic import BaseModel, Field, field_validator

MIN_YEAR = 1800  # bundled Swiss Ephemeris files: sepl/semo_18 + _24 cover 1800-2999
MAX_YEAR = 2999

HouseSystem = Literal["P", "K", "W", "A"]  # Placidus, Koch, Whole Sign, Equal
DstNote = Literal["ambiguous", "nonexistent"]


class BirthData(BaseModel):
    name: str | None = Field(default=None, max_length=80)
    date: Date
    time: Time | None = None  # None = birth time unknown
    latitude: float = Field(ge=-90, le=90)
    longitude: float = Field(ge=-180, le=180)
    timezone: str
    place: str | None = Field(default=None, max_length=160)

    @field_validator("date")
    @classmethod
    def _in_range(cls, v: Date) -> Date:
        if not MIN_YEAR <= v.year <= MAX_YEAR:
            raise ValueError(f"date must be between {MIN_YEAR} and {MAX_YEAR}")
        return v

    @field_validator("timezone")
    @classmethod
    def _valid_tz(cls, v: str) -> str:
        try:
            ZoneInfo(v)
        except (ZoneInfoNotFoundError, ValueError) as e:
            raise ValueError(f"unknown IANA timezone: {v}") from e
        return v

    @property
    def time_unknown(self) -> bool:
        return self.time is None


class ResolvedTime(BaseModel):
    local: datetime
    utc: datetime
    utc_offset: str
    dst_note: DstNote | None = None


def _fmt_offset(td: timedelta) -> str:
    total = int(td.total_seconds())
    sign = "+" if total >= 0 else "-"
    total = abs(total)
    return f"{sign}{total // 3600:02d}:{(total % 3600) // 60:02d}"


def resolve_utc(d: date, t: time, tz_name: str) -> ResolvedTime:
    """Convert a wall-clock time to UTC.

    - ambiguous (clock set back, time occurs twice): the first occurrence is used (fold=0).
    - nonexistent (clock set forward, gap): the time is shifted forward by the gap, like most
      astrology software; both cases are reported in ``dst_note`` so the UI can warn.
    """
    tz = ZoneInfo(tz_name)
    naive = datetime.combine(d, t)
    first = naive.replace(tzinfo=tz, fold=0)
    second = naive.replace(tzinfo=tz, fold=1)
    note: DstNote | None = None
    local = first
    if first.utcoffset() != second.utcoffset():
        # Round-trip through UTC tells a gap (nonexistent) from an overlap (ambiguous).
        roundtrip = first.astimezone(timezone.utc).astimezone(tz)
        if roundtrip.replace(tzinfo=None) != naive:
            note = "nonexistent"
            local = roundtrip
        else:
            note = "ambiguous"
    utc = local.astimezone(timezone.utc)
    return ResolvedTime(local=local, utc=utc, utc_offset=_fmt_offset(local.utcoffset()), dst_note=note)
