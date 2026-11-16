/**
 * The draconic chart: every longitude is turned so that the North Node stands at 0° Aries (draconic longitude =
 * tropical longitude minus the North Node longitude). The positions are only a shift of the natal ones; nothing is
 * estimated. Draconic houses are not drawn here: only the planets, the Ascendant and the Midheaven are shifted.
 */
import {TEN} from './depth';

export interface IDraconicInput {
    id: string | null;
    longitude: number | null;
}

export interface IDraconicPoint {
    id: string;
    longitude: number;
    sign: string;
    degree: number;
}

export interface IDraconicContact {
    draconic: string;
    natal: string;
    orb: number;
}

export const SIGNS = ['aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo', 'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces'];
/** Orb in degrees within which a draconic point counts as touching a natal one. */
export const DRACONIC_ORB = 1.5;
export const DRACONIC_IDS = [...TEN, 'asc', 'mc'];

const norm = (d: number) => ((d % 360) + 360) % 360;

export const shift = (longitude: number, node: number) => norm(longitude - node);

export const draconicPoints = (points: IDraconicInput[]): IDraconicPoint[] => {
    const node = points.find((p) => p.id === 'northNode')?.longitude;
    if (node === undefined || node === null) return [];
    return DRACONIC_IDS.flatMap((id) => {
        const p = points.find((x) => x.id === id);
        if (!p || p.longitude === null) return [];
        const longitude = shift(p.longitude, node);
        return [{id, longitude, sign: SIGNS[Math.floor(longitude / 30)], degree: longitude % 30}];
    });
};

const sep = (a: number, b: number) => {
    const d = Math.abs(a - b) % 360;
    return d > 180 ? 360 - d : d;
};

/** Draconic points that lie on a natal point (within the orb), closest first. A planet on its own natal place is skipped. */
export const draconicContacts = (points: IDraconicInput[], orb = DRACONIC_ORB): IDraconicContact[] => {
    const natal = DRACONIC_IDS.flatMap((id) => {
        const p = points.find((x) => x.id === id);
        return p && p.longitude !== null ? [{id, longitude: p.longitude}] : [];
    });
    return draconicPoints(points).flatMap((d) => natal
        .filter((n) => n.id !== d.id && sep(d.longitude, n.longitude) <= orb)
        .map((n) => ({draconic: d.id, natal: n.id, orb: sep(d.longitude, n.longitude)})))
        .sort((a, b) => a.orb - b.orb);
};
