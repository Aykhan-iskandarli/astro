import {describe, expect, it} from 'vitest';
import {chartThemes, mainThemes} from './themes';

describe('chartThemes', () => {
    it('counts sign, house, the angles and an angular ruler into the same theme', () => {
        // Moon in Cancer in the 4th house (Moon rules theme 4 and stands on an angle), Ascendant Cancer
        const themes = chartThemes([
            {id: 'moon', sign: 'cancer', house: 4},
            {id: 'sun', sign: 'leo', house: 5},
            {id: 'mars', sign: 'aries', house: 9},
        ], 'cancer', 'pisces');
        const four = themes.find((t) => t.theme === 4)!;
        expect(four.score).toBe(2 + 2 + 1 + 2); // sign (light), house (light), ruler on an angle, Ascendant
        expect(four.sources.map((s) => s.kind)).toEqual(['sign', 'house', 'rulerAngular', 'asc']);
        expect(themes[0].theme).toBe(4);
        expect(themes.find((t) => t.theme === 5)!.score).toBe(4);
        expect(themes.find((t) => t.theme === 12)!.score).toBe(1);
    });

    it('works without houses and angles (birth time unknown) and ignores points outside the planets', () => {
        const themes = chartThemes([{id: 'venus', sign: 'taurus'}, {id: 'chiron', sign: 'taurus'}, {id: null, sign: 'aries'}], null, null);
        expect(themes[0]).toMatchObject({theme: 2, score: 1});
        expect(themes.filter((t) => t.score > 0)).toHaveLength(1);
    });
});

describe('generational planets', () => {
    it('counts Uranus, Neptune and Pluto by house only', () => {
        const themes = chartThemes([{id: 'neptune', sign: 'capricorn', house: 4}, {id: 'uranus', sign: 'capricorn', house: null}], null, null);
        expect(themes.find((t) => t.theme === 10)!.score).toBe(0);
        expect(themes.find((t) => t.theme === 4)!.sources).toEqual([{kind: 'house', point: 'neptune', weight: 1}]);
    });
});

describe('mainThemes', () => {
    it('keeps at most three themes that reach the minimum, highest first', () => {
        const got = mainThemes([
            {id: 'sun', sign: 'cancer', house: 4}, {id: 'moon', sign: 'cancer', house: 10},
            {id: 'mercury', sign: 'gemini', house: 3}, {id: 'venus', sign: 'gemini', house: 3},
        ], 'cancer', 'aries');
        expect(got.map((t) => t.theme)).toEqual([4, 3]); // theme 10 (Moon in the 10th) has 2, below the minimum
        expect(got.every((t) => t.score >= 3)).toBe(true);
    });
});
