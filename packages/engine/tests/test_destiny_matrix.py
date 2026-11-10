"""Golden tests from the published worked examples (see module docstring for sources)."""
from datetime import date

import pytest

from astra_engine import MODULES, BirthData
from astra_engine.destiny.matrix import calculate, compute_points, reduce22


def birth(d):
    return BirthData(date=d, latitude=0, longitude=0, timezone="UTC")


@pytest.mark.parametrize("n,expected", [(1, 1), (22, 22), (23, 5), (29, 11), (41, 5), (46, 10), (80, 8),
                                        (99, 18), (199, 19)])
def test_reduce22(n, expected):
    assert reduce22(n) == expected


def test_reduce_rejects_zero():
    with pytest.raises(ValueError):
        reduce22(0)


def test_example_15_07_1990_points():
    """gadalkindom.ru worked example, every published number."""
    p = compute_points(date(1990, 7, 15))
    expected = {
        "A": 15, "B": 7, "C": 19, "D": 5, "E": 10,
        "J": 7, "K": 17, "L": 11, "M": 15, "O": 22, "P": 6, "Q": 3, "N": 20, "S": 17, "T": 9,
        "F": 22, "G": 8, "H": 6, "I": 20, "L2": 11, "L1": 21,
        "F2": 6, "G2": 19, "H2": 17, "I2": 4, "F1": 10, "G1": 9, "H1": 5, "I1": 6,
        "R": 8, "R1": 5, "R2": 19,
    }
    assert {k: p[k] for k in expected} == expected


def test_example_15_07_1990_purposes_lines_health():
    out = calculate(birth(date(1990, 7, 15)))
    assert out["purposes"] == {"sky": 12, "earth": 7, "personal": 19, "male": 10, "female": 10,
                               "social": 20, "spiritual": 12}
    lines = out["lines"]
    assert lines["karmicTail"] == [15, 20, 5]
    assert lines["love"] == [15, 5, 8]
    assert lines["financeProgram"] == [19, 3, 11]
    assert lines["money"] == [11, 19, 8]
    assert lines["maleLine"] == [[22, 10, 6], [17, 5, 6]]
    assert lines["femaleLine"] == [[20, 6, 4], [19, 9, 8]]
    # Published pair sums per chakra and their total (80 -> 8)
    sums = [c["emotion"] for c in out["health"]["chakras"]]
    assert sums == [22, 10, 6, 8, 20, 8, 6]
    assert out["health"]["total"]["emotion"] == 8
    assert [(c["physical"], c["energy"]) for c in out["health"]["chakras"]] == [
        (15, 7), (22, 6), (7, 17), (17, 9), (10, 10), (11, 15), (19, 5)]


def test_example_28_11_1987_anchors():
    """matrixdestiny.io worked example (anchors and the four ancestral corners)."""
    p = compute_points(date(1987, 11, 28))
    assert (p["A"], p["B"], p["C"], p["D"], p["E"]) == (10, 11, 7, 10, 11)
    assert (p["F"], p["G"], p["H"], p["I"]) == (21, 18, 17, 20)


def test_age_timeline_shape():
    t = calculate(birth(date(1990, 7, 15)))["ageTimeline"]
    assert len(t) == 64
    assert t[0] == {"age": 0, "arcana": 15, "corner": "A"}
    assert t[8]["age"] == 10 and t[8]["corner"] == "F" and t[8]["arcana"] == 22
    assert t[16]["corner"] == "B" and t[16]["age"] == 20
    assert t[4]["arcana"] == reduce22(15 + 22)  # midpoint of the first sector = A + F
    assert all(1 <= x["arcana"] <= 22 for x in t)


def test_all_values_in_range_for_many_dates():
    d = date(1900, 1, 1)
    for offset in range(0, 365 * 120, 37):
        out = calculate(birth(date.fromordinal(d.toordinal() + offset)))
        assert all(1 <= v <= 22 for v in out["points"].values())


def test_registered_and_deterministic():
    assert MODULES["destiny.matrix"].calculate is calculate
    b = birth(date(2000, 1, 1))
    assert calculate(b) == calculate(b)
