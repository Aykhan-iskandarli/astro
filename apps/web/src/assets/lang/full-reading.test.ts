import {describe, expect, it} from 'vitest';
import {aspectPairText, fullReading, getContent, loadContent} from '@astra/content';

describe('fullReading', () => {
    it('layers the Big Three text, the planet, the sign and the house', () => {
        const r = fullReading('az', 'sun', 'gemini', 10, ['trine', 'square', 'trine']);
        expect(r.specific).toContain('Əkizlərdədir');
        expect(r.planet).toBeTruthy();
        expect(r.sign).toBeTruthy();
        expect(r.house).toBeTruthy();
        expect(r.aspects.map((a) => a.type)).toEqual(['trine', 'square']); // each type once
    });
    it('has no Big Three text for other planets, but still reads the layers', () => {
        const r = fullReading('az', 'mars', 'aries', null);
        expect(r.specific).toBeNull();
        expect(r.planet && r.sign).toBeTruthy();
        expect(r.house).toBeNull();
    });
    it('covers every sign, house, aspect type and point in both full languages', async () => {
        await loadContent('en');
        for (const lang of ['az', 'en'] as const) {
            const c = getContent(lang);
            const reading = c.reading as {planet: object; sign: object; house: object; aspect: object; bigThree: Record<string, object>};
            for (const id of Object.keys(c.points)) expect(Object.keys(reading.planet)).toContain(id);
            for (const id of Object.keys(c.signs)) {
                expect(Object.keys(reading.sign)).toContain(id);
                for (const body of ['sun', 'moon', 'asc']) expect(Object.keys(reading.bigThree[body])).toContain(id);
            }
            for (let h = 1; h <= 12; h++) expect(Object.keys(reading.house)).toContain(String(h));
            for (const id of ['conjunction', 'opposition', 'trine', 'square', 'sextile']) expect(Object.keys(reading.aspect)).toContain(id);
        }
    });
});

describe('aspectPairText', () => {
    it('reads a planet to itself as the cycle of that aspect, and says nothing for an aspect that is not a cycle', async () => {
        await loadContent('en');
        expect(aspectPairText('en', 'saturn', 'saturn', 'conjunction')).toContain('Saturn return');
        expect(aspectPairText('en', 'uranus', 'uranus', 'opposition')).toContain('Uranus opposition');
        expect(aspectPairText('en', 'saturn', 'saturn', 'trine')).toBeNull();
        expect(aspectPairText('en', 'saturn', 'saturn')).toBe(getContent('en').planetCycles.saturn); // without an aspect: the general text
    });
    it('keeps the pair text for two different planets whatever the aspect', () => {
        expect(aspectPairText('az', 'pluto', 'saturn', 'square')).toBeTruthy();
        expect(aspectPairText('az', 'saturn', 'pluto', 'trine')).toBe(aspectPairText('az', 'pluto', 'saturn', 'square'));
    });
});

describe('transit reading coverage', () => {
    it('has a text for every transiting planet, aspect type and natal point the transit lists can show', async () => {
        await loadContent('en');
        for (const lang of ['az', 'en'] as const) {
            const tr = getContent(lang).transformations as {planet: object; aspect: object; target: object; cycle: Record<string, {name: string; text: string}>};
            for (const id of ['mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'pluto']) expect(Object.keys(tr.planet)).toContain(id);
            for (const id of ['conjunction', 'sextile', 'square', 'trine', 'opposition']) expect(Object.keys(tr.aspect)).toContain(id);
            for (const id of ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'pluto', 'asc', 'mc']) expect(Object.keys(tr.target)).toContain(id);
            for (const c of Object.values(tr.cycle)) expect(c.name && c.text).toBeTruthy();
        }
    });
});
