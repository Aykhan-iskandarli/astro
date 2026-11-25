import {SegmentModel} from 'pages/natal-chart/models/forecast-year.model';

/**
 * A planet's natal-house stays inside one calendar month, cut from the dated segments the engine returned (the
 * crossings themselves are found in the engine). Months are counted in UTC like the rest of the year forecast.
 */
export interface IHouseStay {
    house: number;
    from: string;
    to: string;
    days: number;
}

const DAY = 86400000;

/** The segments overlapping the month (1-12) of the year, each cut to the month. */
export const staysInMonth = (segments: SegmentModel[], year: number, month: number): IHouseStay[] => {
    const lo = Date.UTC(year, month - 1, 1);
    const hi = Date.UTC(year, month, 1);
    return segments.flatMap((s) => {
        if (!s.region || !s.start || !s.end) return [];
        const a = Math.max(Date.parse(s.start), lo);
        const b = Math.min(Date.parse(s.end), hi);
        if (b - a < DAY / 24) return [];
        return [{house: s.region, from: new Date(a).toISOString(), to: new Date(b).toISOString(), days: Math.round((b - a) / DAY)}];
    });
};

/** The house the planet spends most of the month in (the earlier one on a tie). */
export const dominantHouse = (stays: IHouseStay[]): number | null => stays.reduce<IHouseStay | null>((best, s) => (!best || s.days > best.days ? s : best), null)?.house ?? null;

/** Items whose ISO date falls in the month (1-12), by the UTC month of the stamp. */
export const inMonth = <T extends {at: string | null}>(items: T[], month: number): T[] => items.filter((i) => !!i.at && Number(i.at.slice(5, 7)) === month);

/**
 * Smooths a wobble across a cusp: a segment shorter than `days` that sits between two segments of the same house is
 * folded into them (the true node and Chiron can touch a cusp, step back and return within days). Dates stay the engine's.
 */
export const foldShortDips = (segments: SegmentModel[], days = 30): SegmentModel[] => {
    const out: SegmentModel[] = [];
    for (let i = 0; i < segments.length; i++) {
        const s = segments[i];
        const prev = out[out.length - 1];
        const next = segments[i + 1];
        const short = s.start && s.end && Date.parse(s.end) - Date.parse(s.start) < days * DAY;
        if (prev && next && short && prev.region === next.region) {
            // skip the dip and let the next segment continue the previous one
            const merged = Object.assign(Object.create(Object.getPrototypeOf(prev)), prev, {end: next.end, endClipped: next.endClipped});
            out[out.length - 1] = merged;
            i++;
            continue;
        }
        if (prev && prev.region === s.region) {
            out[out.length - 1] = Object.assign(Object.create(Object.getPrototypeOf(prev)), prev, {end: s.end, endClipped: s.endClipped});
            continue;
        }
        out.push(s);
    }
    return out;
};
