import {RetrogradeModel} from '../../models/forecast-year.model';

export interface IRetrogradeList {
    retrogrades: RetrogradeModel[];
    /** The range the strip covers (ISO dates) */
    from: string;
    to: string;
}
