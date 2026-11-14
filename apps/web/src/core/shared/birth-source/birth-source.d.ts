import {Dayjs} from 'dayjs';
import {IBirthInput} from 'store/store';
import {BirthMode} from 'core/helpers/use-birth-source';

export interface IBirthSource {
    chartInput: IBirthInput | null;
    mode: BirthMode;
    onMode: (v: string | number) => void;
    birth: Dayjs | null;
    onBirth: (v: Dayjs | null) => void;
    showDate: boolean;
}
