// Typed view of /api/charts/astrocartography. Coordinates are [longitude, latitude] pairs from the engine.

export class AcgLineModel {
    public planet: string | null = null;
    public angle: 'mc' | 'ic' | 'asc' | 'dsc' | null = null;
    public segments: [number, number][][] = [];

    constructor(item: any) {
        this._setPlanet(item);
        this._setAngle(item);
        this._setSegments(item);
    }

    private _setPlanet({planet}: any) {
        this.planet = planet ?? null;
    }

    private _setAngle({angle}: any) {
        this.angle = angle ?? null;
    }

    private _setSegments({segments}: any) {
        this.segments = segments ?? [];
    }
}

export class AcgNearModel {
    public planet: string | null = null;
    public angle: string | null = null;
    public distanceKm: number = 0;

    constructor(item: any) {
        this._setPlanet(item);
        this._setAngle(item);
        this._setDistance(item);
    }

    private _setPlanet({planet}: any) {
        this.planet = planet ?? null;
    }

    private _setAngle({angle}: any) {
        this.angle = angle ?? null;
    }

    private _setDistance({distanceKm}: any) {
        this.distanceKm = distanceKm ?? 0;
    }
}

export default class AstrocartographyModel {
    public lines: AcgLineModel[] = [];
    public near: AcgNearModel[] | null = null;
    public birthplace: {latitude: number; longitude: number} | null = null;

    constructor(item: any) {
        this._setLines(item);
        this._setNear(item);
        this._setBirthplace(item);
    }

    private _setLines({lines}: any) {
        this.lines = lines?.map((l: any) => new AcgLineModel(l)) ?? [];
    }

    private _setNear({near}: any) {
        this.near = near ? near.map((n: any) => new AcgNearModel(n)) : null;
    }

    private _setBirthplace({birthplace}: any) {
        this.birthplace = birthplace ?? null;
    }
}
