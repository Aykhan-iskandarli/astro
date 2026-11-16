import {describe, expect, it} from 'vitest';
import {IPowerInput, powerSummary} from './power';

const pt = (id: string, sign: string, degree: number, house: number | null, retrograde = false) => ({id, sign, degree, minute: 0, house, retrograde});

const chart = (over: Partial<IPowerInput> = {}): IPowerInput => ({
    points: [
        pt('sun', 'leo', 5, 10), pt('moon', 'cancer', 12, 9), pt('mercury', 'virgo', 3, 11), pt('venus', 'taurus', 24, 8),
        pt('mars', 'gemini', 2, 7), pt('jupiter', 'cancer', 15, 9, true), pt('saturn', 'aquarius', 28, 3),
    ],
    aspects: [
        {p1: 'sun', p2: 'moon', major: true}, {p1: 'sun', p2: 'mars', major: true}, {p1: 'sun', p2: 'saturn', major: true},
        {p1: 'moon', p2: 'jupiter', major: true}, {p1: 'mars', p2: 'venus', major: false},
    ],
    ascRuler: 'sun', sect: 'day', timeUnknown: false, ...over,
});

describe('powerSummary', () => {
    it('scores the seven planets by Lilly and names the strongest and the weakest', () => {
        const p = powerSummary(chart());
        const row = (id: string) => p.rows.find((r) => r.id === id)!;
        expect(row('sun').score).toBe(8);        // domicile +5, day triplicity +3 (the Sun is also not in face/term here)
        expect(row('moon').score).toBe(5);       // domicile
        expect(row('mars').score).toBe(-5);      // peregrine
        expect(row('saturn').dignities).toContain('domicile');
        expect(row('mercury').score).toBe(11);   // 3 Virgo: domicile +5, exaltation +4, term +2
        expect(p.strongest).toEqual(['mercury']);
        expect(p.weakest).toEqual(['mars']);
    });
    it('counts angular planets, major aspects and the rulership markers', () => {
        const p = powerSummary(chart());
        const sun = p.rows.find((r) => r.id === 'sun')!;
        expect(sun.angular).toBe(true);          // house 10
        expect(sun.aspects).toBe(3);
        expect(sun.markers).toEqual(expect.arrayContaining(['dignified', 'angular', 'aspected', 'ascRuler', 'luminaryRuler']));
        expect(p.rows.find((r) => r.id === 'mars')!.aspects).toBe(1); // the minor aspect is not counted
    });
    it('calls a planet with three markers or more prominent', () => {
        expect(powerSummary(chart()).prominent).toContain('sun');
        expect(powerSummary(chart()).prominent).not.toContain('mercury');
    });
    it('drops the triplicity, angularity and the Ascendant ruler without a birth time', () => {
        const p = powerSummary(chart({timeUnknown: true, sect: null}));
        expect(p.sectKnown).toBe(false);
        const sun = p.rows.find((r) => r.id === 'sun')!;
        expect(sun.dignities).not.toContain('triplicity');
        expect(sun.angular).toBe(false);
        expect(sun.markers).not.toContain('ascRuler');
        expect(p.rows.every((r) => !r.peregrine)).toBe(true);
    });
});
