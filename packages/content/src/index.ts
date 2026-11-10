import az from './az.json';
import en from './en.json';

export type ContentLang = 'az' | 'en';
export type Content = typeof en;

export const content: Record<ContentLang, Content> = {az, en};

/** Text written specifically for a point in a sign (e.g. "sun.aries"), when it exists. */
export const placementText = (lang: ContentLang, pointId: string, sign: string): string | null => {
    const byPoint = (content[lang].placements as Record<string, Record<string, string>>)[pointId];
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
    const c = content[lang];
    const point = c.points[pointId as keyof Content['points']];
    const specific = placementText(lang, pointId, sign);
    const signText = c.signs[sign as keyof Content['signs']];
    const core = specific ? [point?.short, specific] : [point?.short, signText?.expression];
    return [...core, house ? houseSentence(lang, pointId, house) : null].filter(Boolean) as string[];
};

/** A point in a house: the specific text (e.g. "venus" in 7) when written, else the generic house sentence. */
export const houseSentence = (lang: ContentLang, pointId: string, house: number): string | null => {
    const c = content[lang];
    const specific = (c.inHouse as Record<string, Record<string, string>>)[pointId]?.[String(house)];
    return specific ?? c.houses[String(house) as keyof Content['houses']]?.expression ?? null;
};

/** What a contact between two planets is about (independent of the aspect type); order does not matter. */
export const aspectPairText = (lang: ContentLang, a: string, b: string): string | null => {
    // A transit to the same natal planet is that planet's cycle (e.g. a Saturn return or square)
    if (a === b) return (content[lang].planetCycles as Record<string, string>)[a] ?? null;
    const pairs = content[lang].aspectPairs as Record<string, string>;
    return pairs[`${a}-${b}`] ?? pairs[`${b}-${a}`] ?? null;
};
