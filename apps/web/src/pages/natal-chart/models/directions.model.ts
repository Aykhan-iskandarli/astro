// Typed view of /api/charts/directions. Every value comes from the engine (Swiss Ephemeris).
export interface ISolarArcHit {
    directed: string;
    natal: string;
    aspect: string;
    arc: number;
    at: string;
    age: number;
}

export interface IProgressedHit {
    progressed: string;
    natal: string;
    aspect: string;
    retrograde: boolean;
    at: string;
    age: number;
}

export interface IIngress {
    progressed: string;
    sign: string;
    retrograde: boolean;
    at: string;
    age: number;
}

export default class DirectionsModel {
    public timeUnknown = false;
    public from = 0;
    public to = 0;
    public solarArc: ISolarArcHit[] = [];
    public progressed: IProgressedHit[] = [];
    public ingresses: IIngress[] = [];

    constructor(item: any) {
        this._setMeta(item);
        this._setEvents(item);
    }

    private _setMeta({meta, from, to}: any) {
        this.timeUnknown = meta?.timeUnknown ?? false;
        this.from = from ?? 0;
        this.to = to ?? 0;
    }

    private _setEvents({solarArc, progressed, ingresses}: any) {
        this.solarArc = solarArc ?? [];
        this.progressed = progressed ?? [];
        this.ingresses = ingresses ?? [];
    }
}
