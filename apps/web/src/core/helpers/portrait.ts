/**
 * The chart portrait: facts counted from a natal chart that an astrologer reads first. Nothing here is estimated;
 * where a convention is used (a half of the chart is "emphasised" with seven or more of the ten planets) it is named.
 */
export interface IPortraitPoint {
    id: string | null;
    sign: string | null;
    house: number | null;
    retrograde: boolean;
}

export interface IPortraitRuler {
    id: string | null;
    sign: string | null;
    house: number | null;
    kind: 'traditional' | 'modern' | null;
}

export interface IPortraitInput {
    points: IPortraitPoint[];
    firstHouseRulers: IPortraitRuler[];
    ascSign: string | null;
    sect: 'day' | 'night' | null;
    timeUnknown: boolean;
}

export type Half = 'upper' | 'lower' | 'east' | 'west';

export interface IPortrait {
    chartRuler: IPortraitRuler[];
    sect: 'day' | 'night' | null;
    halves: Record<Half, number> | null;
    emphasis: Half[];
    stelliumSigns: {sign: string; points: string[]}[];
    stelliumHouses: {house: number; points: string[]}[];
    retrogrades: string[];
    rulersOfBigThree: {id: string; of: string[]}[];
}

const TEN = ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'pluto'];
const RETRO = ['mercury', 'venus', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'pluto'];
export const EMPHASIS_MIN = 7;
export const STELLIUM_MIN = 3;

// Houses above the horizon are 7-12; the eastern half is 10, 11, 12, 1, 2, 3 (the quadrants beside the Ascendant)
const UPPER = [7, 8, 9, 10, 11, 12];
const EAST = [10, 11, 12, 1, 2, 3];

/** Traditional rulers of the signs (the seven visible planets). */
export const SIGN_RULER: Record<string, string> = {
    aries: 'mars', taurus: 'venus', gemini: 'mercury', cancer: 'moon', leo: 'sun', virgo: 'mercury', libra: 'venus',
    scorpio: 'mars', sagittarius: 'jupiter', capricorn: 'saturn', aquarius: 'saturn', pisces: 'jupiter',
};

export const buildPortrait = (chart: IPortraitInput): IPortrait => {
    const planets = chart.points.filter((p) => p.id && TEN.includes(p.id));
    const byId = (id: string) => chart.points.find((p) => p.id === id);

    let halves: Record<Half, number> | null = null;
    let emphasis: Half[] = [];
    if (!chart.timeUnknown) {
        const placed = planets.filter((p) => p.house);
        const count = (list: number[]) => placed.filter((p) => list.includes(p.house!)).length;
        halves = {upper: count(UPPER), lower: placed.length - count(UPPER), east: count(EAST), west: placed.length - count(EAST)};
        emphasis = (Object.keys(halves) as Half[]).filter((h) => halves![h] >= EMPHASIS_MIN);
    }

    const group = <K extends string | number>(key: (p: IPortraitPoint) => K | null) => {
        const map = new Map<K, string[]>();
        planets.forEach((p) => {
            const k = key(p);
            if (k !== null) map.set(k, [...(map.get(k) ?? []), p.id!]);
        });
        return [...map.entries()].filter(([, ids]) => ids.length >= STELLIUM_MIN);
    };

    // Which planet rules two or more of the Sun, Moon and Ascendant signs
    const bigThreeSigns: [string, string | null][] = [['sun', byId('sun')?.sign ?? null], ['moon', byId('moon')?.sign ?? null], ['asc', chart.timeUnknown ? null : chart.ascSign]];
    const ruled = new Map<string, string[]>();
    bigThreeSigns.forEach(([body, sign]) => {
        if (sign && SIGN_RULER[sign]) ruled.set(SIGN_RULER[sign], [...(ruled.get(SIGN_RULER[sign]) ?? []), body]);
    });

    return {
        chartRuler: chart.timeUnknown ? [] : chart.firstHouseRulers,
        sect: chart.timeUnknown ? null : chart.sect,
        halves,
        emphasis,
        stelliumSigns: group((p) => p.sign).map(([sign, points]) => ({sign, points})),
        stelliumHouses: chart.timeUnknown ? [] : group((p) => p.house).map(([house, points]) => ({house, points})),
        retrogrades: RETRO.filter((id) => byId(id)?.retrograde),
        rulersOfBigThree: [...ruled.entries()].filter(([, of]) => of.length >= 2).map(([id, of]) => ({id, of})),
    };
};
