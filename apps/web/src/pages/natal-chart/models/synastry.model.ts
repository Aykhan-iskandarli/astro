import NatalChartModel, {AspectModel} from './natal-chart.model';

export interface IOverlay {
    id: string;
    house: number;
}

export interface IScoreRule {
    rule: string;
    points: number;
    details: string;
}

// Typed view of /api/charts/synastry. p1 of every aspect belongs to `first`, p2 to `second`.
export default class SynastryModel {
    public first: NatalChartModel | null = null;
    public second: NatalChartModel | null = null;
    public aspects: AspectModel[] = [];
    public firstInSecond: IOverlay[] | null = null;
    public secondInFirst: IOverlay[] | null = null;
    public elements: Record<string, {first: number; second: number}> = {};
    public scoreValue: number | null = null;
    public scoreLevel: string | null = null;
    public scoreBreakdown: IScoreRule[] = [];
    public scoreExcluded: IScoreRule[] = [];

    constructor(item: any) {
        this._setCharts(item);
        this._setAspects(item);
        this._setOverlays(item);
        this._setElements(item);
        this._setScore(item);
    }

    private _setCharts({first, second}: any) {
        this.first = first ? new NatalChartModel(first) : null;
        this.second = second ? new NatalChartModel(second) : null;
    }

    private _setAspects({aspects}: any) {
        this.aspects = aspects?.map((a: any) => new AspectModel(a)) ?? [];
    }

    private _setOverlays({overlays}: any) {
        this.firstInSecond = overlays?.firstInSecond ?? null;
        this.secondInFirst = overlays?.secondInFirst ?? null;
    }

    private _setElements({elements}: any) {
        this.elements = elements ?? {};
    }

    private _setScore({score}: any) {
        this.scoreValue = score?.value ?? null;
        this.scoreLevel = score?.level ?? null;
        this.scoreBreakdown = score?.breakdown ?? [];
        this.scoreExcluded = score?.excluded ?? [];
    }
}
