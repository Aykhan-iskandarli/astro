// Typed view of /api/numerology/compatibility. Every number comes from the engine.

export interface INumerologyPair {
    kind: 'lifePath' | 'expression' | 'soulUrge';
    first: number;
    second: number;
    relation: 'same' | 'harmonious' | 'different';
}

export default class NumerologyCompatibilityModel {
    public pairs: INumerologyPair[] = [];
    public ignored: string[] = [];

    constructor(item: any) {
        this._setPairs(item);
        this._setIgnored(item);
    }

    private _setPairs({pairs}: any) {
        this.pairs = pairs ?? [];
    }

    private _setIgnored({people}: any) {
        this.ignored = Array.from(new Set((people ?? []).flatMap((p: any) => p?.ignored ?? [])));
    }
}
