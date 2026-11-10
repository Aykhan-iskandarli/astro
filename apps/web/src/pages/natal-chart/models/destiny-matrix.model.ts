// Typed view of /api/charts/destiny-matrix. All numbers come from the engine.

export interface IChakraRow {
    id: string;
    physical: number;
    energy: number;
    emotion: number;
}

export interface IAgeStep {
    age: number;
    arcana: number;
    corner: string | null;
}

export default class DestinyMatrixModel {
    public date: string | null = null;
    public points: Record<string, number> = {};
    public purposes: Record<string, number> = {};
    public chakras: IChakraRow[] = [];
    public chakraTotal: {physical: number; energy: number; emotion: number} | null = null;
    public lines: Record<string, number[] | number[][]> = {};
    public ageTimeline: IAgeStep[] = [];

    constructor(item: any) {
        this._setDate(item);
        this._setPoints(item);
        this._setPurposes(item);
        this._setHealth(item);
        this._setLines(item);
        this._setAgeTimeline(item);
    }

    private _setDate({input}: any) {
        this.date = input?.date ?? null;
    }

    private _setPoints({points}: any) {
        this.points = points ?? {};
    }

    private _setPurposes({purposes}: any) {
        this.purposes = purposes ?? {};
    }

    private _setHealth({health}: any) {
        this.chakras = health?.chakras?.map((c: any) => ({
            id: c.id, physical: c.physical, energy: c.energy, emotion: c.emotion,
        })) ?? [];
        this.chakraTotal = health?.total ?? null;
    }

    private _setLines({lines}: any) {
        this.lines = lines ?? {};
    }

    private _setAgeTimeline({ageTimeline}: any) {
        this.ageTimeline = ageTimeline?.map((s: any) => ({age: s.age, arcana: s.arcana, corner: s.corner ?? null})) ?? [];
    }
}
