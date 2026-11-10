// Self-hosted fonts: Playfair Display (headings) and Inter (body), latin + latin-ext only.
// Preloaded by the prerendered HTML (scripts/prerender.mjs). Plain swap with an ordinary fallback re-laid
// out the text when the font arrived: a second, later LCP and up to 0.12 CLS (measured). Fix: swap + a
// metric-matched fallback face, so first paint is immediate and the swap does not move anything.
import latin400 from '@fontsource/playfair-display/files/playfair-display-latin-400-normal.woff2?url';
import latin500 from '@fontsource/playfair-display/files/playfair-display-latin-500-normal.woff2?url';
import latinExt400 from '@fontsource/playfair-display/files/playfair-display-latin-ext-400-normal.woff2?url';
import latinExt500 from '@fontsource/playfair-display/files/playfair-display-latin-ext-500-normal.woff2?url';
import interLatin from '@fontsource-variable/inter/files/inter-latin-wght-normal.woff2?url';
import interLatinExt from '@fontsource-variable/inter/files/inter-latin-ext-wght-normal.woff2?url';

const LATIN = 'U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD';
// latin-ext covers Azerbaijani ə (U+0259), ğ, ş, ı…
const LATIN_EXT = 'U+0100-02BA,U+02BD-02C5,U+02C7-02CC,U+02CE-02D7,U+02DD-02FF,U+0304,U+0308,U+0329,U+1D00-1DBF,U+1E00-1E9F,U+1EF2-1EFF,U+2020,U+20A0-20AB,U+20AD-20C0,U+2113,U+2C60-2C7F,U+A720-A7FF';

const face = (src: string, weight: number | string, range: string, family = '"Playfair Display"') => ({
    fontFamily: family,
    fontStyle: 'normal',
    fontWeight: weight,
    fontDisplay: 'swap', // safe now: the metric-matched fallback keeps the layout identical
    src: `url(${src}) format("woff2")`,
    unicodeRange: range,
});

// Metric-matched local fallbacks (values computed from @capsizecss/metrics, the technique Next.js uses):
// layout with the fallback has the same line boxes as the web font, so the late font swap does not shift.
const fallback = (family: string, local: string, m: Record<string, string>) => ({
    fontFamily: family,
    src: local,
    sizeAdjust: m.sizeAdjust,
    ascentOverride: m.ascentOverride,
    descentOverride: m.descentOverride,
    lineGapOverride: m.lineGapOverride,
});

const fontFaces = {
    '@font-face': [
        fallback('"Inter Fallback"', 'local("Arial"), local("Helvetica"), local("Liberation Sans")',
            {sizeAdjust: '107.12%', ascentOverride: '90.44%', descentOverride: '22.52%', lineGapOverride: '0%'}),
        fallback('"Playfair Fallback"', 'local("Georgia"), local("Times New Roman"), local("Liberation Serif")',
            {sizeAdjust: '101.39%', ascentOverride: '106.72%', descentOverride: '24.76%', lineGapOverride: '0%'}),
        face(latin400, 400, LATIN),
        face(latinExt400, 400, LATIN_EXT),
        face(latin500, 500, LATIN),
        face(latinExt500, 500, LATIN_EXT),
        face(interLatin, '100 900', LATIN, '"Inter Variable"'),
        face(interLatinExt, '100 900', LATIN_EXT, '"Inter Variable"'),
    ],
};

export default fontFaces;
