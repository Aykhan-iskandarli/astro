import {IElectionDay} from 'pages/natal-chart/models/electional.model';

/**
 * Traditional rules for choosing a day, applied to the facts the engine returns for each day. No score is invented:
 *  - a topic is carried by natal houses (the usual house topics), so the Moon passing through those houses is the time for it;
 *  - the Moon is void of course (no more major aspects before it leaves the sign): not a time to start things;
 *  - to begin something the Moon should be waxing, to finish or clear something it should be waning;
 *  - with Mercury retrograde, documents, agreements and journeys need extra care (money and travel topics).
 */
export type ElectionTopic = 'career' | 'money' | 'relationships' | 'travel' | 'home' | 'self';
export type ElectionMode = 'begin' | 'finish';
export type ElectionReason = 'phase' | 'void' | 'mercury';
export type ElectionState = 'good' | 'care' | 'none' | 'unknown';

export const TOPICS: ElectionTopic[] = ['career', 'money', 'relationships', 'travel', 'home', 'self'];

export const TOPIC_HOUSES: Record<ElectionTopic, number[]> = {
    career: [10, 6],
    money: [2, 8],
    relationships: [7, 5],
    travel: [3, 9],
    home: [4],
    self: [1],
};

const MERCURY_TOPICS: ElectionTopic[] = ['money', 'travel'];

export interface IInterval {
    from: number;
    to: number;
}

export interface IElectionWindow {
    house: number;
    from: string;
    to: string;
    free: IInterval[];
    /** Part of the window falls inside a void-of-course period. */
    void: boolean;
}

export interface IElectionVerdict {
    state: ElectionState;
    windows: IElectionWindow[];
    reasons: ElectionReason[];
}

const MIN_FREE_MS = 60_000;

const toInterval = (from: string, to: string): IInterval => ({from: new Date(from).getTime(), to: new Date(to).getTime()});

/** The parts of `window` not covered by any of `cuts` (parts shorter than a minute are dropped). */
export const subtract = (window: IInterval, cuts: IInterval[]): IInterval[] => {
    let parts: IInterval[] = [window];
    for (const cut of cuts) {
        parts = parts.flatMap((p) => {
            if (cut.to <= p.from || cut.from >= p.to) return [p];
            const out: IInterval[] = [];
            if (cut.from > p.from) out.push({from: p.from, to: cut.from});
            if (cut.to < p.to) out.push({from: cut.to, to: p.to});
            return out;
        });
    }
    return parts.filter((p) => p.to - p.from >= MIN_FREE_MS);
};

export const evaluateDay = (day: IElectionDay, topic: ElectionTopic, mode: ElectionMode): IElectionVerdict => {
    if (!day.houses) return {state: 'unknown', windows: [], reasons: []};
    const cuts = day.voidOfCourse.map((v) => toInterval(v.start, v.end));
    const houses = TOPIC_HOUSES[topic];
    const windows: IElectionWindow[] = day.houses.filter((h) => houses.includes(h.house)).map((h) => {
        const span = toInterval(h.from, h.to);
        const free = subtract(span, cuts);
        return {house: h.house, from: h.from, to: h.to, free, void: free.reduce((sum, p) => sum + p.to - p.from, 0) < span.to - span.from};
    });
    if (!windows.length) return {state: 'none', windows, reasons: []};

    const reasons: ElectionReason[] = [];
    if (mode === 'begin' ? !day.waxing : day.waxing) reasons.push('phase');
    if (windows.some((w) => w.void)) reasons.push('void');
    if (MERCURY_TOPICS.includes(topic) && day.retrograde.includes('mercury')) reasons.push('mercury');

    const anyFree = windows.some((w) => w.free.length > 0);
    const blocking = reasons.includes('phase') || reasons.includes('mercury') || !anyFree;
    return {state: blocking ? 'care' : 'good', windows, reasons};
};
