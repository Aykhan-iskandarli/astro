import {describe, expect, it} from 'vitest';
import {delta, norm, polar, screenAngle, spreadLongitudes} from './chart-wheel.geometry';

const minNeighbourGap = (lons: number[]) => {
    const s = [...lons].map(norm).sort((a, b) => a - b);
    return Math.min(...s.map((v, i) => norm(s[(i + 1) % s.length] - v)));
};

describe('screenAngle', () => {
    it('puts the Ascendant on the left and runs counter-clockwise', () => {
        expect(screenAngle(184.6, 184.6)).toBe(180);
        expect(screenAngle(184.6 + 90, 184.6)).toBeCloseTo(270);  // 90° later in the zodiac = bottom
        expect(screenAngle(184.6 - 90, 184.6)).toBeCloseTo(90);   // MC side = top
    });
});

describe('polar', () => {
    it('uses screen coordinates (y down)', () => {
        const top = polar(100, 100, 50, 90);
        expect(top.x).toBeCloseTo(100);
        expect(top.y).toBeCloseTo(50);
    });
});

describe('delta', () => {
    it('wraps across 0°', () => {
        expect(delta(350, 10)).toBe(20);
        expect(delta(10, 350)).toBe(-20);
    });
});

describe('spreadLongitudes', () => {
    it('keeps well-separated points where they are', () => {
        const lons = [10, 100, 200, 300];
        expect(spreadLongitudes(lons, 6)).toEqual(lons);
    });

    it('enforces the minimum gap in a cluster', () => {
        const lons = [270.1, 271, 271.5, 272, 280];
        const out = spreadLongitudes(lons, 6);
        expect(minNeighbourGap(out)).toBeGreaterThanOrEqual(6 - 1e-6);
    });

    it('preserves zodiacal order and stays close to the truth', () => {
        const lons = [278.17, 283.72, 294.04, 225.4];
        const out = spreadLongitudes(lons, 7);
        expect(delta(out[0], out[1])).toBeGreaterThan(0);
        expect(delta(out[1], out[2])).toBeGreaterThan(0);
        out.forEach((v, i) => expect(Math.abs(delta(lons[i], v))).toBeLessThan(10));
    });

    it('handles a cluster that straddles 0° Aries', () => {
        const lons = [358, 359, 0.5, 1, 120];
        const out = spreadLongitudes(lons, 5);
        expect(minNeighbourGap(out)).toBeGreaterThanOrEqual(5 - 1e-6);
        expect(Math.abs(delta(lons[2], out[2]))).toBeLessThan(10);
    });

    it('never asks for more gap than the circle allows', () => {
        const lons = Array.from({length: 20}, (_, i) => i * 0.1);
        expect(minNeighbourGap(spreadLongitudes(lons, 30))).toBeGreaterThanOrEqual(18 - 1e-6);
    });
});
