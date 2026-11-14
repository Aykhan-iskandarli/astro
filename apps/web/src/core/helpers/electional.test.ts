import {describe, expect, it} from 'vitest';
import {IElectionDay} from 'pages/natal-chart/models/electional.model';
import {evaluateDay, subtract, TOPIC_HOUSES} from './electional';

const at = (h: number) => `2027-03-10T${String(h).padStart(2, '0')}:00:00Z`;
const ms = (h: number) => new Date(at(h)).getTime();

const day = (over: Partial<IElectionDay> = {}): IElectionDay => ({
    date: '2027-03-10', start: at(0), end: '2027-03-11T00:00:00Z', phase: 'fullMoon', waxing: true, illumination: 0.8,
    signs: [{sign: 'leo', from: null}],
    houses: [{house: 9, from: at(0), to: at(10)}, {house: 10, from: at(10), to: '2027-03-11T00:00:00Z'}],
    voidOfCourse: [], retrograde: [], ...over,
});

describe('subtract', () => {
    it('keeps a window no cut touches', () => {
        expect(subtract({from: ms(1), to: ms(5)}, [{from: ms(8), to: ms(9)}])).toEqual([{from: ms(1), to: ms(5)}]);
    });
    it('splits around a cut inside and trims at the edges', () => {
        expect(subtract({from: ms(1), to: ms(9)}, [{from: ms(3), to: ms(4)}])).toEqual([{from: ms(1), to: ms(3)}, {from: ms(4), to: ms(9)}]);
        expect(subtract({from: ms(1), to: ms(9)}, [{from: ms(0), to: ms(3)}, {from: ms(8), to: ms(12)}])).toEqual([{from: ms(3), to: ms(8)}]);
    });
    it('returns nothing when the cut covers the window', () => {
        expect(subtract({from: ms(2), to: ms(4)}, [{from: ms(1), to: ms(5)}])).toEqual([]);
    });
});

describe('evaluateDay', () => {
    it('is good when the Moon is in a topic house, waxing, not void, and begins something', () => {
        const v = evaluateDay(day(), 'career', 'begin');
        expect(v.state).toBe('good');
        expect(v.windows.map((w) => w.house)).toEqual([10]);
        expect(v.reasons).toEqual([]);
    });
    it('needs a waning Moon to finish something', () => {
        expect(evaluateDay(day(), 'career', 'finish')).toMatchObject({state: 'care', reasons: ['phase']});
        expect(evaluateDay(day({waxing: false}), 'career', 'finish').state).toBe('good');
    });
    it('is care when the whole topic window is void of course', () => {
        const v = evaluateDay(day({voidOfCourse: [{start: at(9), end: '2027-03-11T01:00:00Z', sign: 'leo', nextSign: 'virgo', continuesBefore: false, continuesAfter: false}]}), 'career', 'begin');
        expect(v.state).toBe('care');
        expect(v.reasons).toContain('void');
    });
    it('stays good with a void period that only covers part of the window, and says so', () => {
        const v = evaluateDay(day({voidOfCourse: [{start: at(12), end: at(14), sign: 'leo', nextSign: 'virgo', continuesBefore: false, continuesAfter: false}]}), 'career', 'begin');
        expect(v.state).toBe('good');
        expect(v.reasons).toEqual(['void']);
        expect(v.windows[0].free.length).toBe(2);
    });
    it('cares about Mercury retrograde only for money and travel topics', () => {
        expect(evaluateDay(day({retrograde: ['mercury']}), 'career', 'begin').state).toBe('good');
        expect(evaluateDay(day({retrograde: ['mercury']}), 'travel', 'begin')).toMatchObject({state: 'care', reasons: ['mercury']});
    });
    it('says none when the Moon does not visit the topic houses, unknown without houses', () => {
        expect(evaluateDay(day(), 'home', 'begin').state).toBe('none');
        expect(evaluateDay(day({houses: null}), 'career', 'begin').state).toBe('unknown');
    });
    it('uses the conventional house topics', () => {
        expect(TOPIC_HOUSES.career).toContain(10);
        expect(TOPIC_HOUSES.money).toContain(2);
        expect(TOPIC_HOUSES.relationships).toContain(7);
    });
});
