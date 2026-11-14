import {PersonalLunationModel} from '../../models/personal-moon.model';

export interface ILunationList {
    lunations: PersonalLunationModel[];
    /** Without a birth time there are no houses or angles */
    timeUnknown: boolean;
    /** Show only the first N lunations */
    limit?: number;
    /** With `limit`: a button reveals the rest */
    expandable?: boolean;
}
