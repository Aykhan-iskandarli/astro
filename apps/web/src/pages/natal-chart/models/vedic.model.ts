// Typed view of /api/charts/vedic (sidereal Lahiri). Every value comes from the engine.

export interface IVedicPoint {
    id: string;
    longitude: number;
    sign: string;
    degree: number;
    minute: number;
    house: number | null;
    retrograde: boolean;
    nakshatra: {index: number; id: string; pada: number; lord: string};
    navamsa: string;
    dignity: string | null;
}

export interface IDashaPeriod {
    lord: string;
    start: string;
    end: string;
    years: number;
    current: boolean;
    antardashas?: IDashaPeriod[];
}

export interface ISadeSatiPhase {
    phase: 'rising' | 'peak' | 'setting';
    sign: string;
    start: string;
    end: string;
}

export interface ISadeSatiPeriod {
    start: string;
    end: string;
    startClipped: boolean;
    endClipped: boolean;
    status: 'past' | 'now' | 'future';
    phases: ISadeSatiPhase[];
}

export interface ISadeSati {
    moonSign: string;
    horizonYears: number;
    periods: ISadeSatiPeriod[];
}

export default class VedicModel {
    public ayanamsa: number | null = null;
    public timeUnknown: boolean = false;
    public lagna: IVedicPoint | null = null;
    public grahas: IVedicPoint[] = [];
    public dashaStartLord: string | null = null;
    public dashaBalanceYears: number | null = null;
    public mahadashas: IDashaPeriod[] = [];
    public sadeSati: ISadeSati | null = null;
    public divisional: Record<string, {d3: string; d7: string; d10: string; d12: string}> = {};
    public yogas: {id: string; planets: string[]}[] = [];
    public ashtakavarga: {signs: string[]; bav: Record<string, number[]>; sav: number[]; total: number} | null = null;

    constructor(item: any) {
        this._setAyanamsa(item);
        this._setMeta(item);
        this._setLagna(item);
        this._setGrahas(item);
        this._setDasha(item);
        this._setSadeSati(item);
    }

    private _setSadeSati({sadeSati, extras}: any) {
        this.sadeSati = sadeSati ?? null;
        this.divisional = extras?.divisional ?? {};
        this.yogas = extras?.yogas ?? [];
        this.ashtakavarga = extras?.ashtakavarga ?? null;
    }

    private _setAyanamsa({ayanamsa}: any) {
        this.ayanamsa = ayanamsa ?? null;
    }

    private _setMeta({meta}: any) {
        this.timeUnknown = meta?.timeUnknown ?? false;
    }

    private _setLagna({lagna}: any) {
        this.lagna = lagna ?? null;
    }

    private _setGrahas({grahas}: any) {
        this.grahas = grahas?.map((g: IVedicPoint) => ({...g})) ?? [];
    }

    private _setDasha({dasha}: any) {
        this.dashaStartLord = dasha?.startLord ?? null;
        this.dashaBalanceYears = dasha?.balanceYears ?? null;
        this.mahadashas = dasha?.mahadashas ?? [];
    }
}
