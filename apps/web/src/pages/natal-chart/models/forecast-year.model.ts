// Typed views of /api/charts/lifeline, /api/charts/retrogrades and /api/charts/year (engine JSON, nothing computed here).
import {PersonalLunationModel} from 'pages/sky/models/personal-moon.model';
import {ChartPointModel, ChartPositionModel} from './natal-chart.model';
import {TimelineEventModel} from './timeline.model';

export class SegmentModel {
    public region: number | null = null;   // natal house
    public sign: string | null = null;     // zodiac sign (sign segments)
    public start: string | null = null;
    public end: string | null = null;
    public startClipped: boolean = false;
    public endClipped: boolean = false;

    constructor(item: any) {
        this._setRegion(item);
        this._setSign(item);
        this._setDates(item);
        this._setClipped(item);
    }

    private _setRegion({region}: any) {
        this.region = region ?? null;
    }

    private _setSign({sign}: any) {
        this.sign = sign ?? null;
    }

    private _setDates({start, end}: any) {
        this.start = start ?? null;
        this.end = end ?? null;
    }

    private _setClipped({startClipped, endClipped}: any) {
        this.startClipped = startClipped ?? false;
        this.endClipped = endClipped ?? false;
    }
}

export class SlowPlanetModel {
    public houses: SegmentModel[] | null = null;
    public signs: SegmentModel[] = [];

    constructor(item: any) {
        this._setHouses(item);
        this._setSigns(item);
    }

    private _setHouses({houses}: any) {
        this.houses = houses ? houses.map((s: any) => new SegmentModel(s)) : null;
    }

    private _setSigns({signs}: any) {
        this.signs = signs?.map((s: any) => new SegmentModel(s)) ?? [];
    }
}

const planets = (raw: any): Record<string, SlowPlanetModel> =>
    Object.fromEntries(Object.entries(raw ?? {}).map(([id, v]) => [id, new SlowPlanetModel(v)]));

export class LifelineModel {
    public start: string | null = null;
    public end: string | null = null;
    public timeUnknown: boolean = false;
    public planets: Record<string, SlowPlanetModel> = {};

    constructor(item: any) {
        this._setRange(item);
        this._setTimeUnknown(item);
        this._setPlanets(item);
    }

    private _setRange({start, end}: any) {
        this.start = start ?? null;
        this.end = end ?? null;
    }

    private _setTimeUnknown({meta}: any) {
        this.timeUnknown = meta?.timeUnknown ?? false;
    }

    private _setPlanets({planets: p}: any) {
        this.planets = planets(p);
    }
}

export class RetrogradeSpotModel extends ChartPositionModel {
    public at: string | null = null;
    public house: number | null = null;

    constructor(item: any) {
        super(item);
        this._setAt(item);
        this._setHouse(item);
    }

    private _setAt({at}: any) {
        this.at = at ?? null;
    }

    private _setHouse({house}: any) {
        this.house = house ?? null;
    }
}

export class RetrogradeModel {
    public planet: string | null = null;
    public start: string | null = null;
    public end: string | null = null;
    public startClipped: boolean = false;
    public endClipped: boolean = false;
    public from: RetrogradeSpotModel = new RetrogradeSpotModel({});
    public to: RetrogradeSpotModel = new RetrogradeSpotModel({});
    public houses: number[] = [];

    constructor(item: any) {
        this._setPlanet(item);
        this._setDates(item);
        this._setClipped(item);
        this._setSpots(item);
        this._setHouses(item);
    }

    private _setPlanet({planet}: any) {
        this.planet = planet ?? null;
    }

    private _setDates({start, end}: any) {
        this.start = start ?? null;
        this.end = end ?? null;
    }

    private _setClipped({startClipped, endClipped}: any) {
        this.startClipped = startClipped ?? false;
        this.endClipped = endClipped ?? false;
    }

    private _setSpots({from, to}: any) {
        this.from = new RetrogradeSpotModel(from ?? {});
        this.to = new RetrogradeSpotModel(to ?? {});
    }

    private _setHouses({houses}: any) {
        this.houses = houses ?? [];
    }
}

export class RetrogradesModel {
    public timeUnknown: boolean = false;
    public retrogrades: RetrogradeModel[] = [];

