import {IBirthInput} from 'store/store';

export interface ICompositeView {
    first: IBirthInput | null;
    second: IBirthInput | null;
    kind?: 'composite' | 'davison';
}
