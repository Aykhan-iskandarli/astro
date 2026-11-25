import {describe, expect, it} from 'vitest';
import {SegmentModel} from 'pages/natal-chart/models/forecast-year.model';
import {dominantHouse, foldShortDips, inMonth, staysInMonth} from './year-rhythm';

const seg = (region: number, start: string, end: string) => new SegmentModel({region, start, end});

describe('staysInMonth', () => {
    const sun = [
        seg(5, '2027-01-01T00:00:00Z', '2027-01-20T12:00:00Z'),
        seg(6, '2027-01-20T12:00:00Z', '2027-02-19T00:00:00Z'),
        seg(7, '2027-02-19T00:00:00Z', '2028-01-01T00:00:00Z'),
    ];

    it('cuts the segments to the month', () => {
        const jan = staysInMonth(sun, 2027, 1);
        expect(jan.map((s) => s.house)).toEqual([5, 6]);
        expect(jan[0]).toMatchObject({from: '2027-01-01T00:00:00.000Z', to: '2027-01-20T12:00:00.000Z'});
        expect(jan[1].to).toBe('2027-02-01T00:00:00.000Z');
    });

    it('leaves out a segment that ends exactly at the month start', () => {
        expect(staysInMonth(sun, 2027, 2).map((s) => s.house)).toEqual([6, 7]);
        expect(staysInMonth(sun, 2027, 12).map((s) => s.house)).toEqual([7]);
    });

    it('picks the house with most days as dominant, the earlier on a tie', () => {
        expect(dominantHouse(staysInMonth(sun, 2027, 1))).toBe(5);
        expect(dominantHouse(staysInMonth([seg(1, '2027-03-01T00:00:00Z', '2027-03-16T12:00:00Z'), seg(2, '2027-03-16T12:00:00Z', '2027-04-01T00:00:00Z')], 2027, 3))).toBe(1);
        expect(dominantHouse([])).toBeNull();
    });
});

describe('inMonth', () => {
    it('keeps the items stamped in the month', () => {
        const items = [{at: '2027-03-31T23:00:00Z'}, {at: '2027-04-01T00:00:00Z'}, {at: null}];
        expect(inMonth(items, 3)).toHaveLength(1);
        expect(inMonth(items, 4)).toHaveLength(1);
    });
});

describe('foldShortDips', () => {
    it('folds a short return into the house it leaves and keeps a real change', () => {
        const segs = [
            seg(6, '2026-01-01T00:00:00Z', '2026-03-09T00:00:00Z'),
            seg(5, '2026-03-09T00:00:00Z', '2026-03-13T00:00:00Z'),
            seg(6, '2026-03-13T00:00:00Z', '2026-03-20T00:00:00Z'),
            seg(5, '2026-03-20T00:00:00Z', '2027-01-01T00:00:00Z'),
        ];
        const got = foldShortDips(segs);
        expect(got.map((s) => [s.region, s.start, s.end])).toEqual([
            [6, '2026-01-01T00:00:00Z', '2026-03-20T00:00:00Z'],
            [5, '2026-03-20T00:00:00Z', '2027-01-01T00:00:00Z'],
        ]);
        expect(foldShortDips([seg(1, '2026-01-01T00:00:00Z', '2026-02-01T00:00:00Z')])).toHaveLength(1);
    });
});
