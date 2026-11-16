import {describe, expect, it} from 'vitest';
import {nearMatches, offsetDays, transitMatches} from './event-check';

const ep = (transit: string, natal: string, passes: string[], start = passes[0], end = passes[passes.length - 1]) => ({
    transit, natal, aspect: 'square', natalSign: 'aries', natalDegree: 1, natalMinute: 0,
    passes: passes.map((at) => ({at, retrograde: false})), start, end, ageAtStart: 30, ageAtEnd: 31, sameBody: false,
});

describe('event check', () => {
    it('gives signed days from the event', () => {
        expect(offsetDays('2020-06-10T00:00:00Z', '2020-06-01')).toBe(9);
        expect(offsetDays('2020-05-22T12:00:00Z', '2020-06-01')).toBe(-10);
    });
    it('keeps transits exact within the window or running across the date, with the closest pass', () => {
        const list = [
            ep('saturn', 'sun', ['2020-01-01T00:00:00Z', '2020-06-20T00:00:00Z', '2021-03-01T00:00:00Z']),
            ep('uranus', 'moon', ['2019-01-01T00:00:00Z', '2019-02-01T00:00:00Z']),
            ep('pluto', 'venus', ['2020-03-01T00:00:00Z', '2020-12-01T00:00:00Z']),
        ];
        const m = transitMatches(list, '2020-06-01', 'other');
        expect(m.map((x) => x.item.transit)).toEqual(['saturn', 'pluto']);   // uranus is a year away and not running
        expect(m[0].days).toBe(19);                                          // the pass of 20 June is the closest
        expect(m[1].days).toBe(-92);                                         // running across the date, closest pass shown
    });
    it('puts contacts relevant to the event type first, then the closest', () => {
        const list = [
            ep('uranus', 'sun', ['2020-06-02T00:00:00Z']),
            ep('jupiter', 'venus', ['2020-06-30T00:00:00Z']),
        ];
        const m = transitMatches(list, '2020-06-01', 'marriage');
        expect(m.map((x) => [x.item.transit, x.relevant])).toEqual([['uranus', true], ['jupiter', true]]);   // both relevant (the Sun is a marriage body): closest first
        const m2 = transitMatches([ep('uranus', 'mars', ['2020-06-02T00:00:00Z']), ep('jupiter', 'venus', ['2020-06-30T00:00:00Z'])], '2020-06-01', 'marriage');
        expect(m2.map((x) => x.item.transit)).toEqual(['jupiter', 'uranus']);
        expect(m2.map((x) => x.relevant)).toEqual([true, false]);
    });
    it('filters dated contacts by the window', () => {
        const items = [{at: '2020-06-10T00:00:00Z', a: 'mars'}, {at: '2021-06-10T00:00:00Z', a: 'venus'}];
        const m = nearMatches(items, '2020-06-01', 180, ['mars'], (x) => [x.a]);
        expect(m).toHaveLength(1);
        expect(m[0]).toMatchObject({days: 9, relevant: true});
    });
});
