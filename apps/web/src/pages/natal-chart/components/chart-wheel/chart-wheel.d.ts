import NatalChartModel, {AspectModel, ChartPointModel} from '../../models/natal-chart.model';

export interface IOuterRing {
    label: string;
    points: ChartPointModel[];
    /** Cross aspects: p1 = outer point id, p2 = inner point id */
    aspects: AspectModel[];
}

export interface IChartWheel {
    chart: NatalChartModel;
    /** Bi-wheel: transits or the partner chart on an outer ring */
    outer?: IOuterRing;
    /** Hovered or focused point: its aspects light up, everything else dims */
    activeId: string | null;
    /** Selected point (shown in the interpretation panel); highlighted, no dimming */
    selectedId: string | null;
    onActivate: (id: string | null) => void;
    onSelect: (id: string) => void;
}
