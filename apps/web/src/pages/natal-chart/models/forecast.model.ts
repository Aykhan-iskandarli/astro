import NatalChartModel, {AspectModel} from './natal-chart.model';

// /api/charts/returns
export class ReturnModel {
    public at: string | null = null;
    public local: string | null = null;
    public placeName: string | null = null;
    public relocated: boolean = false;
    public chart: NatalChartModel | null = null;

    constructor(item: any) {
        this._setMoment(item);
        this._setChart(item);
    }

    private _setMoment({at, local, location, meta}: any) {
        this.at = at ?? null;
        this.local = local ?? null;
        this.placeName = location?.name ?? null;
        this.relocated = meta?.relocated ?? false;
    }

    private _setChart({chart}: any) {
        this.chart = chart ? new NatalChartModel(chart) : null;
    }
}

// /api/charts/progressions — the progressed chart body has the natal shape; p1 of aspectsToNatal is progressed
export class ProgressionModel {
    public target: string | null = null;
    public progressedMoment: string | null = null;
    public ageYears: number | null = null;
    public solarArc: number | null = null;
    public chart: NatalChartModel | null = null;
    public aspectsToNatal: AspectModel[] = [];

    constructor(item: any) {
        this._setMeta(item);
        this._setChart(item);
        this._setAspects(item);
    }

    private _setMeta({target, progressedMoment, ageYears, solarArc}: any) {
        this.target = target ?? null;
        this.progressedMoment = progressedMoment ?? null;
        this.ageYears = ageYears ?? null;
        this.solarArc = solarArc ?? null;
    }

    private _setChart({chart, meta}: any) {
        this.chart = chart ? new NatalChartModel({...chart, meta: {timeUnknown: meta?.timeUnknown}}) : null;
    }

    private _setAspects({aspectsToNatal}: any) {
        this.aspectsToNatal = aspectsToNatal?.map((a: any) => new AspectModel(a)) ?? [];
    }
}
