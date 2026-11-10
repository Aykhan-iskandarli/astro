// Astrological glyphs (U+FE0E forces text, not emoji, presentation) and formatting helpers.
const VS15 = '︎';

export const POINT_GLYPHS: Record<string, string> = {
    sun: '☉', moon: '☽', mercury: '☿', venus: '♀', mars: '♂',
    jupiter: '♃', saturn: '♄', uranus: '♅', neptune: '♆', pluto: '♇',
    northNode: '☊', southNode: '☋', lilith: '⚸', chiron: '⚷',
    partOfFortune: '', // drawn as SVG (⊗ is not in the bundled symbol font)
    asc: 'AC', mc: 'MC', dc: 'DC', ic: 'IC',
};

export const SIGNS = ['aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo',
    'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces'] as const;

export const SIGN_GLYPHS: Record<string, string> = Object.fromEntries(
    SIGNS.map((s, i) => [s, String.fromCodePoint(0x2648 + i)]),
);

export const ASPECT_GLYPHS: Record<string, string> = {
    conjunction: '☌', opposition: '☍', trine: '△', square: '□', sextile: '⚹',
    quincunx: '⚻', semisextile: '⚺', semisquare: '∠', sesquiquadrate: '⚼',
};

export const ELEMENT_OF_SIGN: Record<string, 'fire' | 'earth' | 'air' | 'water'> = Object.fromEntries(
    SIGNS.map((s, i) => [s, (['fire', 'earth', 'air', 'water'] as const)[i % 4]]),
);

export const glyph = (g: string | undefined) => (g && g.length === 1 ? g + VS15 : g ?? '');

export type AspectTone = 'harmonious' | 'tense' | 'neutral' | 'minor';

export const aspectTone = (type: string): AspectTone => {
    if (type === 'trine' || type === 'sextile') return 'harmonious';
    if (type === 'square' || type === 'opposition') return 'tense';
    if (type === 'conjunction') return 'neutral';
    return 'minor';
};

const pad = (n: number) => String(n).padStart(2, '0');

/** 24°01′ — degree within sign and arcminute (values come straight from the engine). */
export const formatDegree = (degree: number | null, minute: number | null) =>
    degree === null || minute === null ? '—' : `${degree}°${pad(minute)}′`;

/** UTC ISO instant from the engine -> the viewer's local date/time (DD.MM.YYYY HH:mm). */
export const formatLocal = (iso: string | null, withTime = true) => {
    if (!iso) return '—';
    const d = new Date(iso);
    const date = `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()}`;
    return withTime ? `${date} ${pad(d.getHours())}:${pad(d.getMinutes())}` : date;
};

/** Orb in degrees -> 1°23′ */
export const formatOrb = (orb: number) => {
    const d = Math.floor(orb);
    const m = Math.floor((orb - d) * 60 + 1e-9);
    return `${d}°${pad(m)}′`;
};
