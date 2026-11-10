import {describe, expect, it} from 'vitest';
import {buildNodes, C, R} from './matrix-diagram.geometry';

describe('matrix diagram layout', () => {
    const nodes = buildNodes();
    const byKey = Object.fromEntries(nodes.map((n) => [n.key, n]));

    it('has one node for every engine point', () => {
        const keys = ['A', 'B', 'C', 'D', 'E', 'J', 'K', 'L', 'M', 'O', 'P', 'Q', 'N', 'S', 'T', 'F', 'G', 'H', 'I',
            'F1', 'F2', 'G1', 'G2', 'H1', 'H2', 'I1', 'I2', 'R', 'R1', 'R2'];
        expect(nodes.map((n) => n.key).sort()).toEqual([...keys].sort());
    });

    it('places the anchors on the four sides', () => {
        expect(byKey.A.x).toBeCloseTo(C - R);
        expect(byKey.B.y).toBeCloseTo(C - R);
        expect(byKey.C.x).toBeCloseTo(C + R);
        expect(byKey.D.y).toBeCloseTo(C + R);
        expect([byKey.E.x, byKey.E.y]).toEqual([C, C]);
    });

    it('never overlaps two nodes', () => {
        for (let i = 0; i < nodes.length; i++) {
            for (let j = i + 1; j < nodes.length; j++) {
                const a = nodes[i];
                const b = nodes[j];
                const d = Math.hypot(a.x - b.x, a.y - b.y);
                expect(d, `${a.key}-${b.key}`).toBeGreaterThan(a.r + b.r);
            }
        }
    });
});
