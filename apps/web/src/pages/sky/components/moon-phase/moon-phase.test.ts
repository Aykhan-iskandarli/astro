import {describe, expect, it} from 'vitest';
import {litPath} from './moon-phase.component';

describe('litPath', () => {
    it('full moon: terminator is a full-width ellipse on the other side', () => {
        expect(litPath(1, true)).toBe('M0,-50 A50,50 0 0 1 0,50 A50,50 0 0 1 0,-50Z');
    });
    it('quarter: straight terminator', () => {
        expect(litPath(0.5, true)).toBe('M0,-50 A50,50 0 0 1 0,50 A0,50 0 0 1 0,-50Z');
    });
    it('waxing crescent lights the right side, waning the left', () => {
        expect(litPath(0.25, true)).toBe('M0,-50 A50,50 0 0 1 0,50 A25,50 0 0 0 0,-50Z');
        expect(litPath(0.25, false)).toBe('M0,-50 A50,50 0 0 0 0,50 A25,50 0 0 1 0,-50Z');
    });
});
