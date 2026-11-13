"""Vedic (Jyotish) chart: sidereal Lahiri positions, rashi chart (D1, whole-sign bhavas), nakshatras with
pada and lord, navamsa (D9), classical dignities and the Vimshottari dasha (mahadasha + antardasha).

Positions come straight from the Swiss Ephemeris in sidereal mode (SIDM_LAHIRI). Conventions:
- Rahu = mean lunar node (traditional), Ketu = Rahu + 180°;
- bhavas = whole signs from the lagna;
- Vimshottari year = 365.25 days (VIMSHOTTARI_YEAR_DAYS; some programs use 365.2425 or 360).
"""
from __future__ import annotations

from datetime import datetime, time, timedelta, timezone

from .._backend import swe
from ..common.birth import BirthData, resolve_utc

MODULE_ID = "vedic.chart"
MODULE_VERSION = "0.2.0"

SIGNS = ["aries", "taurus", "gemini", "cancer", "leo", "virgo",
         "libra", "scorpio", "sagittarius", "capricorn", "aquarius", "pisces"]
GRAHAS = [("sun", swe.SUN), ("moon", swe.MOON), ("mars", swe.MARS), ("mercury", swe.MERCURY),
          ("jupiter", swe.JUPITER), ("venus", swe.VENUS), ("saturn", swe.SATURN), ("rahu", swe.MEAN_NODE)]

NAKSHATRAS = ["ashwini", "bharani", "krittika", "rohini", "mrigashira", "ardra", "punarvasu", "pushya",
              "ashlesha", "magha", "purvaPhalguni", "uttaraPhalguni", "hasta", "chitra", "swati", "vishakha",
              "anuradha", "jyeshtha", "mula", "purvaAshadha", "uttaraAshadha", "shravana", "dhanishta",
              "shatabhisha", "purvaBhadrapada", "uttaraBhadrapada", "revati"]
NAK_SPAN = 360 / 27          # 13°20'
PADA_SPAN = NAK_SPAN / 4     # 3°20'

# Vimshottari order and years (sum = 120); nakshatra lords follow the same cycle from Ashwini
DASHA = [("ketu", 7), ("venus", 20), ("sun", 6), ("moon", 10), ("mars", 7), ("rahu", 18), ("jupiter", 16),
         ("saturn", 19), ("mercury", 17)]
DASHA_YEARS = dict(DASHA)
DASHA_ORDER = [lord for lord, _ in DASHA]
VIMSHOTTARI_YEAR_DAYS = 365.25

# Classical dignities (the seven visible grahas)
EXALTATION = {"sun": "aries", "moon": "taurus", "mars": "capricorn", "mercury": "virgo", "jupiter": "cancer",
              "venus": "pisces", "saturn": "libra"}
OWN = {"sun": {"leo"}, "moon": {"cancer"}, "mars": {"aries", "scorpio"}, "mercury": {"gemini", "virgo"},
       "jupiter": {"sagittarius", "pisces"}, "venus": {"taurus", "libra"}, "saturn": {"capricorn", "aquarius"}}

FLAGS = swe.FLG_SWIEPH | swe.FLG_SPEED | swe.FLG_SIDEREAL


