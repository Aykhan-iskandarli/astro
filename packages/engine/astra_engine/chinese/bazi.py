"""BaZi (Four Pillars of Destiny) on top of lunar_python (MIT, 6tail/lunar-python).

Time handling: solar-term boundaries (year and month pillars, luck-pillar start) are instants, and lunar_python
computes them in China Standard Time, so those pillars use the birth instant converted to UTC+8. The day and
hour pillars follow the local civil date and clock time at the birthplace (the common convention; no
true-solar-time correction). Ten gods are derived from the day master with the standard element rules.
"""
from __future__ import annotations

from datetime import time, timedelta, timezone

from lunar_python import Solar

from ..common.birth import BirthData, resolve_utc

MODULE_ID = "chinese.bazi"
MODULE_VERSION = "0.1.0"

STEMS = ["jia", "yi", "bing", "ding", "wu", "ji", "geng", "xin", "ren", "gui"]
STEM_CN = "甲乙丙丁戊己庚辛壬癸"
BRANCHES = ["zi", "chou", "yin", "mao", "chen", "si", "wu", "wei", "shen", "you", "xu", "hai"]
BRANCH_CN = "子丑寅卯辰巳午未申酉戌亥"
ANIMALS = ["rat", "ox", "tiger", "rabbit", "dragon", "snake", "horse", "goat", "monkey", "rooster", "dog", "pig"]
ELEMENTS = ["wood", "fire", "earth", "metal", "water"]
BRANCH_ELEMENT = ["water", "earth", "wood", "wood", "earth", "fire", "fire", "earth", "metal", "metal", "earth", "water"]
CST = timezone(timedelta(hours=8))


def stem_info(cn: str) -> dict:
    i = STEM_CN.index(cn)
    return {"id": STEMS[i], "char": cn, "element": ELEMENTS[i // 2], "yang": i % 2 == 0}


def branch_info(cn: str) -> dict:
    i = BRANCH_CN.index(cn)
    return {"id": BRANCHES[i], "char": cn, "element": BRANCH_ELEMENT[i], "yang": i % 2 == 0, "animal": ANIMALS[i]}


def ten_god(day_master: dict, other: dict) -> str:
    """Relation of a stem to the day master (standard production / control cycles)."""
    dm, ot = ELEMENTS.index(day_master["element"]), ELEMENTS.index(other["element"])
    same = day_master["yang"] == other["yang"]
    if dm == ot:
        return "friend" if same else "robWealth"
    if (dm + 1) % 5 == ot:            # day master produces it
        return "eatingGod" if same else "hurtingOfficer"
    if (dm + 2) % 5 == ot:            # day master controls it
        return "indirectWealth" if same else "directWealth"
    if (ot + 2) % 5 == dm:            # it controls the day master
        return "sevenKillings" if same else "directOfficer"
    return "indirectResource" if same else "directResource"  # it produces the day master


def _pillar(gan_zhi: str, hidden: list[str], day_master: dict | None) -> dict:
    stem, branch = stem_info(gan_zhi[0]), branch_info(gan_zhi[1])
    hidden_info = [stem_info(h) for h in hidden]
    return {
        "stem": stem, "branch": branch,
        "tenGod": ten_god(day_master, stem) if day_master else None,
        "hidden": [{**h, "tenGod": ten_god(day_master, h) if day_master else None} for h in hidden_info],
    }


def _eight_char(dt):
    return Solar.fromYmdHms(dt.year, dt.month, dt.day, dt.hour, dt.minute, dt.second).getLunar().getEightChar()


def calculate(birth: BirthData, gender: str = "male", **_options) -> dict:
    time_unknown = birth.time_unknown
    resolved = resolve_utc(birth.date, birth.time or time(12, 0), birth.timezone)
    local = resolved.local
    cst = resolved.utc.astimezone(CST)
    ec_local = _eight_char(local)
    ec_cst = _eight_char(cst)

    day_master = stem_info(ec_local.getDay()[0])
    pillars = {
        "year": _pillar(ec_cst.getYear(), ec_cst.getYearHideGan(), day_master),
        "month": _pillar(ec_cst.getMonth(), ec_cst.getMonthHideGan(), day_master),
        "day": _pillar(ec_local.getDay(), ec_local.getDayHideGan(), day_master),
        "hour": None if time_unknown else _pillar(ec_local.getTime(), ec_local.getTimeHideGan(), day_master),
    }
    pillars["day"]["tenGod"] = "dayMaster"

    counts = {e: 0 for e in ELEMENTS}
    for p in pillars.values():
        if p:
            counts[p["stem"]["element"]] += 1
            counts[p["branch"]["element"]] += 1

    yun = ec_cst.getYun(1 if gender == "male" else 0)
    luck = []
    for d in yun.getDaYun():
        gz = d.getGanZhi()
        if not gz:
            continue  # the years before the first luck pillar
        luck.append({"ganZhi": gz, "stem": stem_info(gz[0]), "branch": branch_info(gz[1]),
                     "tenGod": ten_god(day_master, stem_info(gz[0])),
                     "startYear": d.getStartYear(), "endYear": d.getEndYear(), "startAge": d.getStartAge()})

    return {
        "module": MODULE_ID,
        "meta": {"engineVersion": MODULE_VERSION, "library": "lunar_python 1.4.9 (MIT)",
                 "timeConvention": "solar terms in UTC+8, day/hour pillars in local civil time",
                 "timeUnknown": time_unknown, "gender": gender},
        "dayMaster": day_master,
        "pillars": pillars,
        "elements": counts,
        "animal": pillars["year"]["branch"]["animal"],
        "lunarDate": ec_local.getLunar().toString(),
        "luck": {"forward": yun.isForward(),
                 "start": {"years": yun.getStartYear(), "months": yun.getStartMonth(), "days": yun.getStartDay()},
                 "pillars": luck},
    }


# Zodiac compatibility between two year branches (classical relations; index = position in BRANCHES)
#   six harmonies (liu he): i + j = 1 (mod 12)      three harmonies (san he): same i mod 4
#   six clashes (liu chong): |i - j| = 6            six harms (liu hai): i + j = 7 (mod 12)
def branch_relation(i: int, j: int) -> str:
    if i == j:
        return "same"
    if (i + j) % 12 == 1:
        return "sixHarmony"
    if i % 4 == j % 4:
        return "threeHarmony"
    if abs(i - j) == 6:
        return "clash"
    if (i + j) % 12 == 7:
        return "harm"
    return "neutral"


def year_branch(d) -> dict:
    """Year branch of a birth date. The year changes at Lichun (start of spring, around 4 February); with no birth
    time the date is taken at noon China Standard Time, so a birth on the Lichun day itself may be ambiguous."""
    ec = Solar.fromYmdHms(d.year, d.month, d.day, 12, 0, 0).getLunar().getEightChar()
    return branch_info(ec.getYear()[1])


def compatibility(first, second) -> dict:
    a, b = year_branch(first), year_branch(second)
    return {
        "module": "chinese.compatibility",
        "meta": {"engineVersion": MODULE_VERSION, "yearStart": "lichun"},
        "first": {"date": first.isoformat(), **a},
        "second": {"date": second.isoformat(), **b},
        "relation": branch_relation(BRANCHES.index(a["id"]), BRANCHES.index(b["id"])),
    }
