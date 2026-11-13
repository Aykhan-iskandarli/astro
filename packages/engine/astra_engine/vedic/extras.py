"""Vedic extras on top of vedic.chart: divisional charts, classic yogas and Ashtakavarga.

- Divisional charts: D3 (Drekkana: same sign, 5th, 9th), D7 (Saptamsa: odd signs from the sign, even signs from the
  7th), D10 (Dasamsa: odd signs from the sign, even signs from the 9th), D12 (Dwadasamsa: from the sign). D9 is in
  vedic.chart.
- Yogas (whole-sign houses): Gaja Kesari (Jupiter in a kendra from the Moon), Budha-Aditya (Sun and Mercury in one
  sign), Chandra-Mangala (Moon and Mars in one sign), Mahapurusha (Mars/Mercury/Jupiter/Venus/Saturn own or exalted
  in a kendra from the lagna), Sunapha / Anapha / Durudhara (Mars–Saturn in the 2nd / 12th / both from the Moon),
  Kemadruma (none there), Vesi / Vasi / Ubhayachari (the same from the Sun), Adhi (Mercury, Jupiter and Venus all in
  the 6th–8th from the Moon).
- Ashtakavarga (needs the lagna): benefic-point tables of Brihat Parashara Hora Shastra, as tabulated in PyJHora
  (AGPL-3.0) const.ashtaka_varga_dict; bindu totals 48/49/39/54/56/52/39, Sarvashtakavarga 337.
"""
from __future__ import annotations

from . import chart

MODULE_ID = "vedic.extras"
MODULE_VERSION = "0.1.0"
SEVEN = ["sun", "moon", "mars", "mercury", "jupiter", "venus", "saturn"]
KENDRA = {1, 4, 7, 10}
MAHAPURUSHA = {"mars": "ruchaka", "mercury": "bhadra", "jupiter": "hamsa", "venus": "malavya", "saturn": "sasa"}
# ASHTAKAVARGA[target][source] = houses (1..12) counted from the source that give the target a benefic point.
# target/source order: Sun, Moon, Mars, Mercury, Jupiter, Venus, Saturn, Lagna.
ASHTAKAVARGA = {
    "sun": [[1, 2, 4, 7, 8, 9, 10, 11], [3, 6, 10, 11], [1, 2, 4, 7, 8, 9, 10, 11], [3, 5, 6, 9, 10, 11, 12],
            [5, 6, 9, 11], [6, 7, 12], [1, 2, 4, 7, 8, 9, 10, 11], [3, 4, 6, 10, 11, 12]],
    "moon": [[3, 6, 7, 8, 10, 11], [1, 3, 6, 7, 9, 10, 11], [2, 3, 5, 6, 10, 11], [1, 3, 4, 5, 7, 8, 10, 11],
             [1, 2, 4, 7, 8, 10, 11], [3, 4, 5, 7, 9, 10, 11], [3, 5, 6, 11], [3, 6, 10, 11]],
    "mars": [[3, 5, 6, 10, 11], [3, 6, 11], [1, 2, 4, 7, 8, 10, 11], [3, 5, 6, 11], [6, 10, 11, 12], [6, 8, 11, 12],
             [1, 4, 7, 8, 9, 10, 11], [1, 3, 6, 10, 11]],
    "mercury": [[5, 6, 9, 11, 12], [2, 4, 6, 8, 10, 11], [1, 2, 4, 7, 8, 9, 10, 11], [1, 3, 5, 6, 9, 10, 11, 12],
                [6, 8, 11, 12], [1, 2, 3, 4, 5, 8, 9, 11], [1, 2, 4, 7, 8, 9, 10, 11], [1, 2, 4, 6, 8, 10, 11]],
    "jupiter": [[1, 2, 3, 4, 7, 8, 9, 10, 11], [2, 5, 7, 9, 11], [1, 2, 4, 7, 8, 10, 11], [1, 2, 4, 5, 6, 9, 10, 11],
                [1, 2, 3, 4, 7, 8, 10, 11], [2, 5, 6, 9, 10, 11], [3, 5, 6, 12], [1, 2, 4, 5, 6, 7, 9, 10, 11]],
    "venus": [[8, 11, 12], [1, 2, 3, 4, 5, 8, 9, 11, 12], [3, 4, 6, 9, 11, 12], [3, 5, 6, 9, 11], [5, 8, 9, 10, 11],
              [1, 2, 3, 4, 5, 8, 9, 10, 11], [3, 4, 5, 8, 9, 10, 11], [1, 2, 3, 4, 5, 8, 9, 11]],
    "saturn": [[1, 2, 4, 7, 8, 10, 11], [3, 6, 11], [3, 5, 6, 10, 11, 12], [6, 8, 9, 10, 11, 12], [5, 6, 11, 12],
               [6, 11, 12], [3, 5, 6, 11], [1, 3, 4, 6, 10, 11]],
}


