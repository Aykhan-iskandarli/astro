import {describe, expect, it} from 'vitest';
import {moonAspectKey} from './astro';

describe('moonAspectKey', () => {
    it('keeps a point for a normal Moon aspect', () => {
        expect(moonAspectKey('venus', 'trine')).toBe('venus');
        expect(moonAspectKey('moon', 'conjunction')).toBe('moon');
    });
    it('drops the natal Moon for anything but a conjunction (its text is the monthly return, not the aspect)', () => {
        expect(moonAspectKey('moon', 'square')).toBeNull();
        expect(moonAspectKey('moon', 'sextile')).toBeNull();
    });
});
