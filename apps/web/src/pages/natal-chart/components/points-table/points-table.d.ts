import NatalChartModel from '../../models/natal-chart.model';

export interface IPointsTable {
    chart: NatalChartModel;
    activeId: string | null;
    onActivate: (id: string | null) => void;
    onSelect: (id: string) => void;
}
