// Typed view of /api/charts/bazi-years. Every value comes from the engine (lunar_python).
import {IBranch, ILuckPillar, IStem} from './bazi.model';

export interface IAnnualPillar {
    year: number;
    ganZhi: string;
    stem: IStem;
    branch: IBranch;
    tenGod: string;
    ownAnimal: boolean;
    relations: Partial<Record<'year' | 'month' | 'day' | 'hour', string>>;
    luck: ILuckPillar | null;
}

export default class BaziYearsModel {
    public years: IAnnualPillar[] = [];

    constructor(item: any) {
        this._setYears(item);
    }

    private _setYears({years}: any) {
        this.years = years ?? [];
    }
}
