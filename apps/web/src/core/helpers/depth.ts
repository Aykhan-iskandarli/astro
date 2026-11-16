/**
 * The deeper reading of a natal chart: facts counted from the planets' longitudes, signs and aspects. Where the
 * astrological literature has several conventions the one used is named in a constant here and shown on the page.
 */
import {SIGN_RULER} from './portrait';

export interface IDepthPoint {
    id: string | null;
    longitude: number | null;
    sign: string | null;
    degree: number | null;
    dignity?: string | null;
}

export interface IDepthAspect {
    p1: string | null;
    p2: string | null;
    type: string | null;
    orb: number | null;
    major?: boolean;
}

export const TEN = ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'pluto'];

const planetsOf = (points: IDepthPoint[]) => points.filter((p) => p.id && TEN.includes(p.id) && p.sign);

// ---- 1. Dispositors ---------------------------------------------------------------------------------------------

export interface IDispositors {
    /** planet -> the planet ruling the sign it stands in (traditional rulers) */
    next: Record<string, string>;
    /** planets that rule their own sign: the chain ends there */
    finals: string[];
    /** the single planet every chain ends in, when there is one */
    finalDispositor: string | null;
    /** mutual receptions: two planets, each in a sign ruled by the other */
    receptions: [string, string][];
    /** loops longer than two planets that no planet in own sign closes */
    loops: string[][];
}

export const dispositors = (points: IDepthPoint[]): IDispositors => {
    const planets = planetsOf(points);
    const next: Record<string, string> = {};
    planets.forEach((p) => {
        next[p.id!] = SIGN_RULER[p.sign!];
    });
    const finals = planets.filter((p) => next[p.id!] === p.id).map((p) => p.id!);

    const receptions: [string, string][] = [];
    planets.forEach((p) => {
        const a = p.id!;
        const b = next[a];
        if (b && b !== a && next[b] === a && a < b) receptions.push([a, b]);
    });

    // Follow each chain until it repeats; remember where it ended
    const ends = new Map<string, string>();
    const loops: string[][] = [];
    planets.forEach((p) => {
        const seen: string[] = [];
        let cur = p.id!;
        while (cur && !seen.includes(cur)) {
            seen.push(cur);
            cur = next[cur];
        }
        if (cur === undefined) return;
        const loop = seen.slice(seen.indexOf(cur));
        ends.set(p.id!, [...loop].sort().join('+'));
        if (loop.length > 2 && !loops.some((l) => [...l].sort().join('+') === [...loop].sort().join('+'))) loops.push(loop);
    });
    const distinct = new Set(ends.values());
    const finalDispositor = distinct.size === 1 && finals.length === 1 ? finals[0] : null;
    return {next, finals, finalDispositor, receptions, loops};
};

// ---- 2. Chart shape (Marc Edmund Jones) -------------------------------------------------------------------------

export type ChartShape = 'bundle' | 'bowl' | 'bucket' | 'locomotive' | 'seesaw' | 'splash' | 'splay';

/** Thresholds of the commonly stated criteria, in degrees. */
export const SHAPE_RULES = {bundle: 120, bowl: 180, locomotiveGap: 120, evenGap: 60, seesawGap: 60, handleGap: 60};

const gapsOf = (lons: number[]) => {
    const sorted = [...lons].sort((a, b) => a - b);
    return sorted.map((x, i) => ({from: x, gap: ((sorted[(i + 1) % sorted.length] - x) % 360 + 360) % 360 || (sorted.length === 1 ? 360 : 0)}));
};

export interface IShape {
    shape: ChartShape;
    span: number;
    largestGap: number;
    handle: string | null;
}

export const chartShape = (points: IDepthPoint[]): IShape | null => {
    const planets = planetsOf(points).filter((p) => p.longitude !== null);
    if (planets.length < 8) return null;
    const lons = planets.map((p) => p.longitude!);
    const gaps = gapsOf(lons).map((g) => g.gap).sort((a, b) => b - a);
    const largestGap = gaps[0];
    const span = 360 - largestGap;
    const R = SHAPE_RULES;

    if (span <= R.bundle) return {shape: 'bundle', span, largestGap, handle: null};
    if (span <= R.bowl) return {shape: 'bowl', span, largestGap, handle: null};

    // Bucket: a bowl of all but one planet, with that one (the handle) at least 60 degrees from both sides
    for (const p of planets) {
        const rest = lons.filter((l) => l !== p.longitude);
        const restGaps = gapsOf(rest).map((g) => g.gap).sort((a, b) => b - a);
        if (360 - restGaps[0] > R.bowl) continue;
        const distances = rest.map((l) => Math.min(Math.abs(l - p.longitude!), 360 - Math.abs(l - p.longitude!)));
        if (Math.min(...distances) >= R.handleGap) return {shape: 'bucket', span, largestGap, handle: p.id};
    }
    if (largestGap >= R.locomotiveGap && gaps[1] < R.evenGap) return {shape: 'locomotive', span, largestGap, handle: null};
    // Two groups: exactly two gaps of 60 degrees or more (more than two gaps means several clusters: a splay)
    if (gaps[0] >= R.seesawGap && gaps[1] >= R.seesawGap && gaps[2] < R.seesawGap) return {shape: 'seesaw', span, largestGap, handle: null};
    if (largestGap <= R.evenGap) return {shape: 'splash', span, largestGap, handle: null};
    return {shape: 'splay', span, largestGap, handle: null};
};

