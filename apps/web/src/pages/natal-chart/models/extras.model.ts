// Typed views of the deeper analyses: /api/charts/details, /api/charts/timing, /api/charts/guna-milan, /api/other.
// Every value comes from the engine; the classes only give the JSON a shape.

export interface IPos {
    longitude: number;
    sign: string;
    degree: number;
    minute: number;
}

export class DetailsModel {
    public obliquity: number = 0;
    public declinations: {id: string; declination: number; outOfBounds: boolean}[] = [];
    public antisciaContacts: {a: string; b: string; kind: 'antiscion' | 'contra'; orb: number}[] = [];
    public antisciaOrb: number = 1.5;
    public receptions: {a: string; b: string; type: 'domicile' | 'exaltation'}[] = [];
    public dominants: {id: string; score: number; percentage: number; dominant: boolean}[] = [];
    public dominantPlanet: string | null = null;
    public dominantElement: string | null = null;
    public dominantQuality: string | null = null;
    public prenatal: {solar: IPos & {at: string; type: string}; lunar: IPos & {at: string; type: string}} | null = null;
    public starContacts: {star: string; point: string; orb: number}[] = [];
    public starOrb: number = 1;
    public lots: (IPos & {id: string; house: number | null})[] | null = null;
    public harmonics: Record<string, {points: (IPos & {id: string})[]; conjunctions: {a: string; b: string; orb: number}[]}> = {};
    public harmonicOrb: number = 2;

    constructor(item: any) {
        this._setDeclinations(item);
        this._setAntiscia(item);
        this._setReceptions(item);
        this._setDominants(item);
        this._setPrenatal(item);
        this._setMore(item);
    }

    private _setMore({fixedStars, lots, harmonics}: any) {
        this.starContacts = fixedStars?.contacts ?? [];
        this.starOrb = fixedStars?.orb ?? 1;
        this.lots = lots ?? null;
        this.harmonics = harmonics?.charts ?? {};
        this.harmonicOrb = harmonics?.orb ?? 2;
    }

    private _setDeclinations({declinations}: any) {
        this.obliquity = declinations?.obliquity ?? 0;
        this.declinations = declinations?.points ?? [];
    }

    private _setAntiscia({antiscia}: any) {
        this.antisciaContacts = antiscia?.contacts ?? [];
        this.antisciaOrb = antiscia?.orb ?? 1.5;
    }

    private _setReceptions({receptions}: any) {
        this.receptions = receptions ?? [];
    }

    private _setDominants({dominants}: any) {
        this.dominants = dominants?.planets ?? [];
        this.dominantPlanet = dominants?.planet ?? null;
        this.dominantElement = dominants?.element ?? null;
        this.dominantQuality = dominants?.quality ?? null;
    }

    private _setPrenatal({prenatalEclipses}: any) {
        this.prenatal = prenatalEclipses ?? null;
    }
}

export interface IZrPeriod {
    sign: string;
    ruler: string;
    start: string;
    end: string;
    years: number;
    angular: boolean;
    loosingTheBond: boolean;
    sub: IZrPeriod[];
}

export class TimingModel {
    public on: string = '';
    public firdaria: {lord: string; years: number; start: string; end: string; sub: {lord: string; start: string; end: string}[]}[] = [];
    public firdariaDiurnal: boolean = true;
    public firdariaCurrent: string | null = null;
    public firdariaCurrentSub: string | null = null;
    public zr: {lot: 'fortune' | 'spirit'; lotSign: string; periods: IZrPeriod[]}[] | null = null;
    public arc: number = 0;
    public arcOrb: number = 1;
    public arcAspects: {directed: string; natal: string; type: string; orb: number}[] = [];

    constructor(item: any) {
        this._setInput(item);
        this._setFirdaria(item);
        this._setZr(item);
        this._setArc(item);
    }

    private _setInput({input}: any) {
        this.on = input?.on ?? '';
    }

    private _setFirdaria({firdaria}: any) {
        this.firdaria = firdaria?.periods ?? [];
        this.firdariaDiurnal = firdaria?.diurnal ?? true;
        this.firdariaCurrent = firdaria?.current ?? null;
        this.firdariaCurrentSub = firdaria?.currentSub ?? null;
    }

    private _setZr({zodiacalReleasing}: any) {
        this.zr = zodiacalReleasing ?? null;
    }

    private _setArc({solarArc}: any) {
        this.arc = solarArc?.arc ?? 0;
        this.arcOrb = solarArc?.orb ?? 1;
        this.arcAspects = solarArc?.aspects ?? [];
    }
}

export interface IMatchPerson {
    moonSign: string;
    nakshatraInfo: {id: string; index: number; pada: number; lord: string} | null;
    varna: string;
    vashya: string;
    yoni: string;
    lord: string;
    gana: string;
    nadi: string;
    manglik: {fromLagna: boolean | null; fromMoon: boolean; isManglik: boolean; marsHouse: Record<string, number>};
}

export class GunaMilanModel {
    public groom: IMatchPerson | null = null;
    public bride: IMatchPerson | null = null;
    public kootas: {id: string; score: number; max: number}[] = [];
    public total: number = 0;
    public max: number = 36;
    public verdict: 'excellent' | 'good' | 'weak' = 'weak';
    public manglik: {groom: boolean; bride: boolean; cancelled: boolean; mismatch: boolean} | null = null;

    constructor(item: any) {
        this._setPeople(item);
        this._setScore(item);
    }

    private _setPeople({groom, bride, manglik}: any) {
        this.groom = groom ?? null;
        this.bride = bride ?? null;
        this.manglik = manglik ?? null;
    }

    private _setScore({kootas, total, max, verdict}: any) {
        this.kootas = kootas ?? [];
        this.total = total ?? 0;
        this.max = max ?? 36;
        this.verdict = verdict ?? 'weak';
    }
}

export class OtherSystemsModel {
    public tarot: number[] = [];
    public tzolkin: {tone: number; sign: string; signNumber: number; kin: number} | null = null;
    public kua: {number: number; group: 'east' | 'west'; chineseYear: number; directions: Record<string, string>} | null = null;

    constructor(item: any) {
        this._set(item);
    }

    private _set({tarot, tzolkin, kua}: any) {
        this.tarot = tarot ?? [];
        this.tzolkin = tzolkin ?? null;
        this.kua = kua ?? null;
    }
}

export interface ICartographyLine {
    planet: string;
    type: 'mc' | 'ic' | 'asc' | 'dsc';
    points: [number, number][];
}

export class CartographyModel {
    public lines: ICartographyLine[] = [];
    public birthplace: {latitude: number; longitude: number} | null = null;

    constructor(item: any) {
        this._set(item);
    }

    private _set({lines, birthplace}: any) {
        this.lines = lines ?? [];
        this.birthplace = birthplace ?? null;
    }
}
