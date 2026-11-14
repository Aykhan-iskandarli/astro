import {describe, expect, it} from 'vitest';
import {IEpisode} from 'pages/natal-chart/models/transformations.model';
import {activeIn, byImportance, cycleKey, groupOf, WINDOW_YEARS, windowStart} from './transformations';

const ep = (over: Partial<IEpisode>): IEpisode => ({
    transit: 'saturn', natal: 'sun', aspect: 'square', natalSign: 'aries', natalDegree: 5, natalMinute: 0,
    passes: [], start: '2027-03-01T00:00:00Z', end: '2027-11-01T00:00:00Z', ageAtStart: 30, ageAtEnd: 30.7, sameBody: false, ...over,
});

describe('groupOf', () => {
    it('reads a planet to itself as a life cycle', () => {
        expect(groupOf(ep({transit: 'saturn', natal: 'saturn', aspect: 'conjunction', sameBody: true}))).toBe('cycle');
        expect(groupOf(ep({transit: 'uranus', natal: 'uranus', aspect: 'opposition', sameBody: true}))).toBe('cycle');
    });
    it('keeps a planet to itself without a cycle text among the other contacts', () => {
        expect(groupOf(ep({transit: 'pluto', natal: 'pluto', aspect: 'sextile', sameBody: true}))).toBe('other');
        expect(groupOf(ep({transit: 'jupiter', natal: 'jupiter', aspect: 'trine', sameBody: true}))).toBe('other');
    });
    it('puts hard aspects of Saturn to Pluto among the major changes, Jupiter and easy aspects among the rest', () => {
        expect(groupOf(ep({transit: 'pluto', aspect: 'square'}))).toBe('major');
        expect(groupOf(ep({transit: 'jupiter', aspect: 'square'}))).toBe('other');
        expect(groupOf(ep({transit: 'saturn', aspect: 'trine'}))).toBe('other');
    });
});

describe('cycleKey', () => {
    it('is the planet and aspect for a planet to itself and null otherwise', () => {
        expect(cycleKey(ep({transit: 'saturn', natal: 'saturn', aspect: 'conjunction', sameBody: true}))).toBe('saturn-conjunction');
        expect(cycleKey(ep({}))).toBeNull();
    });
});

describe('activeIn', () => {
    it('includes episodes that overlap the year, including ones that start before it or end after it', () => {
        const e = ep({start: '2026-11-15T00:00:00Z', end: '2027-02-10T00:00:00Z'});
        expect(activeIn(e, 2026)).toBe(true);
        expect(activeIn(e, 2027)).toBe(true);
        expect(activeIn(e, 2028)).toBe(false);
        expect(activeIn(e, 2025)).toBe(false);
    });
});

describe('byImportance', () => {
    it('orders by planet weight, then aspect, then date', () => {
        const list = [ep({transit: 'jupiter'}), ep({transit: 'pluto', aspect: 'trine'}), ep({transit: 'pluto', aspect: 'conjunction'})];
        expect([...list].sort(byImportance).map((e) => `${e.transit}-${e.aspect}`)).toEqual(['pluto-conjunction', 'pluto-trine', 'jupiter-square']);
    });
});

describe('windowStart', () => {
    it('always leaves at least three years of margin on both sides of the year', () => {
        for (let y = 1990; y < 2100; y++) {
            const s = windowStart(y);
            expect(y - s).toBeGreaterThanOrEqual(3);
            expect(s + WINDOW_YEARS - 1 - y).toBeGreaterThanOrEqual(3);
        }
    });
});
