import NatalChartModel from '../../models/natal-chart.model';

export interface IInterpretationPanel {
    chart: NatalChartModel;
    pointId: string | null;
}
