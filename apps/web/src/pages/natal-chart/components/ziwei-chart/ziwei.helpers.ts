// Zi Wei Dou Shu via iztro (MIT, github.com/SylarLong/iztro) — computed in the browser, nothing is sent anywhere.
import {astro} from 'iztro';

/** iztro time index: 0 = early Zi (00:00–00:59), 1 = Chou (01–02), …, 11 = Hai (21–22), 12 = late Zi (23:00–23:59). */
export const timeIndex = (hhmm: string): number => {
    const h = Number(hhmm.split(':')[0]);
    return h === 23 ? 12 : Math.floor((h + 1) / 2);
};

/** Grid cell (row, column) of each earthly branch in the traditional 4×4 Zi Wei layout. */
export const BRANCH_CELL: Record<string, [number, number]> = {
    si: [1, 1], woo: [1, 2], wei: [1, 3], shen: [1, 4],
    chen: [2, 1], you: [2, 4],
    mao: [3, 1], xu: [3, 4],
    yin: [4, 1], chou: [4, 2], zi: [4, 3], hai: [4, 4],
};

export const buildAstrolabe = (date: string, time: string, gender: 'male' | 'female') => {
    const [y, m, d] = date.split('-').map(Number);
    return astro.bySolar(`${y}-${m}-${d}`, timeIndex(time), gender, true, 'en-US');
};
