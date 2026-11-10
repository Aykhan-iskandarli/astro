"""Reference values from raw pyswisseph (Swiss Ephemeris files, not Moshier)."""
import json
from datetime import datetime
from zoneinfo import ZoneInfo

import swisseph as swe

from births import BIRTHS, HOUSE_SYSTEMS

swe.set_ephe_path("/ephe")
FLAGS = swe.FLG_SWIEPH | swe.FLG_SPEED

IDS = {"Sun": swe.SUN, "Moon": swe.MOON, "Mercury": swe.MERCURY, "Venus": swe.VENUS, "Mars": swe.MARS,
       "Jupiter": swe.JUPITER, "Saturn": swe.SATURN, "Uranus": swe.URANUS, "Neptune": swe.NEPTUNE,
       "Pluto": swe.PLUTO, "TrueNode": swe.TRUE_NODE, "MeanNode": swe.MEAN_NODE,
       "MeanLilith": swe.MEAN_APOG, "Chiron": swe.CHIRON}

out = {}
for b in BIRTHS:
    local = datetime(b["y"], b["m"], b["d"], b["h"], b["mi"], tzinfo=ZoneInfo(b["tz"]))
    utc = local.astimezone(ZoneInfo("UTC"))
    jd = swe.julday(utc.year, utc.month, utc.day, utc.hour + utc.minute / 60)
    bodies = {}
    for name, pid in IDS.items():
        xx, retflag = swe.calc_ut(jd, pid, FLAGS)
        assert retflag & swe.FLG_SWIEPH, f"{name}: Swiss Ephemeris file not used (flag {retflag})"
        bodies[name] = {"lon": xx[0], "speed": xx[3]}
    houses = {}
    for code in HOUSE_SYSTEMS:
        cusps, ascmc = swe.houses_ex(jd, b["lat"], b["lng"], code.encode())
        houses[code] = {"cusps": list(cusps), "asc": ascmc[0], "mc": ascmc[1]}
    # Part of Fortune, sect-aware: day = ASC + Moon - Sun, night = ASC + Sun - Moon
    asc, sun, moon = houses["P"]["asc"], bodies["Sun"]["lon"], bodies["Moon"]["lon"]
    is_day = (sun - asc) % 360 > 180  # Sun above horizon = houses 7..12
    pof = (asc + moon - sun) % 360 if is_day else (asc + sun - moon) % 360
    bodies["PartOfFortune"] = {"lon": pof, "speed": None, "is_day": is_day}
    out[b["id"]] = {"utc": utc.strftime("%Y-%m-%dT%H:%M"), "expect_utc": b["expect_utc"], "jd": jd,
                    "bodies": bodies, "houses": houses}

print(json.dumps({"lib": "pyswisseph " + swe.version, "births": out}, indent=1))
