import NatalChartModel from '../../models/natal-chart.model';

export interface IBigThree {
    chart: NatalChartModel;
    /** Opens the point in the wheel + interpretation panel */
    onSelect: (id: string) => void;
}