    constructor(item: any) {
        this._setTimeUnknown(item);
        this._setRetrogrades(item);
    }

    private _setTimeUnknown({meta}: any) {
        this.timeUnknown = meta?.timeUnknown ?? false;
    }

    private _setRetrogrades({retrogrades}: any) {
        this.retrogrades = retrogrades?.map((r: any) => new RetrogradeModel(r)) ?? [];
    }
}

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
    public start: string | null = null;
    public end: string | null = null;
    public sub: {lord: string; start: string; end: string}[] = [];

    constructor(item: any) {
        this._setLord(item);
        this._setDates(item);
        this._setSub(item);
    }

    private _setLord({lord}: any) {
        this.lord = lord ?? null;
    }

    private _setDates({start, end}: any) {
        this.start = start ?? null;
        this.end = end ?? null;
    }

    private _setSub({sub}: any) {
        this.sub = sub ?? [];
    }
}

export class MonthModel {
    public month: number = 1;
    public hits: number = 0;
    public slowHits: number = 0;

    constructor(item: any) {
        this._setMonth(item);
        this._setHits(item);
    }

    private _setMonth({month}: any) {
        this.month = month ?? 1;
    }

    private _setHits({hits, slowHits}: any) {
        this.hits = hits ?? 0;
        this.slowHits = slowHits ?? 0;
    }
}

export class SolarReturnSummaryModel {
    public at: string | null = null;
    public sun: ChartPointModel | null = null;
    public moon: ChartPointModel | null = null;
    public asc: ChartPositionModel | null = null;

    constructor(item: any) {
        this._setAt(item);
        this._setPoints(item);
    }

    private _setAt({at}: any) {
        this.at = at ?? null;
    }

    private _setPoints({sun, moon, asc}: any) {
        this.sun = sun ? new ChartPointModel(sun) : null;
        this.moon = moon ? new ChartPointModel(moon) : null;
        this.asc = asc ? new ChartPositionModel(asc, 'asc') : null;
    }
}

export default class YearModel {
    public year: number = 0;
    public timeUnknown: boolean = false;
    public profections: ProfectionYearModel[] | null = null;
    public solar: SolarReturnSummaryModel = new SolarReturnSummaryModel({});
    public firdaria: FirdariaPeriodModel[] = [];
    public slowPlanets: Record<string, SlowPlanetModel> = {};
    public transits: TimelineEventModel[] = [];
    public months: MonthModel[] = [];
    public lunations: PersonalLunationModel[] = [];
    public retrogrades: RetrogradeModel[] = [];

    constructor(item: any) {
        this._setYear(item);
        this._setProfections(item);
        this._setSolar(item);
        this._setFirdaria(item);
        this._setSlowPlanets(item);
        this._setTransits(item);
        this._setMonths(item);
        this._setLunations(item);
        this._setRetrogrades(item);
    }

    private _setYear({year, meta}: any) {
        this.year = year ?? 0;
        this.timeUnknown = meta?.timeUnknown ?? false;
    }

    private _setProfections({profections}: any) {
        this.profections = profections ? profections.map((p: any) => new ProfectionYearModel(p)) : null;
    }

    private _setSolar({solarReturn}: any) {
        this.solar = new SolarReturnSummaryModel(solarReturn ?? {});
    }

    private _setFirdaria({firdaria}: any) {
        this.firdaria = firdaria?.periods?.map((p: any) => new FirdariaPeriodModel(p)) ?? [];
    }

    private _setSlowPlanets({slowPlanets}: any) {
        this.slowPlanets = planets(slowPlanets);
    }

    private _setTransits({transits}: any) {
        this.transits = transits?.map((t: any) => new TimelineEventModel(t)) ?? [];
    }

    private _setMonths({months}: any) {
        this.months = months?.map((m: any) => new MonthModel(m)) ?? [];
    }

    private _setLunations({lunations}: any) {
        this.lunations = lunations?.map((l: any) => new PersonalLunationModel(l)) ?? [];
    }

    private _setRetrogrades({retrogrades}: any) {
        this.retrogrades = retrogrades?.map((r: any) => new RetrogradeModel(r)) ?? [];
    }
}
