import az from './az.json';

export type ContentLang = 'az' | 'en' | 'ru';
// Every language has exactly the same keys (checked by scripts/validate.mjs)
export type Content = typeof az;

/**
 * Loaded languages. Azerbaijani (the default, used by the prerendered pages) ships in the main bundle;
 * the others are fetched on demand with loadContent() so visitors only download the language they read.
 */
export const content: Partial<Record<ContentLang, Content>> = {az};

const loaders: Record<Exclude<ContentLang, 'az'>, () => Promise<{default: unknown}>> = {
    en: () => import('./en.json'),
    ru: () => import('./ru.json'),
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

/** What a contact between two planets is about (independent of the aspect type); order does not matter. */
export const aspectPairText = (lang: ContentLang, a: string, b: string): string | null => {
    // A transit to the same natal planet is that planet's cycle (e.g. a Saturn return or square)
    if (a === b) return (getContent(lang).planetCycles as Record<string, string>)[a] ?? null;
    const pairs = getContent(lang).aspectPairs as Record<string, string>;
    return pairs[`${a}-${b}`] ?? pairs[`${b}-${a}`] ?? null;
};
