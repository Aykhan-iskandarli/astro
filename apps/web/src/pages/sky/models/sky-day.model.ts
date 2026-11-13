// Typed view of /api/sky/day: planetary hours and the Panchang for a day at a place.

export interface IPlanetaryHour {
    index: number;
    ruler: string;
    day: boolean;
    start: string;
    end: string;
}

export interface IPanchang {
    tithi: {number: number; name: string; paksha: 'shukla' | 'krishna'};
    nakshatra: {id: string; index: number; pada: number; lord: string} | null;
    yoga: {number: number; name: string};
    karana: {number: number; name: string};
    vara: string;
}

export default class SkyDayModel {
    public sunrise: string = '';
    public sunset: string = '';
    public dayRuler: string | null = null;
    public hours: IPlanetaryHour[] = [];
    public panchang: IPanchang | null = null;
    public timezone: string = 'UTC';

    constructor(item: any) {
        this._setTimes(item);
        this._setHours(item);
        this._setPanchang(item);
    }

    private _setTimes({sunrise, sunset, input}: any) {
        this.sunrise = sunrise ?? '';
        this.sunset = sunset ?? '';
        this.timezone = input?.timezone ?? 'UTC';
    }

    private _setHours({dayRuler, hours}: any) {
        this.dayRuler = dayRuler ?? null;
        this.hours = hours ?? [];
    }

    private _setPanchang({panchang}: any) {
        this.panchang = panchang ?? null;
    }
}
