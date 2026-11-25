import {describe, expect, it} from 'vitest';
import {FirdariaPeriodModel, MonthModel, SlowPlanetModel} from 'pages/natal-chart/models/forecast-year.model';
import {TimelineEventModel} from 'pages/natal-chart/models/timeline.model';
import {PersonalLunationModel} from 'pages/sky/models/personal-moon.model';
import {busiestMonths, eclipsesOfYear, houseChanges, timeLordAt, topTransits} from './year-summary';

const ev = (transit: string, natal: string, aspect: string, at: string) => new TimelineEventModel({transit, natal, aspect, at});

describe('topTransits', () => {
    it('ranks slow planets on personal points and hard aspects first, one per contact', () => {
        const list = topTransits([
            ev('jupiter', 'venus', 'trine', '2026-03-01T00:00:00Z'),
            ev('saturn', 'sun', 'square', '2026-05-01T00:00:00Z'),
            ev('saturn', 'sun', 'square', '2026-09-01T00:00:00Z'),
            ev('mars', 'sun', 'conjunction', '2026-02-01T00:00:00Z'),
            ev('pluto', 'moon', 'opposition', '2026-06-01T00:00:00Z'),
            ev('uranus', 'neptune', 'sextile', '2026-07-01T00:00:00Z'),
        ], 3);
        expect(list.map((e) => `${e.transit}-${e.natal}`)).toEqual(['saturn-sun', 'pluto-moon', 'jupiter-venus']); // saturn-sun and pluto-moon tie, the earlier date first
        expect(list[0].at).toBe('2026-05-01T00:00:00Z');
    });

    it('breaks ties by the earlier date and ignores fast planets', () => {
        const list = topTransits([ev('saturn', 'sun', 'square', '2026-08-01T00:00:00Z'), ev('saturn', 'moon', 'square', '2026-02-01T00:00:00Z'), ev('mars', 'sun', 'square', '2026-01-01T00:00:00Z')], 5);
        expect(list.map((e) => e.natal)).toEqual(['moon', 'sun']);
    });
});

describe('houseChanges', () => {
    it('lists a slow planet moving into the next house, the heavier planet first', () => {
        const planets = {
            jupiter: new SlowPlanetModel({houses: [{region: 4, start: '2026-01-01', end: '2026-06-01'}, {region: 5, start: '2026-06-01', end: '2027-01-01'}]}),
            saturn: new SlowPlanetModel({houses: [{region: 8, start: '2026-01-01', end: '2027-01-01'}]}),
            pluto: new SlowPlanetModel({houses: [{region: 1, start: '2026-01-01', end: '2026-03-01'}, {region: 2, start: '2026-03-01', end: '2027-01-01'}]}),
            uranus: new SlowPlanetModel({houses: null, signs: []}),
        };
        expect(houseChanges(planets)).toEqual([
            {planet: 'pluto', from: 1, to: 2, at: '2026-03-01'},
            {planet: 'jupiter', from: 4, to: 5, at: '2026-06-01'},
        ]);
    });
});

describe('busiestMonths', () => {
    it('picks the months with most hits, earlier month on a tie', () => {
        const months = [1, 2, 3, 4, 5].map((m, i) => new MonthModel({month: m, slowHits: [2, 5, 5, 0, 1][i]}));
        expect(busiestMonths(months, 3)).toEqual([2, 3, 1]);
    });
});

describe('eclipsesOfYear', () => {
    it('keeps eclipses, those touching a natal point first, back in date order', () => {
        const l = (at: string, eclipse: boolean, aspects: number) => new PersonalLunationModel({
            at, phase: 'new', eclipse: eclipse ? {kind: 'solar', type: 'total'} : null,
            aspects: Array.from({length: aspects}, () => ({point: 'sun', aspect: 'conjunction', orb: 1})),
        });
        const got = eclipsesOfYear([l('2026-02-01', true, 0), l('2026-03-01', false, 2), l('2026-08-01', true, 1), l('2026-09-01', true, 0)], 2);
        expect(got.map((x) => x.at)).toEqual(['2026-02-01', '2026-08-01']);
    });
});

describe('timeLordAt', () => {
    it('finds the ruler and sub-ruler in force in mid-year', () => {
        const periods = [
            new FirdariaPeriodModel({lord: 'sun', start: '2000-06-01', end: '2010-06-01', sub: []}),
            new FirdariaPeriodModel({
                lord: 'venus', start: '2010-06-01', end: '2028-06-01',
                sub: [{lord: 'venus', start: '2025-01-01', end: '2026-05-01'}, {lord: 'mercury', start: '2026-05-01', end: '2027-09-01'}],
            }),
        ];
        expect(timeLordAt(periods, 2026)).toEqual({major: 'venus', sub: 'mercury'});
        expect(timeLordAt(periods, 2040)).toBeNull();
    });
});
