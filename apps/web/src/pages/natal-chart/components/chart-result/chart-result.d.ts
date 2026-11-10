import NatalChartModel from '../../models/natal-chart.model';
import DestinyMatrixModel from '../../models/destiny-matrix.model';

export interface IChartResult {
    chart: NatalChartModel;
    matrix: DestinyMatrixModel | null;
    matrixFailed: boolean;
    onEdit: () => void;
    onSave: () => void;
    saved: boolean;
}
