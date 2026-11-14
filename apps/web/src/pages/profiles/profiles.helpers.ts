import {IRelation, ISavedChart} from 'store/store';

const RELATIONS: IRelation[] = ['self', 'partner', 'family', 'friend', 'other'];
const isDate = (v: unknown) => typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v);
const isTime = (v: unknown) => v === null || (typeof v === 'string' && /^\d{2}:\d{2}$/.test(v));
const isNum = (v: unknown, lo: number, hi: number) => typeof v === 'number' && Number.isFinite(v) && v >= lo && v <= hi;

/**
 * Validate a profiles backup file. Only well-formed entries are kept; anything unexpected is dropped,
 * so a hand-edited or foreign file can never put broken data into the store.
 */
export const parseProfilesBackup = (text: string): ISavedChart[] => {
    const data = JSON.parse(text);
    const list = Array.isArray(data) ? data : data?.profiles;
    if (!Array.isArray(list)) throw new Error('not a profiles backup');
    const out: ISavedChart[] = [];
    for (const item of list.slice(0, 50)) {
        const i = item?.input;
        if (!item || typeof item.id !== 'string' || !i) continue;
        if (!isDate(i.date) || !isTime(i.time ?? null) || !isNum(i.latitude, -90, 90) || !isNum(i.longitude, -180, 180)) continue;
        if (typeof i.timezone !== 'string' || !i.timezone) continue;
        out.push({
            id: item.id.slice(0, 64),
            savedAt: typeof item.savedAt === 'string' ? item.savedAt : new Date().toISOString(),
            relation: RELATIONS.includes(item.relation) ? item.relation : 'other',
            input: {
                name: typeof i.name === 'string' ? i.name.slice(0, 80) : null,
                date: i.date,
                time: i.time ?? null,
                latitude: i.latitude,
                longitude: i.longitude,
                timezone: i.timezone.slice(0, 64),
                place: typeof i.place === 'string' ? i.place.slice(0, 160) : '',
                houseSystem: ['P', 'K', 'W', 'A'].includes(i.houseSystem) ? i.houseSystem : 'P',
            },
        });
    }
    if (!out.length) throw new Error('no valid profiles');
    return out;
};
