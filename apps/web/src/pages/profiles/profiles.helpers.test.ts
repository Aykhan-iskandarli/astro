import {describe, expect, it} from 'vitest';
import {parseProfilesBackup} from './profiles.helpers';

const good = {
    id: 'a1', savedAt: '2026-11-11T00:00:00Z', relation: 'partner',
    input: {name: 'Aysel', date: '1992-03-04', time: '08:15', latitude: 40.4, longitude: 49.8, timezone: 'Asia/Baku',
        place: 'Bakı', houseSystem: 'P'},
};

describe('parseProfilesBackup', () => {
    it('accepts an exported file and keeps valid entries', () => {
        const out = parseProfilesBackup(JSON.stringify({app: 'astra', profiles: [good]}));
        expect(out).toHaveLength(1);
        expect(out[0].relation).toBe('partner');
        expect(out[0].input.name).toBe('Aysel');
    });
    it('drops malformed entries and normalises unknown fields', () => {
        const bad = {...good, id: 'b', input: {...good.input, latitude: 200}};
        const odd = {...good, id: 'c', relation: 'enemy', input: {...good.input, houseSystem: 'X', time: null}};
        const out = parseProfilesBackup(JSON.stringify([bad, odd]));
        expect(out.map((p) => p.id)).toEqual(['c']);
        expect(out[0].relation).toBe('other');
        expect(out[0].input.houseSystem).toBe('P');
    });
    it('rejects files without any valid profile', () => {
        expect(() => parseProfilesBackup('{"foo": 1}')).toThrow();
        expect(() => parseProfilesBackup('[]')).toThrow();
        expect(() => parseProfilesBackup('not json')).toThrow();
    });
});
