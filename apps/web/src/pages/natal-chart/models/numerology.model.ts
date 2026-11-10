// Typed view of /api/numerology. Every number comes from the engine.

export interface INumerologyNumber {
    value: number;
    compound: number;
    master: boolean;
    karmicDebt: number | null;
}

export interface INumerologyLetter {
    letter: string;
    base: string;
    value: number;
    vowel: boolean;
}

export default class NumerologyModel {
    public numbers: Record<string, INumerologyNumber | null> = {};
    public personalYear: number | null = null;
    public personalYearOf: number | null = null;
    public personalMonth: number | null = null;
    public letters: INumerologyLetter[] = [];
    public ignored: string[] = [];

    constructor(item: any) {
        this._setNumbers(item);
        this._setPersonal(item);
        this._setLetters(item);
    }

    private _setNumbers(item: any) {
        for (const key of ['lifePath', 'expression', 'soulUrge', 'personality', 'birthday', 'maturity']) {
            this.numbers[key] = item?.[key] ?? null;
        }
    }

    private _setPersonal({personalYear, personalMonth}: any) {
        this.personalYear = personalYear?.value ?? null;
        this.personalYearOf = personalYear?.year ?? null;
        this.personalMonth = personalMonth?.value ?? null;
    }

    private _setLetters({letters, ignored}: any) {
        this.letters = letters ?? [];
        this.ignored = ignored ?? [];
    }
}
