import {describe, expect, it} from 'vitest';
import {buildPortrait, IPortraitInput, IPortraitPoint} from './portrait';

const pt = (id: string, sign: string, house: number | null, retrograde = false): IPortraitPoint => ({id, sign, house, retrograde});

const chart = (over: Partial<IPortraitInput> = {}): IPortraitInput => ({
    points: [
        pt('sun', 'gemini', 9), pt('moon', 'scorpio', 3), pt('mercury', 'gemini', 9, true), pt('venus', 'taurus', 8), pt('mars', 'taurus', 8),
        pt('jupiter', 'scorpio', 3), pt('saturn', 'capricorn', 11), pt('uranus', 'capricorn', 11), pt('neptune', 'capricorn', 12), pt('pluto', 'scorpio', 2),
    ],
    firstHouseRulers: [{id: 'venus', sign: 'taurus', house: 8, kind: 'traditional'}],
    ascSign: 'libra', sect: 'day', timeUnknown: false, ...over,
});

describe('buildPortrait', () => {
    it('counts the halves of the chart from the houses', () => {
        const p = buildPortrait(chart());
        // houses 9, 9, 8, 8, 11, 11, 12 are above the horizon; 3, 3, 2 below
        expect(p.halves).toEqual({upper: 7, lower: 3, east: 6, west: 4});
        expect(p.emphasis).toEqual(['upper']);
    });
    it('finds stelliums by sign and by house, with three or more planets', () => {
        const p = buildPortrait(chart());
        expect(p.stelliumSigns.map((s) => s.sign).sort()).toEqual(['capricorn', 'scorpio']);
        expect(p.stelliumSigns.find((s) => s.sign === 'scorpio')!.points).toEqual(['moon', 'jupiter', 'pluto']);
        expect(p.stelliumHouses).toEqual([]); // no house holds three
        const crowded = buildPortrait(chart({points: chart().points.map((x) => (x.id === 'mars' ? pt('mars', 'taurus', 9) : x))}));
        expect(crowded.stelliumHouses).toEqual([{house: 9, points: ['sun', 'mercury', 'mars']}]);
    });
    it('lists retrograde planets Mercury to Pluto but never the Sun or Moon', () => {
        expect(buildPortrait(chart()).retrogrades).toEqual(['mercury']);
    });
    it('finds a planet that rules two of the Sun, Moon and Ascendant signs', () => {
        // Sun in Taurus and Ascendant in Libra are both ruled by Venus
        const p = buildPortrait(chart({points: chart().points.map((x) => (x.id === 'sun' ? pt('sun', 'taurus', 9) : x))}));
        expect(p.rulersOfBigThree).toEqual([{id: 'venus', of: ['sun', 'asc']}]);
        expect(buildPortrait(chart()).rulersOfBigThree).toEqual([]);
    });
    it('leaves out everything that needs the houses and angles when the birth time is unknown', () => {
        const p = buildPortrait(chart({timeUnknown: true}));
        expect(p.halves).toBeNull();
        expect(p.emphasis).toEqual([]);
        expect(p.chartRuler).toEqual([]);
        expect(p.sect).toBeNull();
        expect(p.stelliumHouses).toEqual([]);
        expect(p.stelliumSigns.length).toBe(2); // signs still known
    });
});
