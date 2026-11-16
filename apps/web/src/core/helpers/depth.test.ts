import {describe, expect, it} from 'vitest';
import {chartShape, criticalDegrees, dispositors, IDepthPoint, strengths, temperament} from './depth';

const IDS = ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'pluto'];
const SIGNS = ['aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo', 'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces'];
const at = (id: string, lon: number): IDepthPoint => ({id, longitude: lon, sign: SIGNS[Math.floor(lon / 30)], degree: Math.floor(lon % 30)});
const chart = (lons: number[]) => IDS.map((id, i) => at(id, lons[i]));

describe('dispositors', () => {
    it('finds the final dispositor when every chain ends in one planet in its own sign', () => {
        // Sun in Leo (own sign); the Moon in Leo is ruled by the Sun; Mercury in Gemini is its own... use Venus in Leo too
        const pts: IDepthPoint[] = [
            {id: 'sun', longitude: 130, sign: 'leo', degree: 10}, {id: 'moon', longitude: 140, sign: 'leo', degree: 20},
            {id: 'venus', longitude: 135, sign: 'leo', degree: 15}, {id: 'mars', longitude: 125, sign: 'leo', degree: 5},
        ];
        const d = dispositors(pts);
        expect(d.finals).toEqual(['sun']);
        expect(d.finalDispositor).toBe('sun');
        expect(d.next.moon).toBe('sun');
    });
    it('finds a mutual reception and no final dispositor', () => {
        // Venus in Aries (ruled by Mars) and Mars in Taurus (ruled by Venus)
        const pts: IDepthPoint[] = [
            {id: 'venus', longitude: 10, sign: 'aries', degree: 10}, {id: 'mars', longitude: 40, sign: 'taurus', degree: 10},
        ];
        const d = dispositors(pts);
        expect(d.receptions).toEqual([['mars', 'venus']]);
        expect(d.finalDispositor).toBeNull();
        expect(d.finals).toEqual([]);
    });
    it('reports a loop longer than two planets', () => {
        // Sun in Cancer (Moon) -> Moon in Gemini (Mercury) -> Mercury in Leo (Sun)
        const pts: IDepthPoint[] = [
            {id: 'sun', longitude: 100, sign: 'cancer', degree: 10}, {id: 'moon', longitude: 70, sign: 'gemini', degree: 10},
            {id: 'mercury', longitude: 130, sign: 'leo', degree: 10},
        ];
        expect(dispositors(pts).loops.map((l) => [...l].sort())).toEqual([['mercury', 'moon', 'sun']]);
    });
});

describe('chartShape', () => {
    it('is a bundle when every planet is within 120 degrees', () => {
        expect(chartShape(chart([10, 20, 30, 40, 50, 60, 70, 80, 90, 100]))?.shape).toBe('bundle');
    });
    it('is a bowl within 180 degrees but not 120', () => {
        expect(chartShape(chart([0, 20, 40, 60, 80, 100, 120, 140, 160, 175]))?.shape).toBe('bowl');
    });
    it('is a bucket when one planet stands apart from a bowl of the rest', () => {
        expect(chartShape(chart([0, 15, 30, 45, 60, 75, 90, 105, 120, 250]))?.shape).toBe('bucket');
        expect(chartShape(chart([0, 15, 30, 45, 60, 75, 90, 105, 120, 250]))?.handle).toBe('pluto');
    });
    it('is a locomotive with one empty third and an even rest', () => {
        expect(chartShape(chart([0, 25, 50, 75, 100, 125, 150, 175, 200, 225]))?.shape).toBe('locomotive');
    });
    it('is a seesaw with two groups and two wide gaps', () => {
        expect(chartShape(chart([0, 10, 20, 30, 40, 180, 190, 200, 210, 220]))?.shape).toBe('seesaw');
    });
    it('is a splash when no gap is wider than 60 degrees', () => {
        expect(chartShape(chart([0, 36, 72, 108, 144, 180, 216, 252, 288, 324]))?.shape).toBe('splash');
    });
    it('is a splay with three or more clusters', () => {
        expect(chartShape(chart([0, 5, 10, 60, 65, 150, 155, 160, 250, 255]))?.shape).toBe('splay');
    });
    it('needs most of the planets', () => {
        expect(chartShape([at('sun', 10), at('moon', 50)])).toBeNull();
    });
});

describe('temperament', () => {
    it('counts the Sun, the Moon and the Ascendant sign double', () => {
        const pts: IDepthPoint[] = [at('sun', 10), at('moon', 20), at('mercury', 100)]; // Aries, Aries, Cancer
        const t = temperament(pts, 'leo');
        expect(t.scores).toEqual({choleric: 2 + 2 + 2, sanguine: 0, melancholic: 0, phlegmatic: 1});
        expect(t.dominant).toEqual(['choleric']);
    });
    it('reports a tie as two temperaments', () => {
        const t = temperament([at('sun', 10), at('moon', 70)], null); // Aries (fire), Gemini (air)
        expect(t.dominant.sort()).toEqual(['choleric', 'sanguine']);
    });
});

describe('criticalDegrees', () => {
    it('marks the anaretic degree and the critical degrees of the sign modality', () => {
        const pts: IDepthPoint[] = [
            {id: 'sun', longitude: 29.5, sign: 'aries', degree: 29}, // anaretic
            {id: 'moon', longitude: 13.2, sign: 'aries', degree: 13}, // cardinal critical
            {id: 'mercury', longitude: 39.1, sign: 'taurus', degree: 9}, // fixed critical
            {id: 'venus', longitude: 64.4, sign: 'gemini', degree: 4}, // mutable critical
            {id: 'mars', longitude: 69.0, sign: 'gemini', degree: 9}, // 9 is critical only for fixed signs
        ];
        expect(criticalDegrees(pts).map((c) => `${c.id}:${c.kind}`)).toEqual(['sun:anaretic', 'moon:critical', 'mercury:critical', 'venus:critical']);
    });
});

describe('strengths', () => {
    it('separates strong and weak dignities and counts easy and hard aspects', () => {
        const pts: IDepthPoint[] = [
            {id: 'sun', longitude: 130, sign: 'leo', degree: 10, dignity: 'domicile'},
            {id: 'saturn', longitude: 10, sign: 'aries', degree: 10, dignity: 'fall'},
            {id: 'venus', longitude: 10, sign: 'aries', degree: 10, dignity: null},
        ];
        const s = strengths(pts, [
            {p1: 'sun', p2: 'moon', type: 'trine', orb: 2, major: true},
            {p1: 'sun', p2: 'saturn', type: 'square', orb: 0.5, major: true},
            {p1: 'venus', p2: 'mars', type: 'conjunction', orb: 1, major: true},
            {p1: 'sun', p2: 'asc', type: 'trine', orb: 0.1, major: true}, // angles are not counted
        ]);
        expect(s.strong).toEqual([{id: 'sun', dignity: 'domicile'}]);
        expect(s.weak).toEqual([{id: 'saturn', dignity: 'fall'}]);
        expect([s.easy, s.hard, s.conjunctions]).toEqual([1, 1, 1]);
        expect(s.tightest.map((a) => a.orb)).toEqual([0.5, 1, 2]);
    });
});
