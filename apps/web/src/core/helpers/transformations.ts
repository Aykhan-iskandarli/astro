import {IEpisode} from 'pages/natal-chart/models/transformations.model';

/** Heavier planets change life more, so they come first; no numeric score is invented. */
export const PLANET_ORDER = ['pluto', 'neptune', 'uranus', 'saturn', 'jupiter'];
export const ASPECT_ORDER = ['conjunction', 'opposition', 'square', 'trine', 'sextile'];

export type EpisodeGroup = 'cycle' | 'major' | 'other';

/** Contacts of a planet to itself are life cycles; the rest of Saturn-Pluto's hard aspects are the big changes. */
export const CYCLE_KEYS = [
    'saturn-conjunction', 'saturn-square', 'saturn-opposition', 'jupiter-conjunction', 'jupiter-opposition',
    'uranus-square', 'uranus-trine', 'uranus-opposition', 'neptune-square',
];

export const groupOf = (e: IEpisode): EpisodeGroup => {
    if (e.sameBody && CYCLE_KEYS.includes(`${e.transit}-${e.aspect}`)) return 'cycle';
    if (e.transit !== 'jupiter' && ['conjunction', 'square', 'opposition'].includes(e.aspect)) return 'major';
    return 'other';
};

/** The text key of a life cycle (planet to itself), or null. */
export const cycleKey = (e: IEpisode): string | null => (e.sameBody ? `${e.transit}-${e.aspect}` : null);

const yearRange = (year: number) => ({lo: Date.UTC(year, 0, 1), hi: Date.UTC(year + 1, 0, 1)});

export const activeIn = (e: IEpisode, year: number) => {
    const {lo, hi} = yearRange(year);
    return new Date(e.start).getTime() < hi && new Date(e.end).getTime() >= lo;
};

export const byImportance = (a: IEpisode, b: IEpisode) =>
    PLANET_ORDER.indexOf(a.transit) - PLANET_ORDER.indexOf(b.transit)
    || ASPECT_ORDER.indexOf(a.aspect) - ASPECT_ORDER.indexOf(b.aspect)
    || a.start.localeCompare(b.start);

/** Age in whole years at the start of a calendar year (birthday not considered beyond the year number). */
export const ageInYear = (birthYear: number, year: number) => year - birthYear;

/** The years window to request so that `year` has at least three years of margin on both sides. */
export const windowStart = (year: number) => Math.floor(year / 6) * 6 - 3;
export const WINDOW_YEARS = 12;
