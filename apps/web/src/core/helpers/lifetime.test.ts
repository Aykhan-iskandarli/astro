import {describe, expect, it} from 'vitest';
import {ageAt, CYCLE_ROWS, luckSpans, pct, span} from './lifetime';

describe('ageAt', () => {
    it('counts years from the birth date', () => {
        expect(ageAt('1990-06-15', '2020-06-15T00:00:00Z')).toBeCloseTo(30, 1);
        expect(ageAt('1990-06-15', '2000-06-15')).toBeCloseTo(10, 1);
        expect(ageAt('1990-06-15', '1990-12-15')).toBeCloseTo(0.5, 1);
    });
});

describe('pct and span', () => {
    it('maps 0-90 years onto the track and clamps', () => {
        expect(pct(0)).toBe(0);
        expect(pct(45)).toBe(50);
        expect(pct(90)).toBe(100);
        expect(pct(120)).toBe(100);
        expect(pct(-3)).toBe(0);
    });
    it('keeps a short event visible', () => {
        expect(span(30, 30).width).toBeGreaterThanOrEqual(0.9);
        expect(span(10, 19)).toEqual({left: (10 / 90) * 100, width: 10});
    });
});

describe('luckSpans', () => {
    it('ends each pillar where the next begins and gives the last ten years', () => {
        expect(luckSpans([{startAge: 8}, {startAge: 18}, {startAge: 28}])).toEqual([{from: 8, to: 18}, {from: 18, to: 28}, {from: 28, to: 38}]);
    });
});

describe('CYCLE_ROWS', () => {
    it('lists each planet once', () => {
        expect(new Set(CYCLE_ROWS).size).toBe(CYCLE_ROWS.length);
    });
});
