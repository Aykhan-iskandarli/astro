// Typed view of /api/charts/techniques: annual profections, firdaria and solar arc directions.
import {AspectModel, ChartPositionModel} from './natal-chart.model';

export class ProfectionYearModel {
    public age: number = 0;
    public house: number | null = null;
    public sign: string | null = null;
    public lord: string | null = null;
    public start: string | null = null;
    public end: string | null = null;

    constructor(item: any) {
        this._setAge(item);
        this._setHouse(item);
        this._setSign(item);
        this._setLord(item);
        this._setDates(item);
    }

    private _setAge({age}: any) {
        this.age = age ?? 0;
    }

    private _setHouse({house}: any) {
        this.house = house ?? null;
    }

    private _setSign({sign}: any) {
        this.sign = sign ?? null;
    }

    private _setLord({lord}: any) {
        this.lord = lord ?? null;
    }

    private _setDates({start, end}: any) {
        this.start = start ?? null;
        this.end = end ?? null;
    }
}

export class FirdariaPeriodModel {
    public lord: string | null = null;
    public years: number = 0;
    public ageStart: number = 0;
    public ageEnd: number = 0;
    public start: string | null = null;
    public end: string | null = null;
    public current: boolean = false;
    public subPeriods: FirdariaPeriodModel[] = [];

    constructor(item: any) {
        this._setLord(item);
        this._setYears(item);
        this._setAges(item);
        this._setDates(item);
        this._setCurrent(item);
        this._setSubPeriods(item);
    }

    private _setLord({lord}: any) {
        this.lord = lord ?? null;
    }

    private _setYears({years}: any) {
        this.years = years ?? 0;
    }

    private _setAges({ageStart, ageEnd}: any) {
        this.ageStart = ageStart ?? 0;
        this.ageEnd = ageEnd ?? 0;
    }

    private _setDates({start, end}: any) {
        this.start = start ?? null;
        this.end = end ?? null;
    }

    private _setCurrent({current}: any) {
        this.current = current ?? false;
    }

    private _setSubPeriods({subPeriods}: any) {
        this.subPeriods = subPeriods?.map((s: any) => new FirdariaPeriodModel(s)) ?? [];
    }
}

export default class TimeLordsModel {
    public on: string | null = null;
    public currentAge: number = 0;
    public profections: ProfectionYearModel[] = [];
    public firdariaDiurnal: boolean = true;
    public firdaria: FirdariaPeriodModel[] = [];
    public arc: number = 0;
    public directed: ChartPositionModel[] = [];
    public arcAspects: AspectModel[] = [];

    constructor(item: any) {
        this._setOn(item);
        this._setProfections(item);
        this._setFirdaria(item);
        this._setSolarArc(item);
    }

    private _setOn({on}: any) {
        this.on = on ?? null;
    }

    private _setProfections({profections}: any) {
        this.currentAge = profections?.currentAge ?? 0;
        this.profections = profections?.years?.map((y: any) => new ProfectionYearModel(y)) ?? [];
    }

    private _setFirdaria({firdaria}: any) {
        this.firdariaDiurnal = firdaria?.diurnal ?? true;
        this.firdaria = firdaria?.periods?.map((p: any) => new FirdariaPeriodModel(p)) ?? [];
    }

    private _setSolarArc({solarArc}: any) {
        this.arc = solarArc?.arc ?? 0;
        this.directed = solarArc?.points?.map((p: any) => new ChartPositionModel(p)) ?? [];
        this.arcAspects = solarArc?.aspects?.map((a: any) => new AspectModel(a)) ?? [];
    }
}
