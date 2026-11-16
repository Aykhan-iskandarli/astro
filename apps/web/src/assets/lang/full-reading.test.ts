import {describe, expect, it} from 'vitest';
import {aspectPairText, aspectReading, fullReading, getContent, loadContent} from '@astra/content';

describe('fullReading', () => {
    it('layers the Big Three text, the planet, the sign and the house', () => {
        const r = fullReading('az', 'sun', 'gemini', 10, ['trine', 'square', 'trine']);
        expect(r.specific).toContain('Əkizlərdədir');
        expect(r.planet).toBeTruthy();
        expect(r.sign).toBeTruthy();
        expect(r.house).toBeTruthy();
        expect(r.aspects.map((a) => a.type)).toEqual(['trine', 'square']); // each type once
    });
    it('has no sign-specific text for the outer planets, but still reads the layers', () => {
        const r = fullReading('az', 'saturn', 'aries', null);
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
                for (const body of ['sun', 'moon', 'asc', 'mercury', 'venus', 'mars']) expect(Object.keys(reading.bigThree[body])).toContain(id);
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

describe('career texts', () => {
    it('cover every Midheaven sign, every house of the ruler and every planet of work in both languages', async () => {
        await loadContent('en');
        for (const lang of ['az', 'en'] as const) {
            const c = getContent(lang);
            const career = c.career as {mc: Record<string, string>; ruler: Record<string, string>; planet: Record<string, string>};
            for (const id of Object.keys(c.signs)) expect(career.mc[id]).toBeTruthy();
            for (let h = 1; h <= 12; h++) expect(career.ruler[String(h)]).toBeTruthy();
            for (const id of ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn']) expect(career.planet[id]).toBeTruthy();
        }
    });
});

describe('finance texts', () => {
    it('cover every 2nd house sign, every house of the ruler and of the Part of Fortune, and every planet of money in both languages', async () => {
        await loadContent('en');
        for (const lang of ['az', 'en'] as const) {
            const c = getContent(lang);
            const fin = c.finance as {cusp: Record<string, string>; ruler: Record<string, string>; fortune: Record<string, string>; planet: Record<string, string>};
            for (const id of Object.keys(c.signs)) expect(fin.cusp[id]).toBeTruthy();
            for (let h = 1; h <= 12; h++) {
                expect(fin.ruler[String(h)]).toBeTruthy();
                expect(fin.fortune[String(h)]).toBeTruthy();
            }
            for (const id of ['venus', 'jupiter', 'saturn', 'mercury', 'mars']) expect(fin.planet[id]).toBeTruthy();
        }
    });
});

describe('health texts', () => {
    it('cover every Ascendant sign, 6th house cusp sign, house of the ruler and planet of vitality in both languages', async () => {
        await loadContent('en');
        for (const lang of ['az', 'en'] as const) {
            const c = getContent(lang);
            const h = c.health as {asc: Record<string, string>; cusp: Record<string, string>; ruler: Record<string, string>; planet: Record<string, string>};
            for (const id of Object.keys(c.signs)) {
                expect(h.asc[id]).toBeTruthy();
                expect(h.cusp[id]).toBeTruthy();
            }
            for (let n = 1; n <= 12; n++) expect(h.ruler[String(n)]).toBeTruthy();
            for (const id of ['sun', 'moon', 'mercury', 'mars', 'saturn']) expect(h.planet[id]).toBeTruthy();
        }
    });
});

describe('aspectReading', () => {
    it('has a long text for every pair of the ten planets and a tone for every major aspect type', async () => {
        await loadContent('en');
        const ids = ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'pluto'];
        for (const lang of ['az', 'en'] as const) {
            for (let i = 0; i < ids.length; i++) {
                for (let j = i + 1; j < ids.length; j++) {
                    const r = aspectReading(lang, ids[i], ids[j], 'square');
                    expect(r.pair, `${ids[i]}-${ids[j]}`).toBeTruthy();
                    expect(aspectReading(lang, ids[j], ids[i], 'square').pair).toBe(r.pair); // the order does not matter
                }
            }
            for (const t of ['conjunction', 'sextile', 'square', 'trine', 'opposition']) {
                const r = aspectReading(lang, 'sun', 'moon', t);
                expect(r.aspect && r.tone).toBeTruthy();
            }
        }
    });
    it('falls back to the planets and gives no tone for a minor aspect', () => {
        const r = aspectReading('az', 'sun', 'mc', 'quincunx');
        expect(r.pair).toBeNull();
        expect(r.first && r.second).toBeTruthy();
        expect(r.tone).toBeNull();
        expect(r.aspect).toBeNull();
    });
});
