// Typed view of the /api/charts/natal response (engine JSON, camelCase). Values are never computed here.

export class ChartPositionModel {
    public id: string | null = null;
    public longitude: number | null = null;
    public sign: string | null = null;
    public degree: number | null = null;
    public minute: number | null = null;

    constructor(item: any, id?: string) {
        this._setId(item, id);
        this._setLongitude(item);
        this._setSign(item);
        this._setDegree(item);
        this._setMinute(item);
    }

    private _setId({id}: any, fallback?: string) {
        this.id = id ?? fallback ?? null;
    }

    private _setLongitude({longitude}: any) {
        this.longitude = longitude ?? null;
    }

    private _setSign({sign}: any) {
        this.sign = sign ?? null;
    }

    private _setDegree({degree}: any) {
        this.degree = degree ?? null;
    }

    private _setMinute({minute}: any) {
        this.minute = minute ?? null;
    }
}

export class ChartPointModel extends ChartPositionModel {
    public kind: string | null = null;
    public house: number | null = null;
    public retrograde: boolean = false;
    public speed: number | null = null;
    public dignity: string | null = null;

    constructor(item: any) {
        super(item);
        this._setKind(item);
        this._setHouse(item);
        this._setRetrograde(item);
        this._setSpeed(item);
        this._setDignity(item);
    }

    private _setKind({kind}: any) {
        this.kind = kind ?? null;
    }

    private _setHouse({house}: any) {
        this.house = house ?? null;
    }

    private _setRetrograde({retrograde}: any) {
        this.retrograde = retrograde ?? false;
    }

    private _setSpeed({speed}: any) {
        this.speed = speed ?? null;
    }

    private _setDignity({dignity}: any) {
        this.dignity = dignity ?? null;
    }
}

export class HouseRulerModel {
    public id: string | null = null;
    public sign: string | null = null;
    public house: number | null = null;
    public kind: 'traditional' | 'modern' | null = null;

    constructor(item: any) {
        this._setId(item);
        this._setSign(item);
        this._setHouse(item);
        this._setKind(item);
    }

    private _setId({id}: any) {
        this.id = id ?? null;
    }

    private _setSign({sign}: any) {
        this.sign = sign ?? null;
    }

    private _setHouse({house}: any) {
        this.house = house ?? null;
    }

    private _setKind({kind}: any) {
        this.kind = kind ?? null;
    }
}

export class HouseCuspModel extends ChartPositionModel {
    public number: number | null = null;
    public rulers: HouseRulerModel[] = [];

    constructor(item: any) {
        super(item, `house-${item?.number}`);
        this._setNumber(item);
        this._setRulers(item);
    }

    private _setNumber({number}: any) {
        this.number = number ?? null;
    }

    private _setRulers({rulers}: any) {
        this.rulers = rulers?.map((r: any) => new HouseRulerModel(r)) ?? [];
    }
}

export class AspectModel {
    public p1: string | null = null;
    public p2: string | null = null;
    public type: string | null = null;
    public angle: number | null = null;
    public orb: number | null = null;
    public applying: boolean | null = null;
    public major: boolean = false;

    constructor(item: any) {
        this._setP1(item);
        this._setP2(item);
        this._setType(item);
        this._setAngle(item);
        this._setOrb(item);
        this._setApplying(item);
        this._setMajor(item);
    }

    private _setP1({p1}: any) {
        this.p1 = p1 ?? null;
    }

    private _setP2({p2}: any) {
        this.p2 = p2 ?? null;
    }

    private _setType({type}: any) {
        this.type = type ?? null;
    }

    private _setAngle({angle}: any) {
        this.angle = angle ?? null;
    }

    private _setOrb({orb}: any) {
        this.orb = orb ?? null;
    }

    private _setApplying({applying}: any) {
        this.applying = applying ?? null;
    }

    private _setMajor({major}: any) {
        this.major = major ?? false;
    }
}

export class PatternModel {
    public type: string | null = null;
    public points: string[] = [];
    public apex: string | null = null;
    public element: string | null = null;
    public modality: string | null = null;
    public sign: string | null = null;
    public house: number | null = null;

    constructor(item: any) {
        this._setType(item);
        this._setPoints(item);
        this._setApex(item);
        this._setElement(item);
        this._setModality(item);
        this._setSign(item);
        this._setHouse(item);
    }

    private _setType({type}: any) {
        this.type = type ?? null;
    }

    private _setPoints({points}: any) {
        this.points = points?.map((p: string) => p) ?? [];
    }

