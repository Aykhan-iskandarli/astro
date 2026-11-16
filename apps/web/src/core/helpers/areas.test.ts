import {describe, expect, it} from 'vitest';
import {areaHouses, aspectsToPoint, IAreaChart, significators} from './areas';

const chart = (over: Partial<IAreaChart> = {}): IAreaChart => ({
    points: [
        {id: 'sun', sign: 'gemini', house: 9, retrograde: false, dignity: null, longitude: 84},
        {id: 'saturn', sign: 'capricorn', house: 4, retrograde: true, dignity: 'domicile', longitude: 280},
        {id: 'venus', sign: 'taurus', house: 8, retrograde: false, dignity: 'domicile', longitude: 50},
        {id: 'mars', sign: 'aries', house: 7, retrograde: false, dignity: 'domicile', longitude: 12},
        {id: 'moon', sign: 'pisces', house: 6, retrograde: false, dignity: null, longitude: 340},
    ],
    houses: [
        {number: 6, sign: 'pisces', rulers: [{id: 'jupiter', sign: 'cancer', house: 12, kind: 'traditional'}, {id: 'neptune', sign: 'capricorn', house: 4, kind: 'modern'}]},
        {number: 10, sign: 'cancer', rulers: [{id: 'moon', sign: 'pisces', house: 6, kind: 'traditional'}]},
    ],
    timeUnknown: false,
    ...over,
});

describe('areaHouses', () => {
    it('gives the cusp sign, the rulers with their condition and the planets inside', () => {
        const [h6, h10] = areaHouses(chart(), [6, 10]);
        expect(h6.cuspSign).toBe('pisces');
        expect(h6.occupants).toEqual(['moon']);
        expect(h10.rulers).toEqual([{id: 'moon', sign: 'pisces', house: 6, kind: 'traditional', dignity: null, retrograde: false}]);
        expect(h10.occupants).toEqual([]);
    });
    it('keeps a modern ruler beside the traditional one', () => {
        expect(areaHouses(chart(), [6])[0].rulers.map((r) => r.kind)).toEqual(['traditional', 'modern']);
    });
    it('is empty without a birth time', () => {
        expect(areaHouses(chart({timeUnknown: true}), [6, 10])).toEqual([]);
    });
    it('copes with a house the chart does not list', () => {
        expect(areaHouses(chart(), [2])[0]).toEqual({house: 2, cuspSign: null, rulers: [], occupants: []});
    });
});

describe('significators', () => {
    it('reports sign, house, dignity and retrograde, and skips a planet that is missing', () => {
        const s = significators(chart(), ['saturn', 'jupiter']);
        expect(s).toEqual([{id: 'saturn', sign: 'capricorn', house: 4, dignity: 'domicile', retrograde: true}]);
    });
    it('hides the house when the birth time is unknown', () => {
        expect(significators(chart({timeUnknown: true}), ['saturn'])[0].house).toBeNull();
    });
});

describe('aspectsToPoint', () => {
    it('finds nothing when no planet is within the default orb', () => {
        expect(aspectsToPoint(chart().points, 90)).toEqual([]); // the Sun at 84 is 6 degrees away, outside 5
    });
    it('orders several by closeness', () => {
        const pts = [
            {id: 'sun', sign: 'aries', house: 1, retrograde: false, longitude: 94},
            {id: 'moon', sign: 'aries', house: 1, retrograde: false, longitude: 90.5},
            {id: 'mars', sign: 'aries', house: 1, retrograde: false, longitude: 213},
        ];
        expect(aspectsToPoint(pts, 90).map((r) => [r.id, r.aspect])).toEqual([['moon', 'conjunction'], ['mars', 'trine'], ['sun', 'conjunction']]);
    });
    it('uses the orb given', () => {
        const res = aspectsToPoint(chart().points, 90, 7);
        expect(res).toEqual([{id: 'sun', aspect: 'conjunction', orb: 6}]);
    });
    it('handles the wrap-around at 360 degrees', () => {
        const pts = [{id: 'mars', sign: 'aries', house: 1, retrograde: false, longitude: 2}];
        expect(aspectsToPoint(pts, 358, 5)).toEqual([{id: 'mars', aspect: 'conjunction', orb: 4}]);
    });
    it('returns nothing without a point', () => {
        expect(aspectsToPoint(chart().points, null)).toEqual([]);
    });
});