// ---- 3. Temperament ---------------------------------------------------------------------------------------------

export type Temperament = 'choleric' | 'sanguine' | 'melancholic' | 'phlegmatic';

const ELEMENT_OF: Record<string, 'fire' | 'earth' | 'air' | 'water'> = {
    aries: 'fire', leo: 'fire', sagittarius: 'fire', taurus: 'earth', virgo: 'earth', capricorn: 'earth',
    gemini: 'air', libra: 'air', aquarius: 'air', cancer: 'water', scorpio: 'water', pisces: 'water',
};
const TEMPERAMENT_OF: Record<string, Temperament> = {fire: 'choleric', air: 'sanguine', earth: 'melancholic', water: 'phlegmatic'};
/** The simplified modern method: the Sun, the Moon and the Ascendant sign count double. */
export const TEMPERAMENT_WEIGHTS = {luminaries: 2, ascendant: 2, other: 1};

export interface ITemperament {
    scores: Record<Temperament, number>;
    dominant: Temperament[];
}

export const temperament = (points: IDepthPoint[], ascSign: string | null): ITemperament => {
    const scores: Record<Temperament, number> = {choleric: 0, sanguine: 0, melancholic: 0, phlegmatic: 0};
    planetsOf(points).forEach((p) => {
        const w = p.id === 'sun' || p.id === 'moon' ? TEMPERAMENT_WEIGHTS.luminaries : TEMPERAMENT_WEIGHTS.other;
        scores[TEMPERAMENT_OF[ELEMENT_OF[p.sign!]]] += w;
    });
    if (ascSign) scores[TEMPERAMENT_OF[ELEMENT_OF[ascSign]]] += TEMPERAMENT_WEIGHTS.ascendant;
    const top = Math.max(...Object.values(scores));
    return {scores, dominant: (Object.keys(scores) as Temperament[]).filter((t) => scores[t] === top)};
};

// ---- 6. Critical degrees ----------------------------------------------------------------------------------------

export type CriticalKind = 'anaretic' | 'critical';

const MODALITY_OF: Record<string, 'cardinal' | 'fixed' | 'mutable'> = {
    aries: 'cardinal', cancer: 'cardinal', libra: 'cardinal', capricorn: 'cardinal',
    taurus: 'fixed', leo: 'fixed', scorpio: 'fixed', aquarius: 'fixed',
    gemini: 'mutable', virgo: 'mutable', sagittarius: 'mutable', pisces: 'mutable',
};
/** The critical degrees as most often given (the degree numbers 0-29 within a sign); 29 is the anaretic degree. */
export const CRITICAL_DEGREES: Record<'cardinal' | 'fixed' | 'mutable', number[]> = {cardinal: [0, 13, 26], fixed: [9, 21], mutable: [4, 17]};
export const ANARETIC = 29;

export const criticalDegrees = (points: IDepthPoint[]) => planetsOf(points).flatMap((p) => {
    if (p.degree === null) return [];
    if (p.degree === ANARETIC) return [{id: p.id!, sign: p.sign!, degree: p.degree, kind: 'anaretic' as CriticalKind}];
    if (CRITICAL_DEGREES[MODALITY_OF[p.sign!]].includes(p.degree)) return [{id: p.id!, sign: p.sign!, degree: p.degree, kind: 'critical' as CriticalKind}];
    return [];
});

// ---- 12. Strengths and challenges -------------------------------------------------------------------------------

const EASY = ['trine', 'sextile'];
const HARD = ['square', 'opposition'];

export interface IStrengths {
    strong: {id: string; dignity: string}[];
    weak: {id: string; dignity: string}[];
    easy: number;
    hard: number;
    conjunctions: number;
    tightest: IDepthAspect[];
}

/** Planets in domicile/exaltation, planets in detriment/fall, easy and hard major aspects, the three closest aspects. */
export const strengths = (points: IDepthPoint[], aspects: IDepthAspect[]): IStrengths => {
    const planets = planetsOf(points);
    const major = aspects.filter((a) => a.major !== false && a.p1 && a.p2 && TEN.includes(a.p1) && TEN.includes(a.p2) && a.type);
    return {
        strong: planets.filter((p) => p.dignity === 'domicile' || p.dignity === 'exaltation').map((p) => ({id: p.id!, dignity: p.dignity!})),
        weak: planets.filter((p) => p.dignity === 'detriment' || p.dignity === 'fall').map((p) => ({id: p.id!, dignity: p.dignity!})),
        easy: major.filter((a) => EASY.includes(a.type!)).length,
        hard: major.filter((a) => HARD.includes(a.type!)).length,
        conjunctions: major.filter((a) => a.type === 'conjunction').length,
        tightest: [...major].sort((a, b) => (a.orb ?? 99) - (b.orb ?? 99)).slice(0, 3),
    };
};
