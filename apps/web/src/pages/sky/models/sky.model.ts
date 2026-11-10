// Typed views of /api/sky and /api/sky/calendar (engine JSON). Values are never computed here.

export class SkyPointModel {
    public id: string | null = null;
    public sign: string | null = null;
    public degree: number | null = null;
    public minute: number | null = null;
    public retrograde: boolean = false;

    constructor(item: any) {
        this._setId(item);
        this._setSign(item);
        this._setDegree(item);
        this._setMinute(item);
        this._setRetrograde(item);
    }

    private _setId({id}: any) {
        this.id = id ?? null;
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

    private _setRetrograde({retrograde}: any) {
        this.retrograde = retrograde ?? false;
    }
}

export class SkyEventModel {
    public kind: string | null = null;      // lunation phase, station type, eclipse kind…
    public type: string | null = null;      // eclipse type (total, annular…)
    public planet: string | null = null;
    public sign: string | null = null;
    public at: string | null = null;
    public retrograde: boolean = false;

    constructor(item: any, kind?: string) {
        this._setKind(item, kind);
        this._setType(item);
        this._setPlanet(item);
        this._setSign(item);
        this._setAt(item);
        this._setRetrograde(item);
    }

    private _setKind({phase, kind}: any, fallback?: string) {
        this.kind = phase ?? kind ?? fallback ?? null;
    }

    private _setType({type}: any) {
        this.type = type ?? null;
    }

    private _setPlanet({planet}: any) {
        this.planet = planet ?? null;
    }

    private _setSign({sign}: any) {
        this.sign = sign ?? null;
    }

    private _setAt({at}: any) {
        this.at = at ?? null;
    }

    private _setRetrograde({retrograde}: any) {
        this.retrograde = retrograde ?? false;
    }
}

export class VoidOfCourseModel {
    public active: boolean = false;
    public start: string | null = null;
    public end: string | null = null;
    public nextSign: string | null = null;
    public lastPlanet: string | null = null;
    public lastAspect: string | null = null;

    constructor(item: any) {
        this._setActive(item);
        this._setStart(item);
        this._setEnd(item);
        this._setNextSign(item);
        this._setLast(item);
    }

    private _setActive({active}: any) {
        this.active = active ?? false;
    }

    private _setStart({start}: any) {
        this.start = start ?? null;
    }

    private _setEnd({end}: any) {
        this.end = end ?? null;
    }

    private _setNextSign({nextSign}: any) {
        this.nextSign = nextSign ?? null;
    }

    private _setLast({lastAspect}: any) {
        this.lastPlanet = lastAspect?.planet ?? null;
        this.lastAspect = lastAspect?.aspect ?? null;
    }
}

export class MoonModel {
    public phase: string | null = null;
    public waxing: boolean = true;
    public sign: string | null = null;
    public illumination: number = 0;
    public voidOfCourse: VoidOfCourseModel = new VoidOfCourseModel({});

    constructor(item: any) {
        this._setPhase(item);
        this._setWaxing(item);
        this._setSign(item);
        this._setIllumination(item);
        this._setVoidOfCourse(item);
    }

    private _setPhase({phase}: any) {
        this.phase = phase ?? null;
    }

    private _setWaxing({waxing}: any) {
        this.waxing = waxing ?? true;
    }

    private _setSign({sign}: any) {
        this.sign = sign ?? null;
    }

    private _setIllumination({illumination}: any) {
        this.illumination = illumination ?? 0;
    }

    private _setVoidOfCourse({voidOfCourse}: any) {
        this.voidOfCourse = new VoidOfCourseModel(voidOfCourse ?? {});
    }
}

export default class SkyModel {
    public at: string | null = null;
    public points: SkyPointModel[] = [];
    public moon: MoonModel = new MoonModel({});
    public retrogrades: string[] = [];
    public lunations: SkyEventModel[] = [];
    public stations: SkyEventModel[] = [];

    constructor(item: any) {
        this._setAt(item);
        this._setPoints(item);
        this._setMoon(item);
        this._setRetrogrades(item);
        this._setLunations(item);
        this._setStations(item);
    }

    private _setAt({at}: any) {
        this.at = at ?? null;
    }

    private _setPoints({points}: any) {
        this.points = points?.map((p: any) => new SkyPointModel(p)) ?? [];
    }

    private _setMoon({moon}: any) {
        this.moon = new MoonModel(moon ?? {});
    }

    private _setRetrogrades({retrogrades}: any) {
        this.retrogrades = retrogrades ?? [];
    }

    private _setLunations({lunations}: any) {
        this.lunations = lunations?.map((l: any) => new SkyEventModel(l, 'lunation')) ?? [];
    }

    private _setStations({stations}: any) {
        this.stations = stations?.map((s: any) => new SkyEventModel(s, 'station')) ?? [];
    }
}

export class RetrogradePeriodModel {
    public planet: string | null = null;
    public start: string | null = null;
    public end: string | null = null;
    public startClipped: boolean = false;
    public endClipped: boolean = false;

    constructor(item: any) {
        this._setPlanet(item);
        this._setStart(item);
        this._setEnd(item);
        this._setClipped(item);
    }

    private _setPlanet({planet}: any) {
        this.planet = planet ?? null;
    }

    private _setStart({start}: any) {
        this.start = start ?? null;
    }

    private _setEnd({end}: any) {
        this.end = end ?? null;
    }

    private _setClipped({startClipped, endClipped}: any) {
        this.startClipped = startClipped ?? false;
        this.endClipped = endClipped ?? false;
    }
}

export class CalendarModel {
    public lunations: SkyEventModel[] = [];
    public eclipses: SkyEventModel[] = [];
    public ingresses: SkyEventModel[] = [];
    public stations: SkyEventModel[] = [];
    public retrogradePeriods: RetrogradePeriodModel[] = [];

    constructor(item: any) {
        this._setLunations(item);
        this._setEclipses(item);
        this._setIngresses(item);
        this._setStations(item);
        this._setRetrogradePeriods(item);
    }

    private _setLunations({lunations}: any) {
        this.lunations = lunations?.map((l: any) => new SkyEventModel(l)) ?? [];
    }

    private _setEclipses({eclipses}: any) {
        this.eclipses = eclipses?.map((e: any) => new SkyEventModel(e)) ?? [];
    }

    private _setIngresses({ingresses}: any) {
        this.ingresses = ingresses?.map((i: any) => new SkyEventModel(i, 'ingress')) ?? [];
    }

    private _setStations({stations}: any) {
        this.stations = stations?.map((s: any) => new SkyEventModel(s)) ?? [];
    }

    private _setRetrogradePeriods({retrogradePeriods}: any) {
        this.retrogradePeriods = retrogradePeriods?.map((r: any) => new RetrogradePeriodModel(r)) ?? [];
    }
}
