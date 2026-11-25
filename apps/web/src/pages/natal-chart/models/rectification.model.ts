// Typed view of /api/charts/rectification. Every value comes from the engine (Swiss Ephemeris).
import {IBirthInput} from 'store/store';

export interface IRectificationRequest {
    input: IBirthInput;
    events: string[];
    windowStart: string | null;
    windowEnd: string | null;
}

export interface IRectAngle {
    sign: string;
    degree: number;
    minute: number;
}

export interface IRectHit {
    event: number;
    kind: 'transit' | 'arcAngle' | 'arcPlanet';
    from: string;
    to: string;
    aspect: string;
    orb: number;
}

export interface IRectCandidate {
    time: string;
    score: number;
    asc: IRectAngle;
    mc: IRectAngle;
    events: number;
    hits: IRectHit[];
}

export default class RectificationModel {
    public events: string[] = [];
    public curve: {time: string; score: number; asc: string}[] = [];
    public top: IRectCandidate[] = [];

    constructor(item: any) {
        this._setEvents(item);
        this._setCurve(item);
        this._setTop(item);
    }

    private _setEvents({events}: any) {
        this.events = events ?? [];
    }

    private _setCurve({curve}: any) {
        this.curve = curve ?? [];
    }

    private _setTop({top}: any) {
        this.top = top ?? [];
    }
}
