import NatalChartModel from '../../models/natal-chart.model';

export interface IKarmicPanel {
    chart: NatalChartModel;
}

export interface INodeContact {
    planet: string;
    kind: 'northNode' | 'southNode' | 'square';
    orb: number | null;
}
