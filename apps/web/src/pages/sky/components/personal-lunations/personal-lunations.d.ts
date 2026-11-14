import {IBirthInput} from 'store/store';

export interface IPersonalLunations {
    input: IBirthInput;
    /** First day, YYYY-MM-DD */
    start: string;
    days: number;
    /** Show only the first N lunations */
    limit?: number;
    /** With `limit`: a button reveals the rest */
    expandable?: boolean;
}
