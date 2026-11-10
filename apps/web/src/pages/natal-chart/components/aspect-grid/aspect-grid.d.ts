import NatalChartModel from '../../models/natal-chart.model';

export interface IAspectGrid {
    chart: NatalChartModel;
    activeId: string | null;
    onActivate: (id: string | null) => void;
}
