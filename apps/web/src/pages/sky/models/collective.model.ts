// Typed view of /api/sky/collective (engine JSON): the collective sky of one year. Values are never computed here.

export class CollectiveStayModel {
    public sign: string | null = null;
    public start: string | null = null;
    public end: string | null = null;

    constructor(item: any) {
        this._setSign(item);
        this._setStart(item);
        this._setEnd(item);
    }

    private _setSign({sign}: any) {
        this.sign = sign ?? null;
    }

    private _setStart({start}: any) {
        this.start = start ?? null;
    }

    private _setEnd({end}: any) {
        this.end = end ?? null;
    }
}

export class CollectivePositionModel {
    public id: string = '';
    public stays: CollectiveStayModel[] = [];

    constructor(item: any) {
        this._setId(item);
        this._setStays(item);
    }

    private _setId({id}: any) {
        this.id = id ?? '';
    }

    private _setStays({stays}: any) {
        this.stays = stays?.map((s: any) => new CollectiveStayModel(s)) ?? [];
    }
}

export class CollectiveAspectModel {
    public planets: string[] = [];
    public aspect: string = '';
    public at: string | null = null;
    public pass: number = 1;
    public passes: number = 1;

    constructor(item: any) {
        this._setPlanets(item);
        this._setAspect(item);
        this._setAt(item);
        this._setPass(item);
        this._setPasses(item);
    }

    private _setPlanets({planets}: any) {
        this.planets = planets ?? [];
    }

    private _setAspect({aspect}: any) {
        this.aspect = aspect ?? '';
    }

    private _setAt({at}: any) {
        this.at = at ?? null;
    }

    private _setPass({pass}: any) {
        this.pass = pass ?? 1;
    }

    private _setPasses({passes}: any) {
        this.passes = passes ?? 1;
    }
}

export class CollectiveEclipseModel {
    public kind: string = '';
    public type: string = '';
    public at: string | null = null;
    public sign: string | null = null;

    constructor(item: any) {
        this._setKind(item);
        this._setType(item);
        this._setAt(item);
        this._setSign(item);
    }

    private _setKind({kind}: any) {
        this.kind = kind ?? '';
    }

    private _setType({type}: any) {
        this.type = type ?? '';
    }

    private _setAt({at}: any) {
        this.at = at ?? null;
    }

    private _setSign({sign}: any) {
        this.sign = sign ?? null;
    }
}

export class CollectiveRetrogradeModel {
    public planet: string = '';
    public start: string | null = null;
    public end: string | null = null;
    public startClipped: boolean = false;
    public endClipped: boolean = false;

    constructor(item: any) {
        this._setPlanet(item);
        this._setStart(item);
        this._setEnd(item);
        this._setStartClipped(item);
        this._setEndClipped(item);
    }

    private _setPlanet({planet}: any) {
        this.planet = planet ?? '';
    }

    private _setStart({start}: any) {
        this.start = start ?? null;
    }

    private _setEnd({end}: any) {
        this.end = end ?? null;
    }

    private _setStartClipped({startClipped}: any) {
        this.startClipped = startClipped ?? false;
    }

    private _setEndClipped({endClipped}: any) {
        this.endClipped = endClipped ?? false;
    }
}

export default class CollectiveModel {
    public year: number = 0;
    public positions: CollectivePositionModel[] = [];
    public aspects: CollectiveAspectModel[] = [];
    public eclipses: CollectiveEclipseModel[] = [];
    public retrogrades: CollectiveRetrogradeModel[] = [];

    constructor(item: any) {
        this._setYear(item);
        this._setPositions(item);
        this._setAspects(item);
        this._setEclipses(item);
        this._setRetrogrades(item);
    }

    private _setYear({year}: any) {
        this.year = year ?? 0;
    }

    private _setPositions({positions}: any) {
        this.positions = positions?.map((p: any) => new CollectivePositionModel(p)) ?? [];
    }

    private _setAspects({aspects}: any) {
        this.aspects = aspects?.map((a: any) => new CollectiveAspectModel(a)) ?? [];
    }

    private _setEclipses({eclipses}: any) {
        this.eclipses = eclipses?.map((e: any) => new CollectiveEclipseModel(e)) ?? [];
    }

    private _setRetrogrades({retrogrades}: any) {
        this.retrogrades = retrogrades?.map((r: any) => new CollectiveRetrogradeModel(r)) ?? [];
    }
}
