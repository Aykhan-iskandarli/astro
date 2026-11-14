// Typed view of /api/charts/electional. Every value comes from the engine (Swiss Ephemeris).

export interface IHouseWindow {
    house: number;
    from: string;
    to: string;
}

export interface IVoidPeriod {
    start: string;
    end: string;
    sign: string;
    nextSign: string;
    continuesBefore: boolean;
    continuesAfter: boolean;
}

export interface IElectionDay {
    date: string;
    start: string;
    end: string;
    phase: string;
    waxing: boolean;
    illumination: number;
    signs: {sign: string; from: string | null}[];
    houses: IHouseWindow[] | null;
    voidOfCourse: IVoidPeriod[];
    retrograde: string[];
}

export default class ElectionalModel {
    public timeUnknown = false;
    public days: IElectionDay[] = [];

    constructor(item: any) {
        this._setMeta(item);
        this._setDays(item);
    }

    private _setMeta({meta}: any) {
        this.timeUnknown = meta?.timeUnknown ?? false;
    }

    private _setDays({days}: any) {
        this.days = days ?? [];
    }
}
