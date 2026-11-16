import {describe, expect, it} from 'vitest';
import {byMonth, directionsStart, DIRECTIONS_WINDOW, eventsIn} from './directions';

const ev = (at: string) => ({at, age: 30});

describe('directions helpers', () => {
    it('keeps the events of one calendar year, in date order', () => {
        const list = [ev('2027-03-01T00:00:00Z'), ev('2026-12-31T23:00:00Z'), ev('2026-02-10T10:00:00Z')];
        expect(eventsIn(list, 2026).map((e) => e.at)).toEqual(['2026-02-10T10:00:00Z', '2026-12-31T23:00:00Z']);
    });
    it('groups by month and drops empty months', () => {
        const g = byMonth([ev('2026-02-10T00:00:00Z'), ev('2026-02-20T00:00:00Z'), ev('2026-07-01T00:00:00Z')]);
        expect(g.map((x) => [x.month, x.items.length])).toEqual([[1, 2], [6, 1]]);
    });
    it('requests a window that contains the year with margin', () => {
        for (const y of [1990, 2026, 2031, 2032]) {
            const s = directionsStart(y);
            expect(y).toBeGreaterThanOrEqual(s + 3);
            expect(y).toBeLessThanOrEqual(s + DIRECTIONS_WINDOW - 3);
        }
    });
});
