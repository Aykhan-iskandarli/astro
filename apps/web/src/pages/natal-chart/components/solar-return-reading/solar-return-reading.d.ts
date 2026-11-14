import {ChartPointModel, ChartPositionModel} from '../../models/natal-chart.model';

export interface ISolarReturnReading {
    /** The Sun in the return chart (its house is the return chart house) */
    sun: ChartPointModel | null;
    asc: ChartPositionModel | null;
}
