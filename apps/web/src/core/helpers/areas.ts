/**
 * Life areas (career, finances, health) read from a natal chart by the traditional method: the houses of the area, the
 * sign on each cusp, where the ruler of each cusp stands (house, sign, dignity) and which planets sit in it, plus the
 * condition of the planets that signify the area. Everything is counted from the chart; the texts are written separately.
 */
export interface IAreaPoint {
    id: string | null;
    sign: string | null;
    house: number | null;
    retrograde: boolean;
    dignity?: string | null;
    longitude?: number | null;
}

export interface IAreaRuler {
    id: string | null;
    sign: string | null;
    house: number | null;
    kind: 'traditional' | 'modern' | null;
}

export interface IAreaCusp {
    number: number | null;
    sign: string | null;
    longitude?: number | null;
    rulers: IAreaRuler[];
}

export interface IAreaChart {
    points: IAreaPoint[];
    houses: IAreaCusp[];
    timeUnknown: boolean;
}

export interface IAreaHouse {
    house: number;
    cuspSign: string | null;
    rulers: (IAreaRuler & {dignity: string | null; retrograde: boolean})[];
    occupants: string[];
}

const TEN = ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'pluto'];

/** The houses of an area as cusp sign, rulers with their condition, and the planets inside. Empty without a birth time. */
export const areaHouses = (chart: IAreaChart, houses: number[]): IAreaHouse[] => {
    if (chart.timeUnknown || !chart.houses.length) return [];
    return houses.map((n) => {
        const cusp = chart.houses.find((h) => h.number === n);
        return {
            house: n,
            cuspSign: cusp?.sign ?? null,
            rulers: (cusp?.rulers ?? []).map((r) => {
                const p = chart.points.find((x) => x.id === r.id);
                return {...r, dignity: p?.dignity ?? null, retrograde: p?.retrograde ?? false};
            }),
            occupants: chart.points.filter((p) => p.id && TEN.includes(p.id) && p.house === n).map((p) => p.id!),
        };
    });
};

/** Planets that signify an area: where they stand and how strong they are. */
export const significators = (chart: IAreaChart, ids: string[]) => ids.flatMap((id) => {
    const p = chart.points.find((x) => x.id === id);
    return p && p.sign ? [{id, sign: p.sign, house: chart.timeUnknown ? null : p.house, dignity: p.dignity ?? null, retrograde: p.retrograde}] : [];
});

const sep = (a: number, b: number) => {
    const d = Math.abs(a - b) % 360;
    return d > 180 ? 360 - d : d;
};

export const ASPECTS: Record<string, number> = {conjunction: 0, sextile: 60, square: 90, trine: 120, opposition: 180};
/** Orb in degrees within which a planet counts as touching a point such as the Midheaven. */
export const POINT_ORB = 5;

/** Planets in a major aspect to a chart point (the Midheaven, the Ascendant), closest first. */
export const aspectsToPoint = (points: IAreaPoint[], pointLongitude: number | null | undefined, orb = POINT_ORB) => {
    if (pointLongitude === null || pointLongitude === undefined) return [];
    return points.filter((p) => p.id && TEN.includes(p.id) && p.longitude !== null && p.longitude !== undefined).flatMap((p) => {
        const d = sep(p.longitude!, pointLongitude);
        const hit = Object.entries(ASPECTS).find(([, angle]) => Math.abs(d - angle) <= orb);
        return hit ? [{id: p.id!, aspect: hit[0], orb: Math.abs(d - hit[1])}] : [];
    }).sort((a, b) => a.orb - b.orb);
};
