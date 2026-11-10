"""Download GeoNames (CC BY 4.0) and build a compact offline city index.

Usage: python scripts/build_cities.py --out /data/cities.json
Source: https://download.geonames.org/export/dump/ — cities5000, admin1CodesASCII, countryInfo.
"""
import argparse
import io
import json
import urllib.request
import zipfile

BASE = "https://download.geonames.org/export/dump/"


def fetch(name: str) -> bytes:
    with urllib.request.urlopen(BASE + name, timeout=120) as r:  # noqa: S310 - fixed https URL
        return r.read()


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--out", required=True)
    ap.add_argument("--dataset", default="cities5000")
    args = ap.parse_args()

    countries = {}
    for line in fetch("countryInfo.txt").decode("utf-8").splitlines():
        if line and not line.startswith("#"):
            cols = line.split("\t")
            countries[cols[0]] = cols[4]

    admin1 = {}
    for line in fetch("admin1CodesASCII.txt").decode("utf-8").splitlines():
        cols = line.split("\t")
        if len(cols) >= 2:
            admin1[cols[0]] = cols[1]

    raw = zipfile.ZipFile(io.BytesIO(fetch(f"{args.dataset}.zip"))).read(f"{args.dataset}.txt").decode("utf-8")
    cities = []
    for line in raw.splitlines():
        c = line.split("\t")
        # geonameid, name, asciiname, alternatenames, lat, lng, fclass, fcode, cc, cc2, a1, a2, a3, a4,
        # population, elevation, dem, timezone, modified
        if len(c) < 19 or not c[17]:
            continue
        cities.append({
            "id": int(c[0]), "name": c[1], "ascii": c[2],
            "alt": [a for a in c[3].split(",") if a],
            "lat": float(c[4]), "lng": float(c[5]), "cc": c[8],
            "country": countries.get(c[8], c[8]), "admin1": admin1.get(f"{c[8]}.{c[10]}"),
            "pop": int(c[14] or 0), "tz": c[17],
        })
    with open(args.out, "w", encoding="utf-8") as f:
        json.dump({"source": f"GeoNames {args.dataset} (CC BY 4.0, geonames.org)", "cities": cities}, f,
                  ensure_ascii=False, separators=(",", ":"))
    print(f"wrote {len(cities)} cities to {args.out}")


if __name__ == "__main__":
    main()
