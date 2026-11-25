/**
 * Repeated themes of a natal chart, counted with the "astrological alphabet": theme N is shared by the N-th sign, the
 * N-th house and the sign's ruling planet (1 = Aries, the 1st house, Mars; 4 = Cancer, the 4th house, the Moon; ...).
 * A theme that turns up several times (a planet in the sign, a planet in the house, the Ascendant or MC in the sign,
 * the ruling planet on an angle) is a main line of the chart. The weights are a plain, stated convention.
 */
export const SIGNS = ['aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo', 'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces'];

/** The (modern) ruling planet of each theme, 1-12. */
export const THEME_RULER = ['mars', 'venus', 'mercury', 'moon', 'sun', 'mercury', 'venus', 'pluto', 'jupiter', 'saturn', 'uranus', 'neptune'];

const PERSONAL = ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'pluto'];
const HEAVY = ['sun', 'moon'];  // the lights count double
const GENERATIONAL = ['uranus', 'neptune', 'pluto'];  // their sign is shared by everyone born in the same years, so only their house counts
const ANGULAR = [1, 4, 7, 10];

export interface IThemePoint {
    id: string | null;
    sign: string | null;
    house?: number | null;
}

export type SourceKind = 'sign' | 'house' | 'asc' | 'mc' | 'rulerAngular';

export interface ISource {
    kind: SourceKind;
    point: string;
    weight: number;
}

export interface ITheme {
    theme: number;   // 1-12
    score: number;
    sources: ISource[];
}

/** Every theme with its score and where the score comes from, highest first (lower number first on a tie). */
export const chartThemes = (points: IThemePoint[], asc: string | null, mc: string | null): ITheme[] => {
    const themes: ITheme[] = Array.from({length: 12}, (_, i) => ({theme: i + 1, score: 0, sources: []}));
    const add = (n: number, s: ISource) => {
        themes[n - 1].sources.push(s);
        themes[n - 1].score += s.weight;
    };
    points.filter((p) => p.id && PERSONAL.includes(p.id)).forEach((p) => {
        const w = HEAVY.includes(p.id!) ? 2 : 1;
        if (p.sign && !GENERATIONAL.includes(p.id!)) add(SIGNS.indexOf(p.sign) + 1, {kind: 'sign', point: p.id!, weight: w});
        if (p.house) add(p.house, {kind: 'house', point: p.id!, weight: w});
        if (p.house && ANGULAR.includes(p.house)) {
            THEME_RULER.forEach((r, i) => {
                if (r === p.id) add(i + 1, {kind: 'rulerAngular', point: p.id!, weight: 1});
            });
        }
    });
    if (asc) add(SIGNS.indexOf(asc) + 1, {kind: 'asc', point: 'asc', weight: 2});
    if (mc) add(SIGNS.indexOf(mc) + 1, {kind: 'mc', point: 'mc', weight: 1});
    return themes.sort((a, b) => b.score - a.score || a.theme - b.theme);
};

/** The main themes: the top three, and only those that turn up at least three times by weight. */
export const mainThemes = (points: IThemePoint[], asc: string | null, mc: string | null, limit = 3, min = 3): ITheme[] => chartThemes(points, asc, mc)
    .filter((t) => t.score >= min)
    .slice(0, limit);
