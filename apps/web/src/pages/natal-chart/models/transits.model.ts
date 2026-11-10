import {AspectModel, ChartPointModel} from './natal-chart.model';

// Typed view of /api/charts/transits. p1 of every aspect is a transit point, p2 a natal point.
export default class TransitsModel {
    public at: string | null = null;
    public points: ChartPointModel[] = [];
    public aspects: AspectModel[] = [];
    public lunarPhase: string | null = null;

    constructor(item: any) {
        this._setAt(item);
        this._setPoints(item);
        this._setAspects(item);
        this._setLunarPhase(item);
    }

    private _setAt({at}: any) {
        this.at = at ?? null;
    }

    private _setPoints({points}: any) {
        this.points = points?.map((p: any) => new ChartPointModel(p)) ?? [];
    }

    private _setAspects({aspects}: any) {
        this.aspects = aspects?.map((a: any) => new AspectModel(a)) ?? [];
    }

    private _setLunarPhase({lunarPhase}: any) {
        this.lunarPhase = lunarPhase?.phase ?? null;
    }
}
