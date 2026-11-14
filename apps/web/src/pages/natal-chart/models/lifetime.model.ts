// Typed view of /api/charts/lifetime. Every value comes from the engine.
import {ILuckPillar} from './bazi.model';
import {IEpisode} from './transformations.model';

export interface ILifePeriod {
    lord: string;
    start: string;
    end: string;
}

export default class LifetimeModel {
    public timeUnknown = false;
    public birth = '';
    public firdaria: ILifePeriod[] | null = null;
    public dasha: ILifePeriod[] = [];
    public luck: ILuckPillar[] = [];
    public cycles: IEpisode[] = [];

    constructor(item: any) {
        this._setMeta(item);
        this._setPeriods(item);
    }

    private _setMeta({meta, birth}: any) {
        this.timeUnknown = meta?.timeUnknown ?? false;
        this.birth = birth ?? '';
    }

    private _setPeriods({firdaria, dasha, luck, cycles}: any) {
        this.firdaria = firdaria?.periods ?? null;
        this.dasha = dasha ?? [];
        this.luck = luck?.pillars ?? [];
        this.cycles = cycles ?? [];
    }
}
