import {ILang} from 'assets/lang/lang';

export type IHouseSystem = 'P' | 'K' | 'W' | 'A';

/** What the user typed. Birth data is personal: kept in memory only, persisted only when saved explicitly. */
export interface IBirthInput {
    name: string | null;
    date: string;          // YYYY-MM-DD
    time: string | null;   // HH:mm, null = unknown
    latitude: number;
    longitude: number;
    timezone: string;
    place: string;
    houseSystem: IHouseSystem;
}

export interface ISavedChart {
    id: string;
    savedAt: string;
    input: IBirthInput;
}

export interface IState {
    loader: boolean;
    locale: ILang;
    ambientSound: boolean;
    birthInput: IBirthInput | null;   // NOT persisted
    savedCharts: ISavedChart[];       // persisted, opt-in only
}
