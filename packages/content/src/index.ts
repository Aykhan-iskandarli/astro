import az from './az.json';

export type ContentLang = 'az' | 'en' | 'ru';
// Every language has exactly the same keys (checked by scripts/validate.mjs)
export type Content = typeof az;

/**
 * Loaded languages. Azerbaijani (the default, used by the prerendered pages) ships in the main bundle;
 * the others are fetched on demand with loadContent() so visitors only download the language they read.
 */
export const content: Partial<Record<ContentLang, Content>> = {az};

type Tree = {[key: string]: string | Tree};
const isTree = (v: unknown): v is Tree => typeof v === 'object' && v !== null && !Array.isArray(v);

/** `over` on top of `base`, key by key: anything `over` has not translated yet stays as in `base`. */
const overlay = (base: Tree, over: Tree): Tree => {
    const out: Tree = {...base};
    Object.entries(over).forEach(([k, v]) => {
        const b = out[k];
        out[k] = isTree(v) && isTree(b) ? overlay(b, v) : v;
    });
    return out;
};

const loaders: Record<Exclude<ContentLang, 'az'>, () => Promise<{default: unknown}>> = {
    en: () => import('./en.json'),
    // Russian is translated in stages: whatever is not translated yet is shown in English (never in Azerbaijani)
    ru: () => Promise.all([import('./en.json'), import('./ru.json')])
        .then(([en, ru]) => ({default: overlay(en.default as Tree, ru.default as Tree)})),
};

export const isContentLoaded = (lang: ContentLang) => Boolean(content[lang]);

export const loadContent = async (lang: ContentLang): Promise<Content> => {
    if (!content[lang]) {
        const mod = await loaders[lang as Exclude<ContentLang, 'az'>]();
        content[lang] = mod.default as Content;
    }
    return content[lang]!;
};

/** The language's content, falling back to Azerbaijani until it has loaded. */
export const getContent = (lang: ContentLang): Content => content[lang] ?? content.az!;

/** Text written specifically for a point in a sign (e.g. "sun.aries"), when it exists. */
export const placementText = (lang: ContentLang, pointId: string, sign: string): string | null => {
    const byPoint = (getContent(lang).placements as Record<string, Record<string, string>>)[pointId];
    return byPoint?.[sign] ?? null;
};

/**
 * Interpretation for a placement. A specific point+sign text is used when one exists; otherwise the
 * generic point and sign sentences are combined. The house sentence is appended either way.
 * Each sentence is grammatical on its own, so no inflection is needed.
 */
export const describePlacement = (
    lang: ContentLang,
    pointId: string,
    sign: string,
    house: number | null,
): string[] => {
    const c = getContent(lang);
    const point = c.points[pointId as keyof Content['points']];
    const specific = placementText(lang, pointId, sign);
    const signText = c.signs[sign as keyof Content['signs']];
    const core = specific ? [point?.short, specific] : [point?.short, signText?.expression];
    return [...core, house ? houseSentence(lang, pointId, house) : null].filter(Boolean) as string[];
};

/** A point in a house: the specific text (e.g. "venus" in 7) when written, else the generic house sentence. */
export const houseSentence = (lang: ContentLang, pointId: string, house: number): string | null => {
    const c = getContent(lang);
    const specific = (c.inHouse as Record<string, Record<string, string>>)[pointId]?.[String(house)];
    return specific ?? c.houses[String(house) as keyof Content['houses']]?.expression ?? null;
};

/**
 * What a contact between two planets is about (independent of the aspect type); order does not matter.
 * A planet to itself is a life cycle, which depends on the aspect: with `aspect` the text of that cycle (a Saturn
 * return, a Uranus opposition, ...) is given and nothing for an aspect that is not one; without it, the planet's
 * general cycle text.
 */
export const aspectPairText = (lang: ContentLang, a: string, b: string, aspect?: string): string | null => {
    if (a === b) {
        if (!aspect) return (getContent(lang).planetCycles as Record<string, string>)[a] ?? null;
        const cycle = (getContent(lang).transformations.cycle as Record<string, {name: string; text: string}>)[`${a}-${aspect}`];
        return cycle ? `${cycle.name}: ${cycle.text.split('. ')[0]}.` : null;
    }
    const pairs = getContent(lang).aspectPairs as Record<string, string>;
    return pairs[`${a}-${b}`] ?? pairs[`${b}-${a}`] ?? null;
};

/** The long, layered reading of a placement: the planet, the sign, the house and the aspect types it makes. */
export const fullReading = (
    lang: ContentLang,
    pointId: string,
    sign: string,
    house: number | null,
    aspectTypes: string[] = [],
) => {
    const r = getContent(lang).reading as {
        planet: Record<string, string>; sign: Record<string, string>; house: Record<string, string>; aspect: Record<string, string>;
        bigThree?: Record<string, Record<string, string>>;
    };
    return {
        specific: r.bigThree?.[pointId]?.[sign] ?? null,
        planet: r.planet[pointId] ?? null,
        sign: r.sign[sign] ?? null,
        house: house ? r.house[String(house)] ?? null : null,
        aspects: [...new Set(aspectTypes)].map((type) => ({type, text: r.aspect[type]})).filter((a) => a.text),
    };
};

const TONE_OF: Record<string, string> = {conjunction: 'fusion', trine: 'easy', sextile: 'easy', square: 'hard', opposition: 'hard'};

/**
 * The long reading of an aspect between two points: what the two planets mean together (when written for that pair),
 * how the aspect type works, and whether it is a fusion, an easy or a hard contact. Order of the two points does not matter.
 */
export const aspectReading = (lang: ContentLang, a: string, b: string, type: string) => {
    const r = getContent(lang).reading as {
        planet: Record<string, string>; aspect: Record<string, string>; pair: Record<string, string>; tone: Record<string, string>;
    };
    const tone = TONE_OF[type] ?? null;
    return {
        pair: r.pair[`${a}-${b}`] ?? r.pair[`${b}-${a}`] ?? null,
        first: r.planet[a] ?? null,
        second: r.planet[b] ?? null,
        aspect: r.aspect[type] ?? null,
        tone: tone ? r.tone[tone] ?? null : null,
    };
};