def _idx(sign: str) -> int:
    return chart.SIGNS.index(sign)


def divisional(lon: float) -> dict:
    sign, deg = int(lon % 360 // 30), lon % 30
    odd = sign % 2 == 0  # Aries (index 0) is an odd sign
    d3 = (sign + (0, 4, 8)[int(deg // 10)]) % 12
    d7 = ((sign if odd else sign + 6) + int(deg // (30 / 7))) % 12
    d10 = ((sign if odd else sign + 8) + int(deg // 3)) % 12
    d12 = (sign + int(deg // 2.5)) % 12
    return {"d3": chart.SIGNS[d3], "d7": chart.SIGNS[d7], "d10": chart.SIGNS[d10], "d12": chart.SIGNS[d12]}


def yogas(grahas: dict[str, dict], lagna_sign: int | None) -> list[dict]:
    sign = {g: _idx(p["sign"]) for g, p in grahas.items()}

    def house_from(ref: int, g: str) -> int:
        return (sign[g] - ref) % 12 + 1

    moon, sun = sign["moon"], sign["sun"]
    five = ["mars", "mercury", "jupiter", "venus", "saturn"]  # no luminaries, no nodes
    second_m = [g for g in five if house_from(moon, g) == 2]
    twelfth_m = [g for g in five if house_from(moon, g) == 12]
    second_s = [g for g in five if house_from(sun, g) == 2]
    twelfth_s = [g for g in five if house_from(sun, g) == 12]
    found = []

    def add(yid: str, planets: list[str]):
        found.append({"id": yid, "planets": planets})

    if house_from(moon, "jupiter") in KENDRA:
        add("gajaKesari", ["jupiter", "moon"])
    if sign["sun"] == sign["mercury"]:
        add("budhaAditya", ["sun", "mercury"])
    if sign["moon"] == sign["mars"]:
        add("chandraMangala", ["moon", "mars"])
    if lagna_sign is not None:
        for g, yid in MAHAPURUSHA.items():
            if grahas[g]["dignity"] in ("exalted", "own") and house_from(lagna_sign, g) in KENDRA:
                add(yid, [g])
    if second_m and twelfth_m:
        add("durudhara", second_m + twelfth_m)
    elif second_m:
        add("sunapha", second_m)
    elif twelfth_m:
        add("anapha", twelfth_m)
    else:
        add("kemadruma", ["moon"])
    if second_s and twelfth_s:
        add("ubhayachari", second_s + twelfth_s)
    elif second_s:
        add("vesi", second_s)
    elif twelfth_s:
        add("vasi", twelfth_s)
    if all(house_from(moon, g) in (6, 7, 8) for g in ("mercury", "jupiter", "venus")):
        add("adhi", ["mercury", "jupiter", "venus"])
    return found


def ashtakavarga(grahas: dict[str, dict], lagna_sign: int) -> dict:
    sources = [_idx(grahas[g]["sign"]) for g in SEVEN] + [lagna_sign]
    bav = {}
    for target, table in ASHTAKAVARGA.items():
        points = [0] * 12
        for src_sign, houses in zip(sources, table):
            for h in houses:
                points[(src_sign + h - 1) % 12] += 1
        bav[target] = points
    sav = [sum(bav[t][i] for t in bav) for i in range(12)]
    return {"signs": chart.SIGNS, "bav": bav, "sav": sav, "total": sum(sav)}


def calculate(vedic_chart: dict) -> dict:
    grahas = {g["id"]: g for g in vedic_chart["grahas"]}
    lagna_sign = _idx(vedic_chart["lagna"]["sign"]) if vedic_chart.get("lagna") else None
    return {
        "divisional": {g["id"]: divisional(g["longitude"]) for g in vedic_chart["grahas"]}
                      | ({"lagna": divisional(vedic_chart["lagna"]["longitude"])} if vedic_chart.get("lagna") else {}),
        "yogas": yogas(grahas, lagna_sign),
        "ashtakavarga": ashtakavarga(grahas, lagna_sign) if lagna_sign is not None else None,
    }


__all__ = ["calculate", "divisional", "yogas", "ashtakavarga", "MODULE_ID"]
