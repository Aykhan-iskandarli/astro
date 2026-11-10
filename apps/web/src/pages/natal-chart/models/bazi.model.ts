// Typed view of /api/charts/bazi. Every value comes from the engine (lunar_python).

export interface IStem {
    id: string;
    char: string;
    element: string;
    yang: boolean;
    tenGod?: string | null;
}

export interface IBranch extends IStem {
    animal: string;
}

export interface IPillar {
    stem: IStem;
    branch: IBranch;
    tenGod: string | null;
    hidden: IStem[];
}

export interface ILuckPillar {
    ganZhi: string;
    stem: IStem;
    branch: IBranch;
    tenGod: string;
    startYear: number;
    endYear: number;
    startAge: number;
}

export default class BaziModel {
    public dayMaster: IStem | null = null;
    public pillars: Record<'year' | 'month' | 'day' | 'hour', IPillar | null> = {year: null, month: null, day: null, hour: null};
    public elements: Record<string, number> = {};
    public animal: string | null = null;
    public lunarDate: string | null = null;
    public luckForward: boolean | null = null;
    public luckStart: {years: number; months: number; days: number} | null = null;
    public luck: ILuckPillar[] = [];

    constructor(item: any) {
        this._setCore(item);
        this._setLuck(item);
    }

    private _setCore({dayMaster, pillars, elements, animal, lunarDate}: any) {
        this.dayMaster = dayMaster ?? null;
        this.pillars = {year: pillars?.year ?? null, month: pillars?.month ?? null, day: pillars?.day ?? null, hour: pillars?.hour ?? null};
        this.elements = elements ?? {};
        this.animal = animal ?? null;
        this.lunarDate = lunarDate ?? null;
    }

    private _setLuck({luck}: any) {
        this.luckForward = luck?.forward ?? null;
        this.luckStart = luck?.start ?? null;
        this.luck = luck?.pillars ?? [];
    }
}
