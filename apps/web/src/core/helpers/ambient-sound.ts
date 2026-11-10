/**
 * Ambient drone synthesised with the Web Audio API: no audio file, no licensing, ~0 bytes.
 * Two detuned low sines + a fifth, through a slow-breathing low-pass filter. Off by default.
 */
let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let nodes: AudioScheduledSourceNode[] = [];

export const startAmbient = () => {
    if (ctx) return;
    const AC = window.AudioContext ?? (window as unknown as {webkitAudioContext: typeof AudioContext}).webkitAudioContext;
    if (!AC) return;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = 0;
    master.gain.linearRampToValueAtTime(0.06, ctx.currentTime + 3);

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 600;
    filter.Q.value = 0.7;
    filter.connect(master);
    master.connect(ctx.destination);

    [[110, -4], [110, 4], [164.81, 0], [55, 0]].forEach(([freq, detune]) => {
        const osc = ctx!.createOscillator();
        osc.type = 'sine';
        osc.frequency.value = freq;
        osc.detune.value = detune;
        osc.connect(filter);
        osc.start();
        nodes.push(osc);
    });

    // Slow "breathing" of the filter
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    lfo.frequency.value = 0.05;
    lfoGain.gain.value = 250;
    lfo.connect(lfoGain).connect(filter.frequency);
    lfo.start();
    nodes.push(lfo);
};

export const stopAmbient = () => {
    if (!ctx || !master) return;
    const c = ctx;
    master.gain.cancelScheduledValues(c.currentTime);
    master.gain.setValueAtTime(master.gain.value, c.currentTime);
    master.gain.linearRampToValueAtTime(0, c.currentTime + 1.2);
    const toStop = nodes;
    setTimeout(() => {
        toStop.forEach((n) => n.stop());
        c.close();
    }, 1300);
    ctx = null;
    master = null;
    nodes = [];
};
