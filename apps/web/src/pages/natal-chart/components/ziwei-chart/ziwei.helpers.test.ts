import {describe, expect, it} from 'vitest';
import {BRANCH_CELL, buildAstrolabe, timeIndex} from './ziwei.helpers';

describe('timeIndex', () => {
    it.each([['00:30', 0], ['01:00', 1], ['02:59', 1], ['13:00', 7], ['14:30', 7], ['21:15', 11], ['22:59', 11], ['23:10', 12]])(
        '%s -> %i', (t, i) => expect(timeIndex(t)).toBe(i));
});

describe('buildAstrolabe', () => {
    const a = buildAstrolabe('1990-06-15', '14:30', 'male');

    it('agrees with the BaZi engine on the four pillars (independent libraries)', () => {
        // engine (lunar_python): 庚午 壬午 辛亥 乙未
        expect(a.chineseDate).toBe('geng woo - ren woo - xin hai - yi wei');
    });

    it('has 12 palaces, each placed on a distinct grid cell, 14 major stars in total', () => {
        expect(a.palaces).toHaveLength(12);
        const cells = new Set(a.palaces.map((p) => BRANCH_CELL[p.earthlyBranch].join(',')));
        expect(cells.size).toBe(12);
        expect(a.palaces.flatMap((p) => p.majorStars)).toHaveLength(14);
    });
});
