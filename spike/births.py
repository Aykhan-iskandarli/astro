"""Spike test births. Coordinates: city centres (GeoNames-style decimal degrees)."""

BIRTHS = [
    {"id": "baku-1990", "y": 1990, "m": 6, "d": 15, "h": 14, "mi": 30,
     "lat": 40.4093, "lng": 49.8671, "tz": "Asia/Baku", "expect_utc": "1990-06-15T09:30"},
    {"id": "london-2000", "y": 2000, "m": 1, "d": 1, "h": 12, "mi": 0,
     "lat": 51.5074, "lng": -0.1278, "tz": "Europe/London", "expect_utc": "2000-01-01T12:00"},
    # Southern hemisphere + southern-hemisphere DST (AEDT, UTC+11)
    {"id": "sydney-1985", "y": 1985, "m": 11, "d": 3, "h": 8, "mi": 15,
     "lat": -33.8688, "lng": 151.2093, "tz": "Australia/Sydney", "expect_utc": "1985-11-02T21:15"},
]

# Common point keys used in every output file
BODIES = ["Sun", "Moon", "Mercury", "Venus", "Mars", "Jupiter", "Saturn", "Uranus", "Neptune", "Pluto",
          "TrueNode", "MeanNode", "MeanLilith", "Chiron"]
HOUSE_SYSTEMS = {"P": "Placidus", "K": "Koch", "W": "WholeSign", "A": "Equal"}