    private _setApex({apex}: any) {
        this.apex = apex ?? null;
    }

    private _setElement({element}: any) {
        this.element = element ?? null;
    }

    private _setModality({modality}: any) {
        this.modality = modality ?? null;
    }

    private _setSign({sign}: any) {
        this.sign = sign ?? null;
    }

    private _setHouse({house}: any) {
        this.house = house ?? null;
    }
}

export interface IBalance {
    elements: Record<string, number>;
    modalities: Record<string, number>;
    polarity: Record<string, number>;
    members: Record<string, string[]>;
    dominant: {element: string[]; modality: string[]; polarity: string[]};
    missing: {element: string[]; modality: string[]};
}

export default class NatalChartModel {
    public name: string | null = null;
    public place: string | null = null;
    public date: string | null = null;
    public localDatetime: string | null = null;
    public utcDatetime: string | null = null;
    public utcOffset: string | null = null;
    public timezone: string | null = null;
    public dstNote: 'ambiguous' | 'nonexistent' | null = null;
    public latitude: number | null = null;
    public longitude: number | null = null;
    public timeUnknown: boolean = false;
    public houseSystem: string | null = null;
    public houseSystemRequested: string | null = null;
    public library: string | null = null;
    public points: ChartPointModel[] = [];
    public extraPoints: ChartPointModel[] = [];   // asteroids, Vertex, Part of Spirit: own table, not on the wheel
    public angles: ChartPositionModel[] = [];
    public houses: HouseCuspModel[] = [];
    public aspects: AspectModel[] = [];
    public patterns: PatternModel[] = [];
    public balance: IBalance | null = null;
    public lunarPhase: string | null = null;
    public sect: 'day' | 'night' | null = null;
    public moonRange: {start: ChartPositionModel; end: ChartPositionModel} | null = null;

    constructor(item: any) {
        this._setInput(item);
        this._setMeta(item);
        this._setPoints(item);
        this._setExtraPoints(item);
        this._setAngles(item);
        this._setHouses(item);
        this._setAspects(item);
        this._setPatterns(item);
        this._setBalance(item);
        this._setLunarPhase(item);
        this._setSect(item);
        this._setMoonRange(item);
    }

    private _setInput({input}: any) {
        this.name = input?.name ?? null;
        this.place = input?.place ?? null;
        this.date = input?.date ?? null;
        this.localDatetime = input?.localDatetime ?? null;
        this.utcDatetime = input?.utcDatetime ?? null;
        this.utcOffset = input?.utcOffset ?? null;
        this.timezone = input?.timezone ?? null;
        this.dstNote = input?.dstNote ?? null;
        this.latitude = input?.latitude ?? null;
        this.longitude = input?.longitude ?? null;
    }

    private _setMeta({meta}: any) {
        this.timeUnknown = meta?.timeUnknown ?? false;
        this.houseSystem = meta?.houseSystem ?? null;
        this.houseSystemRequested = meta?.houseSystemRequested ?? null;
        this.library = meta?.library ?? null;
    }

    private _setPoints({points}: any) {
        this.points = points?.map((p: any) => new ChartPointModel(p)) ?? [];
    }

    private _setExtraPoints({extraPoints}: any) {
        this.extraPoints = extraPoints?.map((p: any) => new ChartPointModel(p)) ?? [];
    }

    private _setAngles({angles}: any) {
        this.angles = angles ? Object.entries(angles).map(([id, a]) => new ChartPositionModel(a, id)) : [];
    }

    private _setHouses({houses}: any) {
        this.houses = houses?.map((h: any) => new HouseCuspModel(h)) ?? [];
    }

    private _setAspects({aspects}: any) {
        this.aspects = aspects?.map((a: any) => new AspectModel(a)) ?? [];
    }

    private _setPatterns({patterns}: any) {
        this.patterns = patterns?.map((p: any) => new PatternModel(p)) ?? [];
    }

    private _setBalance({balance}: any) {
        this.balance = balance ?? null;
    }

    private _setLunarPhase({lunarPhase}: any) {
        this.lunarPhase = lunarPhase?.phase ?? null;
    }

    private _setSect({sect}: any) {
        this.sect = sect ?? null;
    }

    private _setMoonRange({moonRange}: any) {
        this.moonRange = moonRange
            ? {start: new ChartPositionModel(moonRange.start, 'moon'), end: new ChartPositionModel(moonRange.end, 'moon')}
            : null;
    }
}
