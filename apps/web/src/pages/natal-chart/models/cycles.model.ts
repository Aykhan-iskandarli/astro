// Typed view of /api/charts/cycles: planetary returns and annual profections. Every date comes from the engine.

export interface IReturnPass {
    at: string;          // UTC ISO
    retrograde: boolean;
}

export interface IPlanetReturn {
    number: number;
    ageYears: number;
    passes: IReturnPass[];
    status: 'past' | 'now' | 'future';
}

export interface IProfectionYear {
    age: number;
    start: string;
    end: string;
    house: number;
    sign: string;
    lord: string;
    lordNatal: {sign: string; house: number | null} | null;
}

export default class CyclesModel {
    public returns: Record<string, IPlanetReturn[]> = {};
    public current: IProfectionYear | null = null;
    public years: IProfectionYear[] = [];
    public horizonYears: number = 100;

    constructor(item: any) {
        this._setReturns(item);
        this._setProfections(item);
        this._setMeta(item);
    }

    private _setReturns({returns}: any) {
        this.returns = returns ?? {};
    }

    private _setProfections({profections}: any) {
        this.current = profections?.current ?? null;
        this.years = profections?.years ?? [];
    }

    private _setMeta({meta}: any) {
        this.horizonYears = meta?.horizonYears ?? 100;
    }
}
