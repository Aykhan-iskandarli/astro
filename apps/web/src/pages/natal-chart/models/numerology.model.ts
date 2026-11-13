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

export interface INumerologyPinnacle {
    index: number;
    value: number;
    master: boolean;
    challenge: number;
    fromAge: number;
    toAge: number | null;
    fromYear: number;
    toYear: number | null;
    current: boolean;
}

export interface ILoShu {
    grid: number[][];
    counts: Record<string, number>;
    missing: number[];
    lines: {id: string; numbers: number[]; complete: boolean; empty: boolean}[];
}

export default class NumerologyModel {
    public numbers: Record<string, INumerologyNumber | null> = {};
    public personalYear: number | null = null;
    public personalYearOf: number | null = null;
    public personalMonth: number | null = null;
    public personalDay: number | null = null;
    public pinnacles: INumerologyPinnacle[] = [];
    public loShu: ILoShu | null = null;
    public letters: INumerologyLetter[] = [];
    public ignored: string[] = [];

    constructor(item: any) {
        this._setNumbers(item);
        this._setPersonal(item);
        this._setLetters(item);
        this._setPinnacles(item);
    }

    private _setNumbers(item: any) {
        for (const key of ['lifePath', 'expression', 'soulUrge', 'personality', 'birthday', 'maturity']) {
            this.numbers[key] = item?.[key] ?? null;
        }
    }

    private _setPinnacles({pinnacles, loShu}: any) {
        this.pinnacles = pinnacles ?? [];
        this.loShu = loShu ?? null;
    }

    private _setPersonal({personalYear, personalMonth, personalDay}: any) {
        this.personalDay = personalDay?.value ?? null;
        this.personalYear = personalYear?.value ?? null;
        this.personalYearOf = personalYear?.year ?? null;
        this.personalMonth = personalMonth?.value ?? null;
    }

    private _setLetters({letters, ignored}: any) {
        this.letters = letters ?? [];
        this.ignored = ignored ?? [];
    }
}
