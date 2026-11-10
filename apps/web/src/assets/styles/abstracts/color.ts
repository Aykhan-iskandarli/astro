// Deep-space palette. Text/background pairs checked for WCAG AA (4.5:1) — see docs/architecture.md.
const colors = {
    space: '#0B0B1E',          // page background
    spaceDeep: '#06061A',
    surface: '#14142B',        // cards
    surfaceRaised: '#1C1C38',
    border: '#2E2B5F',
    borderSoft: 'rgba(157, 140, 255, 0.18)',
    text: '#F1F0FA',           // 17.2:1 on space
    textMuted: '#A7A6C2',      // 8.2:1 on space
    textSubtle: '#8A89A8',     // 5.8:1 on space, 4.9:1 on surfaceRaised
    gold: '#E2C275',           // 11.3:1 on space
    goldDeep: '#B8923A',
    violet: '#9D8CFF',         // 7.1:1 on space
    violetDeep: '#5B4BC4',
    nebulaPink: '#C77DFF',
    onGold: '#0B0B1E',
    error: '#FF8A8A',
    success: '#8FD9A8',
    // Elements
    fire: '#F4A06B',
    earth: '#A8CC8C',
    air: '#9CC9FF',
    water: '#8FA6FF',
    // Aspects
    harmonious: '#7FD1E8',
    tense: '#F28B8B',
    neutral: '#E2C275',
    minor: '#8A89A8',
    white: '#FFFFFF',
    black: '#000000',
};

export default colors;
