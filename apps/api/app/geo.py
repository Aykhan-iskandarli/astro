"""Offline place search over the GeoNames index (prefix match, ranked by population)."""
from __future__ import annotations

import bisect
import json
import unicodedata
from functools import lru_cache

# Letters that NFKD does not decompose to ASCII
_SPECIAL = str.maketrans({"ə": "e", "Ə": "e", "ǝ": "e", "Ǝ": "e", "ı": "i", "ł": "l", "ø": "o", "đ": "d", "ß": "ss", "æ": "ae"})


def normalize(text: str) -> str:
    text = text.translate(_SPECIAL)
    text = unicodedata.normalize("NFKD", text)
    text = "".join(ch for ch in text if not unicodedata.combining(ch))
    return " ".join(text.casefold().replace("-", " ").replace("'", "").split())


class PlaceIndex:
    def __init__(self, cities: list[dict]):
        self.cities = cities
        keys: list[tuple[str, int]] = []
        self._raw: list[set[str]] = []
        for i, c in enumerate(cities):
            all_names = (c["name"], c["ascii"], *c.get("alt", []))
            self._raw.append({n.casefold() for n in all_names})
            keys.extend((n, i) for n in {normalize(n) for n in all_names} if n)
        keys.sort()
        self._keys = keys
        self._words = [k for k, _ in keys]

    def search(self, query: str, limit: int = 8) -> list[dict]:
        q = normalize(query)
        if len(q) < 2:
            return []
        start = bisect.bisect_left(self._words, q)
        raw = " ".join(query.casefold().split())
        hits: dict[int, int] = {}  # 0 = exact with diacritics, 1 = exact normalised, 2 = prefix
        for word, idx in self._keys[start:]:
            if not word.startswith(q):
                break
            tier = (0 if raw in self._raw[idx] else 1) if word == q else 2
            hits[idx] = min(hits.get(idx, 2), tier)
        ranked = sorted(hits, key=lambda i: (hits[i], -self.cities[i]["pop"]))
        return [self._public(self.cities[i]) for i in ranked[:limit]]

    @staticmethod
    def _public(c: dict) -> dict:
        return {"id": c["id"], "name": c["name"], "admin1": c.get("admin1"), "countryCode": c["cc"],
                "country": c["country"], "latitude": c["lat"], "longitude": c["lng"], "timezone": c["tz"],
                "population": c["pop"]}


@lru_cache(maxsize=1)
def load_index(path: str) -> PlaceIndex:
    with open(path, encoding="utf-8") as f:
        return PlaceIndex(json.load(f)["cities"])
