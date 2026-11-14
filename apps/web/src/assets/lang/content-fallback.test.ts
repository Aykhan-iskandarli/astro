import {describe, expect, it} from 'vitest';
import {getContent, loadContent} from '@astra/content';

// Russian is translated in stages: whatever it lacks must show in English, never in Azerbaijani.
describe('content language fallback', () => {
    it('serves Azerbaijani without loading anything', () => {
        expect(getContent('az').points.sun.name).toBe('Günəş');
    });
    it('shows translated Russian text where it exists and English where it does not', async () => {
        const ru = await loadContent('ru');
        const en = await loadContent('en');
        expect(ru.points.sun.name).toBe('Солнце');
        expect(ru.karmic.nodeAxis.aries).toBe(en.karmic.nodeAxis.aries); // not translated yet -> English
        expect(ru.karmic.nodeAxis.aries).not.toBe(getContent('az').karmic.nodeAxis.aries);
    });
    it('does not let a partial language leak into the others', async () => {
        await loadContent('ru');
        expect(getContent('en').points.sun.name).toBe('Sun');
    });
});
