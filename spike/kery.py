"""Kerykeion output. Backend chosen by KERYKEION_BACKEND env var."""
import json
import time
import warnings

warnings.filterwarnings("ignore")
from kerykeion import AstrologicalSubjectFactory, BACKEND_NAME, ChartDataFactory, ChartDrawer  # noqa: E402
from importlib.metadata import version  # noqa: E402

from births import BIRTHS, HOUSE_SYSTEMS  # noqa: E402

POINTS = {"Sun": "sun", "Moon": "moon", "Mercury": "mercury", "Venus": "venus", "Mars": "mars",
          "Jupiter": "jupiter", "Saturn": "saturn", "Uranus": "uranus", "Neptune": "neptune", "Pluto": "pluto",
          "TrueNode": "true_north_lunar_node", "MeanNode": "mean_north_lunar_node",
          "MeanLilith": "mean_lilith", "Chiron": "chiron", "PartOfFortune": "pars_fortunae"}
ACTIVE = ["Sun", "Moon", "Mercury", "Venus", "Mars", "Jupiter", "Saturn", "Uranus", "Neptune", "Pluto",
          "True_North_Lunar_Node", "Mean_North_Lunar_Node", "Mean_Lilith", "Chiron", "Pars_Fortunae",
          "Ascendant", "Medium_Coeli"]
HOUSE_ATTRS = ["first", "second", "third", "fourth", "fifth", "sixth", "seventh", "eighth", "ninth", "tenth",
               "eleventh", "twelfth"]

out, timings = {}, []
for b in BIRTHS:
    res = {"bodies": {}, "houses": {}}
    for code in HOUSE_SYSTEMS:
        t0 = time.perf_counter()
        s = AstrologicalSubjectFactory.from_birth_data(
            b["id"], b["y"], b["m"], b["d"], b["h"], b["mi"], lng=b["lng"], lat=b["lat"], tz_str=b["tz"],
            online=False, houses_system_identifier=code, active_points=ACTIVE)
        timings.append(time.perf_counter() - t0)
        res["houses"][code] = {"cusps": [getattr(s, f"{h}_house").abs_pos for h in HOUSE_ATTRS],
                               "asc": s.ascendant.abs_pos, "mc": s.medium_coeli.abs_pos}
        if code == "P":
            res["utc"] = s.iso_formatted_utc_datetime[:16]
            for key, attr in POINTS.items():
                p = getattr(s, attr)
                res["bodies"][key] = None if p is None else {"lon": p.abs_pos, "speed": p.speed,
                                                             "retro": p.retrograde, "house": p.house}
            if b["id"] == "baku-1990":
                data = ChartDataFactory.create_natal_chart_data(s)
                res["n_aspects"] = len(data.aspects)
                res["elements"] = data.element_distribution.model_dump()
                svg = ChartDrawer(chart_data=data, theme="dark").generate_svg_string()
                with open(f"/out/kerykeion-{BACKEND_NAME}.svg", "w", encoding="utf-8") as f:
                    f.write(svg)
    out[b["id"]] = res

print(json.dumps({"lib": f"kerykeion {version('kerykeion')} / {BACKEND_NAME}",
                  "avg_ms": 1000 * sum(timings) / len(timings), "births": out}, indent=1, default=str))
