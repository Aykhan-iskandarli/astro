import {describe, expect, it} from 'vitest';
import {dignityRow, dignityTable, ELEMENT_OF, FACE_ORDER, faceRuler, SCORES, SEVEN, SIGNS, TERMS, termRuler, TRIPLICITY} from './dignity';

describe('the terms table', () => {
    it('divides every sign into five terms ending at 30 degrees, with the five classical planets', () => {
        for (const sign of SIGNS) {
            const t = TERMS[sign];
            expect(t.length).toBe(5);
            expect(t[4][1]).toBe(30);
            expect(new Set(t.map(([p]) => p)).size).toBe(5);
            expect(t.map(([p]) => p).every((p) => ['mercury', 'venus', 'mars', 'jupiter', 'saturn'].includes(p))).toBe(true);
            expect(t.every(([, end], i) => i === 0 || end > t[i - 1][1])).toBe(true);
        }
    });
    it('gives each planet its classical total of degrees (Saturn 57, Jupiter 79, Mars 66, Venus 82, Mercury 76)', () => {
        const total: Record<string, number> = {};
        for (const sign of SIGNS) TERMS[sign].forEach(([p, end], i) => {
            total[p] = (total[p] ?? 0) + end - (i === 0 ? 0 : TERMS[sign][i - 1][1]);
        });
        expect(total).toEqual({saturn: 57, jupiter: 79, mars: 66, venus: 82, mercury: 76});
    });
    it('finds the ruler of a term', () => {
        expect(termRuler('aries', 3)).toBe('jupiter');
        expect(termRuler('aries', 6)).toBe('venus'); // 6.0 starts Venus's term
        expect(termRuler('pisces', 29.9)).toBe('saturn');
    });
});

describe('the faces', () => {
    it('follow the Chaldean order from Mars at 0 Aries, three faces per sign', () => {
        expect(faceRuler('aries', 0)).toBe('mars');
        expect(faceRuler('aries', 10)).toBe('sun');
        expect(faceRuler('aries', 25)).toBe('venus');
        expect(faceRuler('taurus', 5)).toBe('mercury');
        expect(faceRuler('pisces', 25)).toBe('mars'); // the last face of the zodiac closes the cycle at Mars
        expect(FACE_ORDER.length).toBe(7);
    });
    it('match the published table for a few signs', () => {
        const table: Record<string, string[]> = {
            gemini: ['jupiter', 'mars', 'sun'], virgo: ['sun', 'venus', 'mercury'], scorpio: ['mars', 'sun', 'venus'],
            sagittarius: ['mercury', 'moon', 'saturn'], capricorn: ['jupiter', 'mars', 'sun'], pisces: ['saturn', 'jupiter', 'mars'],
        };
        for (const [sign, rulers] of Object.entries(table)) expect([0, 10, 20].map((d) => faceRuler(sign, d))).toEqual(rulers);
    });
});

describe('the triplicities', () => {
    it('give each element three different rulers from the seven planets', () => {
        for (const e of Object.keys(TRIPLICITY) as (keyof typeof TRIPLICITY)[]) {
            expect(new Set(TRIPLICITY[e]).size).toBe(3);
            expect(TRIPLICITY[e].every((p) => SEVEN.includes(p))).toBe(true);
        }
        expect(ELEMENT_OF.leo).toBe('fire');
    });
});

describe('dignityRow', () => {
    it('scores a planet by Lilly: the Sun at 5 Leo in a day chart has domicile (+5) and triplicity (+3) and no more', () => {
        const r = dignityRow('sun', 'leo', 5, true);
        expect(r.dignities).toEqual(['domicile', 'triplicity']);
        expect(r.score).toBe(SCORES.domicile + SCORES.triplicity);
        expect(r.peregrine).toBe(false);
    });
    it('uses the night triplicity ruler in a night chart', () => {
        expect(dignityRow('jupiter', 'aries', 25, false).dignities).toContain('triplicity');
        expect(dignityRow('jupiter', 'aries', 25, true).dignities).not.toContain('triplicity');
    });
    it('gives exaltation, and the fall in the opposite sign', () => {
        expect(dignityRow('moon', 'taurus', 15, true).dignities).toContain('exaltation');
        const f = dignityRow('moon', 'scorpio', 15, true);
        expect(f.fall).toBe(true);
        expect(f.score).toBeLessThan(0);
    });
    it('gives detriment in the sign opposite the domicile', () => {
        expect(dignityRow('sun', 'aquarius', 15, true).detriment).toBe(true);
        expect(dignityRow('venus', 'aries', 15, true).detriment).toBe(true);
    });
    it('marks a planet with no dignity as peregrine (-5), but only when the sect is known', () => {
        const r = dignityRow('mars', 'gemini', 2, true); // at 2 degrees of Gemini: term of Mercury, face of Jupiter, day triplicity of Saturn
        expect(r.dignities).toEqual([]);
        expect(r.peregrine).toBe(true);
        expect(r.score).toBe(SCORES.peregrine);
        expect(dignityRow('mars', 'gemini', 2, null).peregrine).toBe(false);
    });
    it('finds domicile and the day triplicity for Venus at 24 Taurus', () => {
        const r = dignityRow('venus', 'taurus', 24, true);
        expect(r.dignities).toContain('domicile');
        expect(r.dignities).toContain('triplicity'); // the day ruler of earth is Venus
    });
});

describe('dignityTable', () => {
    it('lists only the seven traditional planets and skips missing ones', () => {
        const t = dignityTable([
            {id: 'sun', sign: 'gemini', degree: 24, minute: 1}, {id: 'uranus', sign: 'capricorn', degree: 5, minute: 0}, {id: 'moon', sign: null, degree: null, minute: null},
        ], true);
        expect(t.map((r) => r.id)).toEqual(['sun']);
    });
});
