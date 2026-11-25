import {describe, expect, it} from 'vitest';
import {adviceKind} from './advice';

describe('adviceKind', () => {
    it('groups the aspects into conjunction, hard and soft, and leaves minor ones out', () => {
        expect(adviceKind('conjunction')).toBe('conjunction');
        expect(adviceKind('square')).toBe('hard');
        expect(adviceKind('opposition')).toBe('hard');
        expect(adviceKind('trine')).toBe('soft');
        expect(adviceKind('sextile')).toBe('soft');
        expect(adviceKind('quincunx')).toBeNull();
    });
});
