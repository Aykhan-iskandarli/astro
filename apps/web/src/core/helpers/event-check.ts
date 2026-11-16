import {IEpisode} from 'pages/natal-chart/models/transformations.model';
import {PLANET_ORDER} from './transformations';

/**
 * Looking back at a dated life event: which long transits, Solar Arc hits and progressions were exact within a window
 * around it. Nothing is scored or predicted; the contacts are listed by how close their exact date is. Which bodies are
 * "relevant" to an event type is the traditional association only (see CATEGORY_BODIES) and only reorders the list.
 */
export type EventCategory = 'marriage' | 'job' | 'move' | 'loss' | 'illness' | 'child' | 'success' | 'study' | 'other';
export const CATEGORIES: EventCategory[] = ['marriage', 'job', 'move', 'loss', 'illness', 'child', 'success', 'study', 'other'];

export const CATEGORY_BODIES: Record<EventCategory, string[]> = {
    marriage: ['venus', 'sun', 'moon', 'jupiter', 'saturn'],
    job: ['sun', 'mc', 'saturn', 'jupiter', 'mars'],
    move: ['moon', 'uranus', 'jupiter', 'saturn', 'mercury'],
    loss: ['saturn', 'pluto', 'moon', 'neptune'],
    illness: ['saturn', 'mars', 'neptune', 'pluto', 'sun'],
    child: ['jupiter', 'venus', 'moon', 'sun'],
    success: ['sun', 'jupiter', 'mc', 'venus'],
    study: ['mercury', 'jupiter', 'saturn', 'uranus'],
    other: [],
};

/** Windows, in days either side of the event. */
export const WINDOWS = {transit: 60, solarArc: 365, progressed: 180, ingress: 180};
export const MAX_SHOWN = 6;
export const MAX_EVENTS = 8;

const DAY = 86400000;
const stamp = (date: string) => Date.parse(`${date}T12:00:00Z`);

/** Signed days from the event to a moment (negative: before the event). */
export const offsetDays = (at: string, date: string) => Math.round((Date.parse(at) - stamp(date)) / DAY);

export interface IMatch<T> {
    item: T;
    days: number;
    relevant: boolean;
}

const rank = <T>(list: IMatch<T>[]) => [...list].sort((a, b) => Number(b.relevant) - Number(a.relevant) || Math.abs(a.days) - Math.abs(b.days));

/** Transit episodes exact within the window of the date, or running across it; `days` is the closest exact pass. */
export const transitMatches = (episodes: IEpisode[], date: string, category: EventCategory, window = WINDOWS.transit): IMatch<IEpisode>[] => {
    const bodies = CATEGORY_BODIES[category];
    const t = stamp(date);
    return rank(episodes.flatMap((e) => {
        const days = e.passes.map((p) => offsetDays(p.at, date)).sort((a, b) => Math.abs(a) - Math.abs(b))[0];
        const across = Date.parse(e.start) <= t && t <= Date.parse(e.end);
        if (days === undefined || (Math.abs(days) > window && !across)) return [];
        return [{item: e, days, relevant: bodies.includes(e.transit) || bodies.includes(e.natal)}];
    }));
};

/** Dated contacts (Solar Arc hits, progressed aspects, sign changes) within `window` days of the date. */
export const nearMatches = <T extends {at: string}>(items: T[], date: string, window: number, bodies: string[], bodiesOf: (item: T) => string[]): IMatch<T>[] => rank(
    items.flatMap((item) => {
        const days = offsetDays(item.at, date);
        return Math.abs(days) <= window ? [{item, days, relevant: bodiesOf(item).some((b) => bodies.includes(b))}] : [];
    }),
);

/** Heavier transiting planets first when two contacts are equally close (the same order the transformations page uses). */
export const heavier = (a: IEpisode, b: IEpisode) => PLANET_ORDER.indexOf(a.transit) - PLANET_ORDER.indexOf(b.transit);
