import {IBirthInput} from 'store/store';

export interface IUpcomingPersonal {
    input: IBirthInput;
    /** Local date, YYYY-MM-DD */
    today: string;
}
