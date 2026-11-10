import az from './az.json';
import en from './en.json';

export type ContentLang = 'az' | 'en';
export type Content = typeof en;

export const content: Record<ContentLang, Content> = {az, en};

/**
 * Short interpretation for a placement, composed from three standalone sentences
 * (point + sign + house). Each sentence is grammatical on its own, so no inflection is needed.
 * Specific overrides (e.g. "sun.aries") can be added later without changing callers.
 */
export const describePlacement = (
    lang: ContentLang,
    pointId: string,
    sign: string,
    house: number | null,
): string[] => {
    const c = content[lang];
    const point = c.points[pointId as keyof Content['points']];
    const signText = c.signs[sign as keyof Content['signs']];
    const houseText = house ? c.houses[String(house) as keyof Content['houses']] : null;
    return [point?.short, signText?.expression, houseText?.expression].filter(Boolean) as string[];
};
