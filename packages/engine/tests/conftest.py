from datetime import date, time

import pytest

from astra_engine import BirthData

BIRTHS = {
    "baku-1990": BirthData(date=date(1990, 6, 15), time=time(14, 30), latitude=40.4093, longitude=49.8671,
                           timezone="Asia/Baku", place="Baku"),
    "london-2000": BirthData(date=date(2000, 1, 1), time=time(12, 0), latitude=51.5074, longitude=-0.1278,
                             timezone="Europe/London"),
    "sydney-1985": BirthData(date=date(1985, 11, 3), time=time(8, 15), latitude=-33.8688, longitude=151.2093,
                             timezone="Australia/Sydney"),
    # Night birth: exercises the night Part of Fortune formula
    "newyork-1975-night": BirthData(date=date(1975, 3, 10), time=time(23, 40), latitude=40.7128,
                                    longitude=-74.0060, timezone="America/New_York"),
}


@pytest.fixture(params=list(BIRTHS), ids=list(BIRTHS))
def birth(request):
    return request.param, BIRTHS[request.param]
