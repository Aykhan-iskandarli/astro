import DestinyMatrixModel from '../../models/destiny-matrix.model';

export interface IMatrixAge {
    matrix: DestinyMatrixModel;
    /** Age now in years (fractional), or null when the birth date is unknown */
    currentAge: number | null;
}
