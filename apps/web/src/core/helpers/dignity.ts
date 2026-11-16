/**
 * Essential dignities by William Lilly's scoring (Christian Astrology, 1647) for the seven traditional planets:
 * domicile +5, exaltation +4, triplicity +3, term +2, face +1; detriment -5, fall -4, and -5 for a planet with no
 * dignity at all (peregrine). Tables: the Dorothean triplicity rulers (day / night), the Egyptian terms and the Chaldean
 * faces, as listed in the kerykeion documentation (kerykeion.net, "Dignities") and in the classical sources. The
 * participating triplicity ruler is not scored; without a birth time the sect (day or night) is unknown, so the
 * triplicity is left out.
 */
export type Dignity = 'domicile' | 'exaltation' | 'triplicity' | 'term' | 'face';

export const SCORES: Record<Dignity | 'detriment' | 'fall' | 'peregrine', number> = {
    domicile: 5, exaltation: 4, triplicity: 3, term: 2, face: 1, detriment: -5, fall: -4, peregrine: -5,
};

export const SEVEN = ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn'];
export const SIGNS = ['aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo', 'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces'];

export const DOMICILE: Record<string, string[]> = {
    sun: ['leo'], moon: ['cancer'], mercury: ['gemini', 'virgo'], venus: ['taurus', 'libra'], mars: ['aries', 'scorpio'],
    jupiter: ['sagittarius', 'pisces'], saturn: ['capricorn', 'aquarius'],
};
export const EXALTATION: Record<string, string> = {sun: 'aries', moon: 'taurus', mercury: 'virgo', venus: 'pisces', mars: 'capricorn', jupiter: 'cancer', saturn: 'libra'};

const opposite = (sign: string) => SIGNS[(SIGNS.indexOf(sign) + 6) % 12];

/** Dorothean triplicity rulers: [day, night, participating] by element. */
export const TRIPLICITY: Record<'fire' | 'earth' | 'air' | 'water', [string, string, string]> = {
    fire: ['sun', 'jupiter', 'saturn'], earth: ['venus', 'moon', 'mars'], air: ['saturn', 'mercury', 'jupiter'], water: ['venus', 'mars', 'moon'],
};
export const ELEMENT_OF: Record<string, 'fire' | 'earth' | 'air' | 'water'> = {
    aries: 'fire', leo: 'fire', sagittarius: 'fire', taurus: 'earth', virgo: 'earth', capricorn: 'earth',
    gemini: 'air', libra: 'air', aquarius: 'air', cancer: 'water', scorpio: 'water', pisces: 'water',
};

/** Egyptian terms: for each sign the five rulers with the degree each term ends at. */
export const TERMS: Record<string, [string, number][]> = {
    aries: [['jupiter', 6], ['venus', 12], ['mercury', 20], ['mars', 25], ['saturn', 30]],
    taurus: [['venus', 8], ['mercury', 14], ['jupiter', 22], ['saturn', 27], ['mars', 30]],
    gemini: [['mercury', 6], ['jupiter', 12], ['venus', 17], ['mars', 24], ['saturn', 30]],
    cancer: [['mars', 7], ['venus', 13], ['mercury', 19], ['jupiter', 26], ['saturn', 30]],
    leo: [['jupiter', 6], ['venus', 11], ['saturn', 18], ['mercury', 24], ['mars', 30]],
    virgo: [['mercury', 7], ['venus', 17], ['jupiter', 21], ['mars', 28], ['saturn', 30]],
    libra: [['saturn', 6], ['mercury', 14], ['jupiter', 21], ['venus', 28], ['mars', 30]],
    scorpio: [['mars', 7], ['venus', 11], ['mercury', 19], ['jupiter', 24], ['saturn', 30]],
    sagittarius: [['jupiter', 12], ['venus', 17], ['mercury', 21], ['saturn', 26], ['mars', 30]],
    capricorn: [['mercury', 7], ['jupiter', 14], ['venus', 22], ['saturn', 26], ['mars', 30]],
    aquarius: [['mercury', 7], ['venus', 13], ['jupiter', 20], ['mars', 25], ['saturn', 30]],
    pisces: [['venus', 12], ['jupiter', 16], ['mercury', 19], ['mars', 28], ['saturn', 30]],
};

/** Chaldean faces: ten degrees each, Mars first at 0 Aries, then Sun, Venus, Mercury, Moon, Saturn, Jupiter, repeating. */
export const FACE_ORDER = ['mars', 'sun', 'venus', 'mercury', 'moon', 'saturn', 'jupiter'];
export const faceRuler = (sign: string, degree: number) => FACE_ORDER[(SIGNS.indexOf(sign) * 3 + Math.min(2, Math.floor(degree / 10))) % 7];

export const termRuler = (sign: string, degree: number) => (TERMS[sign].find(([, end]) => degree < end) ?? TERMS[sign][4])[0];

export interface IDignityRow {
    id: string;
    sign: string;
    degree: number;
    dignities: Dignity[];
    detriment: boolean;
    fall: boolean;
    peregrine: boolean;
    score: number;
}

/** The scored dignities of one planet. `degree` is the position in the sign (0-30); `day` is the sect, or null if unknown. */
export const dignityRow = (id: string, sign: string, degree: number, day: boolean | null): IDignityRow => {
    const dignities: Dignity[] = [];
    if (DOMICILE[id]?.includes(sign)) dignities.push('domicile');
    if (EXALTATION[id] === sign) dignities.push('exaltation');
    if (day !== null) {
        const [d, n] = TRIPLICITY[ELEMENT_OF[sign]];
        if ((day ? d : n) === id) dignities.push('triplicity');
    }
    if (termRuler(sign, degree) === id) dignities.push('term');
    if (faceRuler(sign, degree) === id) dignities.push('face');
    const detriment = DOMICILE[id]?.some((s) => opposite(s) === sign) ?? false;
    const fall = EXALTATION[id] ? opposite(EXALTATION[id]) === sign : false;
    // Peregrine: no dignity of any of the five kinds (only when the sect is known, since the triplicity needs it)
    const peregrine = day !== null && dignities.length === 0;
    const score = dignities.reduce((s, d) => s + SCORES[d], 0) + (detriment ? SCORES.detriment : 0) + (fall ? SCORES.fall : 0) + (peregrine ? SCORES.peregrine : 0);
    return {id, sign, degree, dignities, detriment, fall, peregrine, score};
};

export interface IDignityPoint {
    id: string | null;
    sign: string | null;
    degree: number | null;
    minute: number | null;
}

export const dignityTable = (points: IDignityPoint[], day: boolean | null): IDignityRow[] => SEVEN.flatMap((id) => {
    const p = points.find((x) => x.id === id);
    return p && p.sign && p.degree !== null ? [dignityRow(id, p.sign, p.degree + (p.minute ?? 0) / 60, day)] : [];
});
