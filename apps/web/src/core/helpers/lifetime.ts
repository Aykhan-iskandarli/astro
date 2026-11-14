export const LIFE_YEARS = 90;
const MS_PER_YEAR = 365.2425 * 24 * 3600 * 1000;

/** Age in years (fractional) of a date or instant, counted from a birth date (YYYY-MM-DD). */
export const ageAt = (birth: string, iso: string) => (new Date(iso).getTime() - new Date(`${birth}T00:00:00Z`).getTime()) / MS_PER_YEAR;

/** Position on the 0-90 timeline, as a percentage clamped to the track. */
export const pct = (age: number) => Math.min(100, Math.max(0, (age / LIFE_YEARS) * 100));

/** Left and width (percent) of a span between two ages; never narrower than `min` so short events stay visible. */
export const span = (from: number, to: number, min = 0.9) => {
    const left = pct(from);
    return {left, width: Math.max(pct(to) - left, min)};
};

/** The rows of cycles, in the order shown: each planet's own life cycles, then the two returns of points. */
export const CYCLE_ROWS = ['jupiter', 'saturn', 'uranus', 'neptune', 'northNode', 'chiron'];

/** Ten-year luck pillars as age spans (the engine gives the age each begins at). */
export const luckSpans = (pillars: {startAge: number}[]) => pillars.map((p, i) => ({
    from: p.startAge,
    to: pillars[i + 1]?.startAge ?? p.startAge + 10,
}));
