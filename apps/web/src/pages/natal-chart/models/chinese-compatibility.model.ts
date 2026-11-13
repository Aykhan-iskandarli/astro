// Typed view of /api/chinese/compatibility: year animals of two birth dates and their classical relation.

export interface IYearAnimal {
    date: string;
    id: string;
    char: string;
    element: string;
    yang: boolean;
    animal: string;
}

export type ChineseRelation = 'same' | 'sixHarmony' | 'threeHarmony' | 'clash' | 'harm' | 'neutral';

export default class ChineseCompatibilityModel {
    public first: IYearAnimal | null = null;
    public second: IYearAnimal | null = null;
    public relation: ChineseRelation = 'neutral';

    constructor(item: any) {
        this._setPeople(item);
        this._setRelation(item);
    }

    private _setPeople({first, second}: any) {
        this.first = first ?? null;
        this.second = second ?? null;
    }

    private _setRelation({relation}: any) {
        this.relation = relation ?? 'neutral';
    }
}
