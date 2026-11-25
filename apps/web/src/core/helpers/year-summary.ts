import {FirdariaPeriodModel, MonthModel, SlowPlanetModel} from 'pages/natal-chart/models/forecast-year.model';
import {TimelineEventModel} from 'pages/natal-chart/models/timeline.model';
import {PersonalLunationModel} from 'pages/sky/models/personal-moon.model';

/**
 * Picking the few things of a year worth reading first, from the year forecast the engine already returned. Nothing is
 * calculated astronomically here; the picks are ranked by a plain, traditional weight (slow planet to a personal point,
 * a hard aspect over an easy one) and ties go to the earlier date.
 */
export const SLOW = ['jupiter', 'saturn', 'uranus', 'neptune', 'pluto'];

const TRANSIT_WEIGHT: Record<string, number> = {saturn: 5, pluto: 5, uranus: 4, neptune: 3, jupiter: 3};
const NATAL_WEIGHT: Record<string, number> = {sun: 5, moon: 5, asc: 5, mc: 5, mercury: 3, venus: 3, mars: 3, jupiter: 2, saturn: 2};
const ASPECT_WEIGHT: Record<string, number> = {conjunction: 5, opposition: 4, square: 4, trine: 2, sextile: 2};

export const MAX_TRANSITS = 3;
export const MAX_HOUSE_CHANGES = 2;
export const MAX_ECLIPSES = 2;
export const MAX_MONTHS = 3;

const transitScore = (e: TimelineEventModel) => (TRANSIT_WEIGHT[e.transit ?? ''] ?? 0) * (NATAL_WEIGHT[e.natal ?? ''] ?? 1) * (ASPECT_WEIGHT[e.aspect ?? ''] ?? 1);

/** The heaviest slow-planet contacts of the year, one per (transit, natal, aspect), earliest exact date kept. */
export const topTransits = (events: TimelineEventModel[], limit = MAX_TRANSITS): TimelineEventModel[] => {
    const seen = new Set<string>();
    return events
        .filter((e) => SLOW.includes(e.transit ?? '') && e.at)
        .filter((e) => {
            const key = `${e.transit}-${e.natal}-${e.aspect}`;
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
        })
        .sort((a, b) => transitScore(b) - transitScore(a) || a.at!.localeCompare(b.at!))
        .slice(0, limit);
};

export interface IHouseChange {
    planet: string;
    from: number;
    to: number;
    at: string;
}

/** A slow planet crossing from one natal house into the next within the year. */
export const houseChanges = (planets: Record<string, SlowPlanetModel>, limit = MAX_HOUSE_CHANGES): IHouseChange[] => {
    const out: IHouseChange[] = [];
    for (const [planet, v] of Object.entries(planets)) {
        const segs = v.houses ?? [];
        for (let i = 1; i < segs.length; i++) {
            if (segs[i].region && segs[i - 1].region && segs[i].start) {
                out.push({planet, from: segs[i - 1].region!, to: segs[i].region!, at: segs[i].start!});
            }
        }
    }
    return out
        .sort((a, b) => (TRANSIT_WEIGHT[b.planet] ?? 0) - (TRANSIT_WEIGHT[a.planet] ?? 0) || a.at.localeCompare(b.at))
        .slice(0, limit);
};

/** The months with the most exact slow-planet aspects (as on the key-months chart), busiest first. */
export const busiestMonths = (months: MonthModel[], limit = MAX_MONTHS): number[] => [...months]
    .filter((m) => m.slowHits > 0)
    .sort((a, b) => b.slowHits - a.slowHits || a.month - b.month)
    .slice(0, limit)
    .map((m) => m.month);

/** The year's eclipses, those touching a natal point first, then by date. */
export const eclipsesOfYear = (lunations: PersonalLunationModel[], limit = MAX_ECLIPSES): PersonalLunationModel[] => lunations
    .filter((l) => !!l.eclipse)
    .sort((a, b) => Number(b.aspects.length > 0) - Number(a.aspects.length > 0) || (a.at ?? '').localeCompare(b.at ?? ''))
    .slice(0, limit)
    .sort((a, b) => (a.at ?? '').localeCompare(b.at ?? ''));

export interface ITimeLord {
    major: string;
    sub: string | null;
}

/** The firdaria ruler (and sub-ruler) in force in the middle of the year. */
export const timeLordAt = (periods: FirdariaPeriodModel[], year: number): ITimeLord | null => {
    const mid = `${year}-07-01`;
    const inside = (start: string | null, end: string | null) => !!start && !!end && start.slice(0, 10) <= mid && mid < end.slice(0, 10);
    const period = periods.find((p) => inside(p.start, p.end));
    if (!period?.lord) return null;
    const sub = period.sub.find((s) => inside(s.start, s.end));
    return {major: period.lord, sub: sub?.lord ?? null};
};