def sign_of(lon: float) -> str:
    return SIGNS[int(lon % 360 // 30)]


def split(lon: float) -> tuple[int, int]:
    within = lon % 30
    total_min = int(within * 60 + 1e-7)
    return total_min // 60, total_min % 60


def _part(lon: float, parts: int) -> tuple[int, float]:
    """Index of a 360/parts segment and the fraction inside it. Multiplying first keeps exact boundaries
    exact (40° * 27 / 360 = 3.0, whereas 40 / 13.333… = 2.999…)."""
    x = (lon % 360) * parts / 360
    whole = int(x + 1e-9)  # tolerance only for picking the segment, not for the fraction
    return whole % parts, min(max(x - whole, 0.0), 1.0)


def nakshatra_of(lon: float) -> dict:
    idx, frac = _part(lon, 27)
    pada, _ = _part(lon, 108)
    return {"index": idx + 1, "id": NAKSHATRAS[idx], "pada": pada % 4 + 1,
            "lord": DASHA_ORDER[idx % 9], "fraction": frac}


def navamsa_sign(lon: float) -> str:
    """D9: the zodiac cut into 108 parts of 3°20', counted continuously from Aries."""
    idx, _ = _part(lon, 108)
    return SIGNS[idx % 12]


def dignity_of(graha: str, sign: str) -> str | None:
    if graha not in EXALTATION:
        return None
    if EXALTATION[graha] == sign:
        return "exalted"
    if SIGNS[(SIGNS.index(EXALTATION[graha]) + 6) % 12] == sign:
        return "debilitated"
    if sign in OWN[graha]:
        return "own"
    return None


def _years(n: float) -> timedelta:
    return timedelta(days=n * VIMSHOTTARI_YEAR_DAYS)


def vimshottari(moon_lon: float, birth_utc: datetime, now: datetime | None = None) -> dict:
    nak = nakshatra_of(moon_lon)
    first = nak["lord"]
    start_idx = DASHA_ORDER.index(first)
    balance_years = DASHA_YEARS[first] * (1 - nak["fraction"])
    # The first mahadasha began before birth: shift its start back by the elapsed part
    cursor = birth_utc - _years(DASHA_YEARS[first] - balance_years)
    now = now or datetime.now(timezone.utc)
    periods = []
    for k in range(9):
        lord = DASHA_ORDER[(start_idx + k) % 9]
        years = DASHA_YEARS[lord]
        start, end = cursor, cursor + _years(years)
        subs = []
        sub_cursor = start
        for j in range(9):
            sub_lord = DASHA_ORDER[(DASHA_ORDER.index(lord) + j) % 9]
            sub_years = years * DASHA_YEARS[sub_lord] / 120
            sub_end = sub_cursor + _years(sub_years)
            subs.append({"lord": sub_lord, "start": sub_cursor.date().isoformat(), "end": sub_end.date().isoformat(),
                         "years": round(sub_years, 4), "current": sub_cursor <= now < sub_end})
            sub_cursor = sub_end
        periods.append({"lord": lord, "start": start.date().isoformat(), "end": end.date().isoformat(),
                        "years": years, "current": start <= now < end, "antardashas": subs})
        cursor = end
    return {"startLord": first, "balanceYears": round(balance_years, 4), "yearDays": VIMSHOTTARI_YEAR_DAYS,
            "mahadashas": periods}


def _point(pid: str, lon: float, speed: float | None, lagna_sign: int | None) -> dict:
    d, m = split(lon)
    sign = sign_of(lon)
    return {
        "id": pid, "longitude": round(lon % 360, 6), "sign": sign, "degree": d, "minute": m,
        "house": None if lagna_sign is None else (SIGNS.index(sign) - lagna_sign) % 12 + 1,
        "retrograde": speed is not None and speed < 0 and pid not in ("rahu", "ketu"),
        "nakshatra": nakshatra_of(lon), "navamsa": navamsa_sign(lon), "dignity": dignity_of(pid, sign),
    }


def calculate(birth: BirthData, now: datetime | None = None, **_options) -> dict:
    time_unknown = birth.time_unknown
    utc = resolve_utc(birth.date, birth.time or time(12, 0), birth.timezone).utc
    jd = swe.julday(utc.year, utc.month, utc.day, utc.hour + utc.minute / 60 + utc.second / 3600)
    swe.set_sid_mode(swe.SIDM_LAHIRI)
    ayanamsa = swe.get_ayanamsa_ut(jd)

    lagna = None
    if not time_unknown:
        _, ascmc = swe.houses_ex(jd, birth.latitude, birth.longitude, b"W", swe.FLG_SIDEREAL)
        lagna = ascmc[0]
    lagna_sign = SIGNS.index(sign_of(lagna)) if lagna is not None else None

    grahas = []
    for pid, sid in GRAHAS:
        xx, _ = swe.calc_ut(jd, sid, FLAGS)
        grahas.append(_point(pid, xx[0], xx[3], lagna_sign))
    rahu = next(g for g in grahas if g["id"] == "rahu")
    grahas.append(_point("ketu", (rahu["longitude"] + 180) % 360, None, lagna_sign))

    moon = next(g for g in grahas if g["id"] == "moon")
    ref = now or datetime.now(timezone.utc)
    today_jd = swe.julday(ref.year, ref.month, ref.day, 12)
    result = {
        "module": MODULE_ID,
        "meta": {"engineVersion": MODULE_VERSION, "ayanamsaName": "lahiri", "node": "mean",
                 "houses": "wholeSign", "timeUnknown": time_unknown},
        "ayanamsa": round(ayanamsa, 6),
        "lagna": _point("lagna", lagna, None, lagna_sign) if lagna is not None else None,
        "grahas": grahas,
        "dasha": vimshottari(moon["longitude"], utc, now),
        "sadeSati": sade_sati(SIGNS.index(moon["sign"]), jd, today_jd),
    }
    from . import extras  # divisional charts, yogas, ashtakavarga (imports this module)
    result["extras"] = extras.calculate(result)
    return result


# --- Sade Sati -------------------------------------------------------------------------------------------------
# The ~7.5 years while sidereal Saturn transits the sign before the natal Moon sign (rising), the Moon sign (peak)
# and the sign after it (setting). A retrograde step back out of the window that lasts less than MERGE_GAP_DAYS
# does not end the period.
SADE_SATI_HORIZON_YEARS = 100
SADE_SATI_MERGE_GAP_DAYS = 400
SATURN_SPEED_BOUND = 0.17  # °/day, above Saturn's fastest geocentric motion (see tests)
PHASES = {-1: "rising", 0: "peak", 1: "setting"}


def _saturn_sid(jd: float) -> float:
    return swe.calc_ut(jd, swe.SATURN, FLAGS)[0][0]


def saturn_sign_changes(start_jd: float, end_jd: float) -> list[tuple[float, int]]:
    """[(jd, new sign index)] for every sidereal sign change of Saturn, refined to well under a minute."""
    changes = []
    a = start_jd
    sa = int(_saturn_sid(a) // 30)
    while a < end_jd:
        lon = _saturn_sid(a)
        to_edge = min(lon % 30, 30 - lon % 30)
        b = min(a + max(1.0, (to_edge - 0.2) / SATURN_SPEED_BOUND), end_jd)
        sb = int(_saturn_sid(b) // 30)
        if sb != sa:
            lo, hi = a, b
            for _ in range(40):
                mid = (lo + hi) / 2
                if int(_saturn_sid(mid) // 30) == sa:
                    lo = mid
                else:
                    hi = mid
            changes.append((hi, sb))
        a, sa = b, sb
    return changes


def _iso_jd(jd: float) -> str:
    y, m, d, h = swe.revjul(jd)
    dt = datetime(y, m, d, tzinfo=timezone.utc) + timedelta(hours=h)
    return dt.replace(microsecond=0).isoformat().replace("+00:00", "Z")


def sade_sati(moon_sign: int, birth_jd: float, today_jd: float) -> dict:
    swe.set_sid_mode(swe.SIDM_LAHIRI)
    end_jd = min(birth_jd + SADE_SATI_HORIZON_YEARS * 365.25, swe.julday(2999, 12, 1, 0))
    # Timeline of (start jd, sign) segments
    segments = [(birth_jd, int(_saturn_sid(birth_jd) // 30))]
    segments += saturn_sign_changes(birth_jd, end_jd)
    bounds = [s[0] for s in segments[1:]] + [end_jd]
    window = []
    for (start, sign), stop in zip(segments, bounds):
        rel = (sign - moon_sign + 6) % 12 - 6  # -1, 0, 1 = rising, peak, setting
        if rel in PHASES:
            window.append({"start": start, "end": stop, "phase": PHASES[rel], "sign": SIGNS[sign]})
    periods: list[list[dict]] = []
    for seg in window:
        if periods and seg["start"] - periods[-1][-1]["end"] < SADE_SATI_MERGE_GAP_DAYS:
            periods[-1].append(seg)
        else:
            periods.append([seg])
    out = []
    for segs in periods:
        start, end = segs[0]["start"], segs[-1]["end"]
        # One entry per phase, from Saturn's first entry into that sign to its last exit. Retrograde loops make
        # neighbouring phases overlap; that is how Sade Sati tables are usually given.
        phases = []
        for name in ("rising", "peak", "setting"):
            mine = [seg for seg in segs if seg["phase"] == name]
            if mine:
                phases.append({"phase": name, "sign": mine[0]["sign"],
                               "start": min(x["start"] for x in mine), "end": max(x["end"] for x in mine)})
        out.append({
            "start": _iso_jd(start), "end": _iso_jd(end),
            "startClipped": start <= birth_jd, "endClipped": end >= end_jd,
            "status": "past" if end < today_jd else ("now" if start <= today_jd else "future"),
            "phases": [{"phase": p["phase"], "sign": p["sign"], "start": _iso_jd(p["start"]), "end": _iso_jd(p["end"])}
                       for p in phases],
        })
    return {"moonSign": SIGNS[moon_sign], "horizonYears": SADE_SATI_HORIZON_YEARS, "periods": out}
