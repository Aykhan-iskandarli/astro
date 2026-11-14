// Typed views of /api/charts/moon-day and /api/charts/moon-lunations (engine JSON). Nothing is computed here.

export class MoonSpotModel {
    public sign: string | null = null;
    public degree: number | null = null;
    public minute: number | null = null;
    public house: number | null = null;
    public mansion: number = 1;

    constructor(item: any) {
        this._setSign(item);
        this._setDegree(item);
        this._setHouse(item);
        this._setMansion(item);
    }

    private _setSign({sign}: any) {
        this.sign = sign ?? null;
    }

    private _setDegree({degree, minute}: any) {
        this.degree = degree ?? null;
        this.minute = minute ?? null;
    }

    private _setHouse({house}: any) {
        this.house = house ?? null;
    }

    private _setMansion({mansion}: any) {
        this.mansion = mansion ?? 1;
    }
}

export class MoonEventModel {
    public type: 'aspect' | 'sign' | 'house' | null = null;
    public at: string | null = null;
    public point: string | null = null;
    public aspect: string | null = null;
    public sign: string | null = null;
    public house: number | null = null;

    constructor(item: any) {
        this._setType(item);
        this._setAt(item);
        this._setPoint(item);
        this._setAspect(item);
        this._setSign(item);
        this._setHouse(item);
    }

    private _setType({type}: any) {
        this.type = type ?? null;
    }

    private _setAt({at}: any) {
        this.at = at ?? null;
    }

    private _setPoint({point}: any) {
        this.point = point ?? null;
    }

    private _setAspect({aspect}: any) {
        this.aspect = aspect ?? null;
    }

    private _setSign({sign}: any) {
        this.sign = sign ?? null;
    }

    private _setHouse({house}: any) {
        this.house = house ?? null;
    }
}

export default class MoonDayModel {
    public start: string | null = null;
    public timeUnknown: boolean = false;
    public moon: MoonSpotModel = new MoonSpotModel({});
    public events: MoonEventModel[] = [];

    constructor(item: any) {
        this._setStart(item);
        this._setTimeUnknown(item);
        this._setMoon(item);
        this._setEvents(item);
    }

    private _setStart({start}: any) {
        this.start = start ?? null;
    }

    private _setTimeUnknown({meta}: any) {
        this.timeUnknown = meta?.timeUnknown ?? false;
    }

    private _setMoon({moon}: any) {
        this.moon = new MoonSpotModel(moon ?? {});
    }

    private _setEvents({events}: any) {
        this.events = events?.map((e: any) => new MoonEventModel(e)) ?? [];
    }
}

export class LunationAspectModel {
    public point: string | null = null;
    public aspect: string | null = null;
    public orb: number = 0;

    constructor(item: any) {
        this._setPoint(item);
        this._setAspect(item);
        this._setOrb(item);
    }

    private _setPoint({point}: any) {
        this.point = point ?? null;
    }

    private _setAspect({aspect}: any) {
        this.aspect = aspect ?? null;
    }

    private _setOrb({orb}: any) {
        this.orb = orb ?? 0;
    }
}

export class PersonalLunationModel extends MoonSpotModel {
    public phase: string | null = null;
    public at: string | null = null;
    public sunHouse: number | null = null;
    public aspects: LunationAspectModel[] = [];
    public eclipse: {kind: 'solar' | 'lunar'; type: string} | null = null;

    constructor(item: any) {
        super(item);
        this._setPhase(item);
        this._setAt(item);
        this._setSunHouse(item);
        this._setAspects(item);
        this._setEclipse(item);
    }

    private _setPhase({phase}: any) {
        this.phase = phase ?? null;
    }

    private _setAt({at}: any) {
        this.at = at ?? null;
    }

    private _setSunHouse({sunHouse}: any) {
        this.sunHouse = sunHouse ?? null;
    }

    private _setAspects({aspects}: any) {
        this.aspects = aspects?.map((a: any) => new LunationAspectModel(a)) ?? [];
    }

    private _setEclipse({eclipse}: any) {
        this.eclipse = eclipse ?? null;
    }
}

export class PersonalLunationsModel {
    public timeUnknown: boolean = false;
    public lunations: PersonalLunationModel[] = [];

    constructor(item: any) {
        this._setTimeUnknown(item);
        this._setLunations(item);
    }

    private _setTimeUnknown({meta}: any) {
        this.timeUnknown = meta?.timeUnknown ?? false;
    }

    private _setLunations({lunations}: any) {
        this.lunations = lunations?.map((l: any) => new PersonalLunationModel(l)) ?? [];
    }
}
