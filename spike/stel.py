"""Stellium output."""
import json
import time
import warnings
from importlib.metadata import version

warnings.filterwarnings("ignore")
from stellium import ChartBuilder, ChartLocation  # noqa: E402
from stellium.components import ArabicPartsCalculator  # noqa: E402
from stellium.engines.houses import EqualHouses, KochHouses, PlacidusHouses, WholeSignHouses  # noqa: E402

from births import BIRTHS  # noqa: E402

SYSTEMS = {"P": ("Placidus", PlacidusHouses), "K": ("Koch", KochHouses),
           "W": ("Whole Sign", WholeSignHouses), "A": ("Equal", EqualHouses)}
NAMES = {"Sun": "Sun", "Moon": "Moon", "Mercury": "Mercury", "Venus": "Venus", "Mars": "Mars",
         "Jupiter": "Jupiter", "Saturn": "Saturn", "Uranus": "Uranus", "Neptune": "Neptune", "Pluto": "Pluto",
         "TrueNode": "True Node", "MeanNode": "Mean Node", "MeanLilith": "Mean Apogee", "Chiron": "Chiron",
         "PartOfFortune": "Part of Fortune"}

out, timings = {}, []
for b in BIRTHS:
    loc = ChartLocation(b["lat"], b["lng"], b["id"], b["tz"])
    t0 = time.perf_counter()
    c = (ChartBuilder.from_details({"year": b["y"], "month": b["m"], "day": b["d"], "hour": b["h"],
                                    "minute": b["mi"]}, loc)
         .with_house_systems([cls() for _, cls in SYSTEMS.values()])
         .add_component(ArabicPartsCalculator())
         .calculate())
    timings.append(time.perf_counter() - t0)
    res = {"utc": c.datetime.utc_datetime.strftime("%Y-%m-%dT%H:%M"), "bodies": {}, "houses": {}}
    for key, name in NAMES.items():
        try:
            o = c.get_object(name)
        except Exception:  # noqa: BLE001
            o = None
        res["bodies"][key] = None if o is None else {"lon": o.longitude, "speed": o.speed_longitude,
                                                     "retro": o.is_retrograde}
    for code, (name, _) in SYSTEMS.items():
        h = c.get_houses(name)
        res["houses"][code] = {"cusps": list(h.cusps), "asc": c.get_object("ASC").longitude,
                               "mc": c.get_object("MC").longitude}
    if b["id"] == "baku-1990":
        res["n_aspects"] = len(c.aspects)
        c.draw("/out/stellium.svg").save()
    out[b["id"]] = res

print(json.dumps({"lib": f"stellium {version('stellium')}", "avg_ms": 1000 * sum(timings) / len(timings),
                  "births": out}, indent=1, default=str))
