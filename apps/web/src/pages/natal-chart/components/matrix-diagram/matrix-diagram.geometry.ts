// Layout of the Destiny Matrix octagram (screen coordinates, y grows downward).
// Straight square: A left (day), B top (month), C right (year), D bottom. Diagonal (ancestral) square: F, G, H, I.

export const SIZE = 600;
export const C = SIZE / 2;
export const R = 236;

export type MatrixGroup = 'anchor' | 'center' | 'personal' | 'ancestral' | 'love' | 'money';

export interface IMatrixNode {
    key: string;
    x: number;
    y: number;
    r: number;
    group: MatrixGroup;
}

const ANGLES: Record<string, number> = {A: 180, B: 90, C: 0, D: 270, F: 135, G: 45, H: 315, I: 225};

export const at = (angleDeg: number, frac: number) => {
    const a = (angleDeg * Math.PI) / 180;
    return {x: C + R * frac * Math.cos(a), y: C - R * frac * Math.sin(a)};
};

const node = (key: string, angle: number, frac: number, r: number, group: MatrixGroup): IMatrixNode => ({key, ...at(angle, frac), r, group});

const mid = (key: string, a: IMatrixNode, b: IMatrixNode, r: number, group: MatrixGroup): IMatrixNode =>
    ({key, x: (a.x + b.x) / 2, y: (a.y + b.y) / 2, r, group});

export const buildNodes = (): IMatrixNode[] => {
    const nodes: IMatrixNode[] = [];
    // Outer anchors and corners
    for (const k of ['A', 'B', 'C', 'D']) nodes.push(node(k, ANGLES[k], 1, 27, 'anchor'));
    for (const k of ['F', 'G', 'H', 'I']) nodes.push(node(k, ANGLES[k], 1, 24, 'ancestral'));
    // Points on the axes toward the centre (earth line A-O-J-S-E-L-Q-C, sky line B-P-K-T-E-M-N-D)
    nodes.push(node('O', 180, 0.79, 19, 'personal'), node('J', 180, 0.6, 18, 'personal'), node('S', 180, 0.4, 16, 'personal'));
    nodes.push(node('P', 90, 0.79, 19, 'personal'), node('K', 90, 0.6, 18, 'personal'), node('T', 90, 0.4, 16, 'personal'));
    nodes.push(node('Q', 0, 0.79, 19, 'money'), node('L', 0, 0.6, 18, 'money'));
    nodes.push(node('N', 270, 0.79, 19, 'personal'), node('M', 270, 0.6, 18, 'love'));
    // Ancestral diagonals
    for (const k of ['F', 'G', 'H', 'I']) {
        nodes.push(node(`${k}1`, ANGLES[k], 0.79, 17, 'ancestral'), node(`${k}2`, ANGLES[k], 0.6, 16, 'ancestral'));
    }
    // Love / money node between M (bottom) and L (right)
    const L = nodes.find((n) => n.key === 'L')!;
    const M = nodes.find((n) => n.key === 'M')!;
    const Rn = mid('R', L, M, 16, 'love');
    nodes.push(Rn, mid('R1', M, Rn, 13, 'love'), mid('R2', L, Rn, 13, 'money'));
    nodes.push({key: 'E', x: C, y: C, r: 32, group: 'center'});
    return nodes;
};

/** Age labels at the eight corners, clockwise from the left (A = 0). */
export const AGE_CORNERS = [
    {key: 'A', age: 0}, {key: 'F', age: 10}, {key: 'B', age: 20}, {key: 'G', age: 30},
    {key: 'C', age: 40}, {key: 'H', age: 50}, {key: 'D', age: 60}, {key: 'I', age: 70},
].map((c) => ({...c, ...at(ANGLES[c.key], 1.2)}));
