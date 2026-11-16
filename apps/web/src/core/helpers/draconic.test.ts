import {describe, expect, it} from 'vitest';
import {draconicContacts, draconicPoints, shift} from './draconic';

const pt = (id: string, longitude: number) => ({id, longitude});

describe('draconic chart', () => {
    it('puts the North Node at 0 Aries and wraps below zero', () => {
        expect(shift(100, 100)).toBe(0);
        expect(shift(10, 350)).toBe(20);
        expect(shift(350, 10)).toBe(340);
    });
    it('shifts the planets by the node longitude and names the sign', () => {
        const d = draconicPoints([pt('northNode', 100), pt('sun', 145), pt('moon', 50)]);
        expect(d.find((p) => p.id === 'sun')).toMatchObject({sign: 'taurus', degree: 15});
        expect(d.find((p) => p.id === 'moon')!.longitude).toBe(310);
    });
    it('gives nothing without a North Node', () => {
        expect(draconicPoints([pt('sun', 10)])).toEqual([]);
    });
    it('finds a draconic point on another natal point, closest first, never on itself', () => {
        // node 100: draconic Sun = 80 - 100 -> 340; natal Moon at 340.5 is a contact
        const c = draconicContacts([pt('northNode', 100), pt('sun', 80), pt('moon', 340.5), pt('venus', 200)]);
        expect(c).toEqual([{draconic: 'sun', natal: 'moon', orb: 0.5}]);
    });
});
