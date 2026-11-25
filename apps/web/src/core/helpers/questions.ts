import {IEpisode} from 'pages/natal-chart/models/transformations.model';
import {SlowPlanetModel} from 'pages/natal-chart/models/forecast-year.model';
import {IProfectionYear} from 'pages/natal-chart/models/cycles.model';

/**
 * Answering a life question ("when is a good time for work?") from data the engine already returns: the long transits
 * (episodes), the slow planets' house ingresses and the profection years. Which points and houses belong to a question
 * is the traditional association only; nothing is scored beyond sorting, and every date comes from the engine.
 */
export type Topic = 'career' | 'money' | 'move' | 'study' | 'health';
export const TOPICS: Topic[] = ['career', 'money', 'move', 'study', 'health'];

export const TOPIC_MAP: Record<Topic, {points: string[]; houses: number[]}> = {
    career: {points: ['mc', 'sun', 'saturn'], houses: [10, 6]},
    money: {points: ['venus', 'jupiter'], houses: [2, 8]},
    move: {points: ['moon', 'mc'], houses: [4, 9]},  // the MC axis also carries the IC (home)
    study: {points: ['mercury', 'jupiter'], houses: [3, 9]},
    health: {points: ['sun', 'moon', 'mars', 'asc'], houses: [6, 1, 12]},
};

export type Tone = 'support' | 'challenge' | 'change';

/** Jupiter and the easy aspects support, Uranus changes, the hard aspects of Saturn, Neptune and Pluto test. */
export const toneOf = (transit: string, aspect: string): Tone => {
    if (transit === 'jupiter' || aspect === 'trine' || aspect === 'sextile') return 'support';
    if (transit === 'uranus') return 'change';
    return 'challenge';
};

const ORDER = ['pluto', 'neptune', 'uranus', 'saturn', 'jupiter'];
const t = (iso: string) => Date.parse(iso);

export interface IWindow {
    episode: IEpisode;
    tone: Tone;
    /** Exact passes inside the range */
    passes: string[];
}

/** Long transits to the question's points that run during [from, to), by start date (heavier planet first on a tie). */
export const topicWindows = (episodes: IEpisode[], topic: Topic, from: string, to: string): IWindow[] => {
    const points = TOPIC_MAP[topic].points;
    return episodes
        .filter((e) => points.includes(e.natal) && !e.sameBody && t(e.start) < t(to) && t(e.end) >= t(from))
        .map((e) => ({episode: e, tone: toneOf(e.transit, e.aspect), passes: e.passes.map((p) => p.at).filter((at) => t(at) >= t(from) && t(at) < t(to))}))
        .sort((a, b) => a.episode.start.localeCompare(b.episode.start) || ORDER.indexOf(a.episode.transit) - ORDER.indexOf(b.episode.transit));
};

export interface IIngress {
    planet: string;
    house: number;
    start: string;
    end: string | null;
}

/** A slow planet entering one of the question's houses during [from, to). */
export const topicIngresses = (planets: Record<string, SlowPlanetModel>, topic: Topic, from: string, to: string): IIngress[] => {
    const houses = TOPIC_MAP[topic].houses;
    const out: IIngress[] = [];
    Object.entries(planets).forEach(([planet, v]) => {
        (v.houses ?? []).forEach((s) => {
            if (s.region && houses.includes(s.region) && s.start && !s.startClipped && t(s.start) >= t(from) && t(s.start) < t(to)) {
                out.push({planet, house: s.region, start: s.start, end: s.endClipped ? null : s.end});
            }
        });
    });
    return out.sort((a, b) => a.start.localeCompare(b.start));
};

/** Profection years (the house of the year) that fall on the question's houses and overlap [from, to). */
export const topicProfections = (years: IProfectionYear[], topic: Topic, from: string, to: string): IProfectionYear[] => years
    .filter((y) => TOPIC_MAP[topic].houses.includes(y.house) && t(y.start) < t(to) && t(y.end) >= t(from));

/** The first supporting and the first challenging window, for the short answer at the top. */
export const firstOf = (windows: IWindow[], tone: Tone): IWindow | null => windows.find((w) => w.tone === tone) ?? null;
