// Typed view of /api/charts/generation. Every value comes from the engine; null dates mean the search window ended first.
export interface IGenerationStay {
    id: string;
    sign: string;
    start: string | null;
    end: string | null;
    years: number | null;
    daysFromStart: number | null;
    daysToEnd: number | null;
    dips: number;
}

export default class GenerationModel {
    public planets: IGenerationStay[] = [];

    constructor(item: any) {
        this._setPlanets(item);
    }

    private _setPlanets({planets}: any) {
        this.planets = planets ?? [];
    }
}
