// Typed view of /api/charts/transformations. Every value comes from the engine (Swiss Ephemeris).

export interface IPass {
    at: string;
    retrograde: boolean;
}

export interface IEpisode {
    transit: string;
    natal: string;
    aspect: string;
    natalSign: string;
    natalDegree: number;
    natalMinute: number;
    passes: IPass[];
    start: string;
    end: string;
    ageAtStart: number;
    ageAtEnd: number;
    sameBody: boolean;
}

export default class TransformationsModel {
    public timeUnknown = false;
    public from = 0;
    public to = 0;
    public episodes: IEpisode[] = [];

    constructor(item: any) {
        this._setMeta(item);
        this._setEpisodes(item);
    }

    private _setMeta({meta, from, to}: any) {
        this.timeUnknown = meta?.timeUnknown ?? false;
        this.from = from ?? 0;
        this.to = to ?? 0;
    }

    private _setEpisodes({episodes}: any) {
        this.episodes = episodes ?? [];
    }
}
