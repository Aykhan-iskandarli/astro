import {describe, expect, it} from 'vitest';
import {SlowPlanetModel} from 'pages/natal-chart/models/forecast-year.model';
import {IEpisode} from 'pages/natal-chart/models/transformations.model';
import {IProfectionYear} from 'pages/natal-chart/models/cycles.model';
import {firstOf, toneOf, topicIngresses, topicProfections, topicWindows} from './questions';

const ep = (transit: string, natal: string, aspect: string, start: string, end: string, passes: string[], sameBody = false): IEpisode => ({
    transit, natal, aspect, start, end, sameBody, natalSign: 'aries', natalDegree: 0, natalMinute: 0,
    passes: passes.map((at) => ({at, retrograde: false})), ageAtStart: 0, ageAtEnd: 0,
});

describe('toneOf', () => {
    it('reads Jupiter and easy aspects as support, Uranus as change, the rest as a test', () => {
        expect(toneOf('jupiter', 'square')).toBe('support');
        expect(toneOf('saturn', 'trine')).toBe('support');
        expect(toneOf('uranus', 'conjunction')).toBe('change');
        expect(toneOf('saturn', 'square')).toBe('challenge');
        expect(toneOf('pluto', 'conjunction')).toBe('challenge');
    });
});

describe('topicWindows', () => {
    const episodes = [
        ep('saturn', 'mc', 'square', '2026-03-01T00:00:00Z', '2026-12-01T00:00:00Z', ['2026-03-30T00:00:00Z', '2026-10-10T00:00:00Z']),
        ep('jupiter', 'sun', 'trine', '2027-05-01T00:00:00Z', '2027-06-01T00:00:00Z', ['2027-05-20T00:00:00Z']),
        ep('jupiter', 'venus', 'trine', '2026-05-01T00:00:00Z', '2026-06-01T00:00:00Z', ['2026-05-20T00:00:00Z']),
        ep('saturn', 'saturn', 'square', '2026-01-01T00:00:00Z', '2026-12-01T00:00:00Z', ['2026-06-01T00:00:00Z'], true),
        ep('uranus', 'mc', 'trine', '2025-01-01T00:00:00Z', '2025-06-01T00:00:00Z', ['2025-03-01T00:00:00Z']),
    ];

    it('keeps the transits to the question points inside the range, without a planet to itself', () => {
        const got = topicWindows(episodes, 'career', '2026-01-01T00:00:00Z', '2027-01-01T00:00:00Z');
        expect(got.map((w) => `${w.episode.transit}-${w.episode.natal}`)).toEqual(['saturn-mc']);
        expect(got[0].tone).toBe('challenge');
        expect(got[0].passes).toHaveLength(2);
    });

    it('counts only the passes inside the range and sorts by start', () => {
        const got = topicWindows(episodes, 'career', '2026-06-01T00:00:00Z', '2028-01-01T00:00:00Z');
        expect(got.map((w) => w.episode.natal)).toEqual(['mc', 'sun']);
        expect(got[0].passes).toEqual(['2026-10-10T00:00:00Z']);
        expect(firstOf(got, 'support')?.episode.natal).toBe('sun');
        expect(firstOf(got, 'change')).toBeNull();
    });
});

describe('topicIngresses', () => {
    it('lists a slow planet entering a question house inside the range', () => {
        const planets = {
            jupiter: new SlowPlanetModel({houses: [
                {region: 9, start: '2026-01-01T00:00:00Z', end: '2026-07-01T00:00:00Z', startClipped: true},
                {region: 10, start: '2026-07-01T00:00:00Z', end: '2027-01-01T00:00:00Z', endClipped: true},
            ]}),
            saturn: new SlowPlanetModel({houses: [{region: 6, start: '2026-01-01T00:00:00Z', end: '2027-01-01T00:00:00Z', startClipped: true, endClipped: true}]}),
        };
        expect(topicIngresses(planets, 'career', '2026-01-01T00:00:00Z', '2027-01-01T00:00:00Z')).toEqual([
            {planet: 'jupiter', house: 10, start: '2026-07-01T00:00:00Z', end: null},
        ]);
    });
});

describe('topicProfections', () => {
    it('keeps the profection years on the question houses', () => {
        const y = (age: number, house: number, start: string, end: string): IProfectionYear => ({age, house, start, end, sign: 'aries', lord: 'mars', lordNatal: null});
        const years = [y(35, 12, '2025-06-15', '2026-06-15'), y(36, 1, '2026-06-15', '2027-06-15'), y(45, 10, '2035-06-15', '2036-06-15')];
        expect(topicProfections(years, 'health', '2026-01-01', '2027-01-01').map((p) => p.age)).toEqual([35, 36]);
        expect(topicProfections(years, 'career', '2026-01-01', '2027-01-01')).toEqual([]);
    });
});
