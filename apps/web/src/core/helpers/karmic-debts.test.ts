import {describe, expect, it} from 'vitest';
import {chainOf, karmicDebts} from './karmic-debts';

describe('karmic debts', () => {
    it('writes out the reduction chain', () => {
        expect(chainOf(49)).toEqual([49, 13, 4]);
        expect(chainOf(19)).toEqual([19, 10, 1]);
        expect(chainOf(16)).toEqual([16, 7]);
        expect(chainOf(29)).toEqual([29, 11]);   // a master number stops the reduction
        expect(chainOf(5)).toEqual([5]);
    });
    it('groups the numbers by debt in the given order and skips numbers without one', () => {
        const numbers = {
            lifePath: {value: 4, compound: 13, karmicDebt: 13},
            expression: {value: 7, compound: 16, karmicDebt: 16},
            soulUrge: {value: 4, compound: 40, karmicDebt: null},
            birthday: {value: 4, compound: 13, karmicDebt: 13},
            maturity: null,
        };
        const g = karmicDebts(numbers, ['lifePath', 'expression', 'soulUrge', 'birthday', 'maturity']);
        expect(g.map((x) => x.debt)).toEqual([13, 16]);
        expect(g[0].sources.map((s) => s.kind)).toEqual(['lifePath', 'birthday']);
        expect(g[1].sources[0]).toMatchObject({kind: 'expression', chain: [16, 7]});
        expect(g[0].sources.some((s) => s.derived)).toBe(false);
    });
    it('marks a debt in a derived number (maturity) as derived', () => {
        const g = karmicDebts({lifePath: {value: 4, compound: 13, karmicDebt: 13}, maturity: {value: 4, compound: 13, karmicDebt: 13}}, ['lifePath', 'maturity']);
        expect(g[0].sources.map((s) => [s.kind, s.derived])).toEqual([['lifePath', false], ['maturity', true]]);
    });
    it('returns nothing when no number has a debt', () => {
        expect(karmicDebts({lifePath: {value: 3, compound: 3, karmicDebt: null}}, ['lifePath'])).toEqual([]);
    });
});
