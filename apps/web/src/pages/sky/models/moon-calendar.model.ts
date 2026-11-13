// Typed view of /api/sky/moon: lunar days, Moon sign, phase and void-of-course periods for a city.

export interface IMoonDay {
    date: string;                                              // local calendar date at the chosen city
    lunarDays: {number: number; start: string | null}[];       // start null = began on an earlier day
    signs: {sign: string; from: string | null}[];              // from null = already in the sign at midnight
    phase: string;
    illumination: number;
    waxing: boolean;
}

export interface IVoidOfCourse {
    start: string;
    end: string;
    sign: string;
    nextSign: string;
    lastAspect: {body: string; aspect: string} | null;
}

export default class MoonCalendarModel {
    public days: IMoonDay[] = [];
    public voidOfCourse: IVoidOfCourse[] = [];
    public timezone: string = 'UTC';

    constructor(item: any) {
        this._setDays(item);
        this._setVoid(item);
        this._setInput(item);
    }

    private _setDays({days}: any) {
        this.days = days ?? [];
    }

    private _setVoid({voidOfCourse}: any) {
        this.voidOfCourse = voidOfCourse ?? [];
    }

    private _setInput({input}: any) {
        this.timezone = input?.timezone ?? 'UTC';
    }
}
