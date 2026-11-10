import {IBirthInput} from 'store/store';

export interface IBirthForm {
    initialValue: IBirthInput | null;
    loading: boolean;
    onSubmit: (input: IBirthInput) => void;
    submitLabel?: string;
    showNote?: boolean;
}

export interface IBirthFormValues {
    name?: string;
    date?: import('dayjs').Dayjs;
    time?: import('dayjs').Dayjs;
    timeUnknown: boolean;
    place?: string;
    houseSystem: IBirthInput['houseSystem'];
}
