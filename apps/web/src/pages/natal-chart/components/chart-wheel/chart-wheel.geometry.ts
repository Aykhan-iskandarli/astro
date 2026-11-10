// Pure geometry for the chart wheel. Longitudes come from the engine; nothing astronomical is computed here.

export const norm = (deg: number) => ((deg % 360) + 360) % 360;

/**
 * Screen angle (degrees, counter-clockwise from +x) for an ecliptic longitude.
 * Convention: the Ascendant sits on the left (180°) and the zodiac runs counter-clockwise.
 */
export const screenAngle = (lon: number, ascendant: number) => norm(180 + lon - ascendant);

export const polar = (cx: number, cy: number, r: number, angleDeg: number) => {
    const a = (angleDeg * Math.PI) / 180;
    return {x: cx + r * Math.cos(a), y: cy - r * Math.sin(a)};
};

/** Annulus sector between two screen angles (counter-clockwise from a0 to a1). */
export const sectorPath = (cx: number, cy: number, rInner: number, rOuter: number, a0: number, a1: number) => {
    const sweep = norm(a1 - a0);
    const large = sweep > 180 ? 1 : 0;
    const p1 = polar(cx, cy, rOuter, a0);
    const p2 = polar(cx, cy, rOuter, a1);
    const p3 = polar(cx, cy, rInner, a1);
    const p4 = polar(cx, cy, rInner, a0);
    // SVG y grows downward, so counter-clockwise on screen is sweep-flag 0
    return [
        `M ${p1.x.toFixed(3)} ${p1.y.toFixed(3)}`,
        `A ${rOuter} ${rOuter} 0 ${large} 0 ${p2.x.toFixed(3)} ${p2.y.toFixed(3)}`,
        `L ${p3.x.toFixed(3)} ${p3.y.toFixed(3)}`,
        `A ${rInner} ${rInner} 0 ${large} 1 ${p4.x.toFixed(3)} ${p4.y.toFixed(3)}`,
        'Z',
    ].join(' ');
};

/** Signed smallest difference b - a in (-180, 180]. */
export const delta = (a: number, b: number) => {
    const d = norm(b - a);
    return d > 180 ? d - 360 : d;
};

/**
 * Spread glyph positions so that neighbours are at least `minGap` degrees apart, keeping order and
 * staying as close as possible to the true longitudes. Returns display longitudes in input order.
 */
export const spreadLongitudes = (lons: number[], minGap: number, iterations = 200): number[] => {
    const n = lons.length;
    if (n < 2) return [...lons];
    const gap = Math.min(minGap, 360 / n);
    const order = lons.map((lon, i) => ({i, lon: norm(lon)})).sort((a, b) => a.lon - b.lon);
    // Unwrap onto a line starting after the largest empty arc so clusters never straddle the seam
    let widest = 0;
    let start = 0;
    for (let k = 0; k < n; k++) {
        const g = norm(order[(k + 1) % n].lon - order[k].lon) || (n === 1 ? 360 : 0);
        if (g > widest) {
            widest = g;
            start = (k + 1) % n;
        }
    }
    const seq = Array.from({length: n}, (_, k) => order[(start + k) % n]);
    const base = seq[0].lon;
    const target = seq.map((o) => base + norm(o.lon - base));
    const pos = [...target];
    for (let it = 0; it < iterations; it++) {
        let moved = false;
        for (let k = 0; k < n - 1; k++) {
            const overlap = gap - (pos[k + 1] - pos[k]);
            if (overlap > 1e-9) {
                pos[k] -= overlap / 2;
                pos[k + 1] += overlap / 2;
                moved = true;
            }
        }
        // Gentle pull back toward the true positions
        for (let k = 0; k < n; k++) pos[k] += (target[k] - pos[k]) * 0.02;
        if (!moved) break;
    }
    // Final pass guarantees the minimum gap left to right
    for (let k = 1; k < n; k++) if (pos[k] - pos[k - 1] < gap) pos[k] = pos[k - 1] + gap;
    const out = new Array<number>(n);
    seq.forEach((o, k) => {
        out[o.i] = norm(pos[k]);
    });
    return out;
};
