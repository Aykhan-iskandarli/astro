// Typed view of /api/charts/timeline: exact dates of slow-planet transits to the natal chart.

export class TimelineEventModel {
    public transit: string | null = null;
    public natal: string | null = null;
    public aspect: string | null = null;
    public at: string | null = null;
    public retrograde: boolean = false;
    public pass: number = 1;
    public passes: number = 1;

    constructor(item: any) {
        this._setTransit(item);
        this._setNatal(item);
        this._setAspect(item);
        this._setAt(item);
        this._setRetrograde(item);
        this._setPass(item);
    }

    private _setTransit({transit}: any) {
        this.transit = transit ?? null;
    }

    private _setNatal({natal}: any) {
        this.natal = natal ?? null;
    }

    private _setAspect({aspect}: any) {
        this.aspect = aspect ?? null;
    }

    private _setAt({at}: any) {
        this.at = at ?? null;
    }

    private _setRetrograde({retrograde}: any) {
        this.retrograde = retrograde ?? false;
    }

    private _setPass({pass, passes}: any) {
        this.pass = pass ?? 1;
        this.passes = passes ?? 1;
    }
}

export default class TimelineModel {
    public start: string | null = null;
    public days: number = 0;
    public events: TimelineEventModel[] = [];

    constructor(item: any) {
        this._setStart(item);
        this._setDays(item);
        this._setEvents(item);
    }

    private _setStart({start}: any) {
        this.start = start ?? null;
    }

    private _setDays({days}: any) {
        this.days = days ?? 0;
    }

    private _setEvents({events}: any) {
        this.events = events?.map((e: any) => new TimelineEventModel(e)) ?? [];
    }
}
