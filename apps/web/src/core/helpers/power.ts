import {dignityTable, IDignityPoint, IDignityRow, SEVEN} from './dignity';
import {SIGN_RULER} from './portrait';

/**
 * Which planets carry the chart. Nothing is estimated: for each of the seven traditional planets the essential score
 * (Lilly), whether it is angular, how many major aspects it makes, whether it rules the Ascendant, and whether it rules
 * the Sun or Moon sign are counted. A planet with at least PROMINENT_MIN of the five markers below is called prominent.
 */
export interface IPowerPoint extends IDignityPoint {
    house: number | null;
    retrograde: boolean;
}

export interface IPowerAspect {
    p1: string | null;
    p2: string | null;
    major: boolean;
}

export interface IPowerInput {
    points: IPowerPoint[];
    aspects: IPowerAspect[];
    ascRuler: string | null;
    sect: 'day' | 'night' | null;
    timeUnknown: boolean;
}

export const ANGULAR_HOUSES = [1, 4, 7, 10];
export const PROMINENT_MIN = 3;
export const TOP_ASPECTED = 3;

export type Marker = 'dignified' | 'angular' | 'aspected' | 'ascRuler' | 'luminaryRuler';

export interface IPowerRow extends IDignityRow {
    house: number | null;
    retrograde: boolean;
    angular: boolean;
    aspects: number;
    markers: Marker[];
}

export interface IPower {
    rows: IPowerRow[];
    strongest: string[];
    weakest: string[];
    prominent: string[];
    sectKnown: boolean;
}

export const powerSummary = (chart: IPowerInput): IPower => {
    const day = chart.timeUnknown || !chart.sect ? null : chart.sect === 'day';
    const table = dignityTable(chart.points, day);
    const count = (id: string) => chart.aspects.filter((a) => a.major && (a.p1 === id || a.p2 === id)).length;
    const counts = Object.fromEntries(SEVEN.map((id) => [id, count(id)]));
    const topCount = [...new Set(Object.values(counts))].sort((a, b) => b - a).slice(0, TOP_ASPECTED).pop() ?? 0;
    const sunSign = chart.points.find((p) => p.id === 'sun')?.sign ?? null;
    const moonSign = chart.points.find((p) => p.id === 'moon')?.sign ?? null;
    const lumRulers = [sunSign, moonSign].filter(Boolean).map((s) => SIGN_RULER[s!]);

    const rows: IPowerRow[] = table.map((r) => {
        const p = chart.points.find((x) => x.id === r.id)!;
        const angular = !chart.timeUnknown && p.house !== null && ANGULAR_HOUSES.includes(p.house);
        const markers: Marker[] = [];
        if (r.dignities.includes('domicile') || r.dignities.includes('exaltation')) markers.push('dignified');
        if (angular) markers.push('angular');
        if (counts[r.id] >= topCount && counts[r.id] > 0) markers.push('aspected');
        if (!chart.timeUnknown && chart.ascRuler === r.id) markers.push('ascRuler');
        if (lumRulers.includes(r.id)) markers.push('luminaryRuler');
        return {...r, house: chart.timeUnknown ? null : p.house, retrograde: p.retrograde, angular, aspects: counts[r.id], markers};
    });
    const best = Math.max(...rows.map((r) => r.score));
    const worst = Math.min(...rows.map((r) => r.score));
    return {
        rows,
        strongest: rows.filter((r) => r.score === best && best > 0).map((r) => r.id),
        weakest: rows.filter((r) => r.score === worst && worst < 0).map((r) => r.id),
        prominent: rows.filter((r) => r.markers.length >= PROMINENT_MIN).map((r) => r.id),
        sectKnown: day !== null,
    };
};
