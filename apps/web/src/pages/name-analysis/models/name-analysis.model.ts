// Typed view of /api/numerology/name. Every number comes from the engine.
import {INumerologyLetter, INumerologyNumber, IPsychomatrix} from 'pages/natal-chart/models/numerology.model';

export interface INameLetter {
    letter: string;
    base: string;
    value: number;
}

export default class NameAnalysisModel {
    public expression: INumerologyNumber | null = null;
    public soulUrge: INumerologyNumber | null = null;
    public personality: INumerologyNumber | null = null;
    public lifePath: INumerologyNumber | null = null;
    public maturity: INumerologyNumber | null = null;
    public letters: INumerologyLetter[] = [];
    public ignored: string[] = [];
    public cornerstone: INameLetter | null = null;
    public capstone: INameLetter | null = null;
    public firstVowel: INameLetter | null = null;
    public inclusion: Record<string, number> = {};
    public karmicLessons: number[] = [];
    public hiddenPassion: number[] = [];
    public subconsciousSelf: number | null = null;
    public balance: INumerologyNumber | null = null;
    public planes: Record<string, number> = {};
    public dominantPlane: string | null = null;
    public chaldean: {compound: number; value: number} | null = null;
    public psychomatrix: IPsychomatrix | null = null;

    constructor(item: any) {
        this._setNumbers(item);
        this._setLetters(item);
        this._setPositions(item);
        this._setCounts(item);
        this._setPlanes(item);
    }

    private _setNumbers({expression, soulUrge, personality, lifePath, maturity, balance, chaldean, psychomatrix}: any) {
        this.psychomatrix = psychomatrix ?? null;
        this.expression = expression ?? null;
        this.soulUrge = soulUrge ?? null;
        this.personality = personality ?? null;
        this.lifePath = lifePath ?? null;
        this.maturity = maturity ?? null;
        this.balance = balance ?? null;
        this.chaldean = chaldean ?? null;
    }

    private _setLetters({letters, ignored}: any) {
        this.letters = letters ?? [];
        this.ignored = ignored ?? [];
    }

    private _setPositions({cornerstone, capstone, firstVowel}: any) {
        this.cornerstone = cornerstone ?? null;
        this.capstone = capstone ?? null;
        this.firstVowel = firstVowel ?? null;
    }

    private _setCounts({inclusion, karmicLessons, hiddenPassion, subconsciousSelf}: any) {
        this.inclusion = inclusion ?? {};
        this.karmicLessons = karmicLessons ?? [];
        this.hiddenPassion = hiddenPassion ?? [];
        this.subconsciousSelf = subconsciousSelf ?? null;
    }

    private _setPlanes({planes, dominantPlane}: any) {
        this.planes = planes ?? {};
        this.dominantPlane = dominantPlane ?? null;
    }
}
