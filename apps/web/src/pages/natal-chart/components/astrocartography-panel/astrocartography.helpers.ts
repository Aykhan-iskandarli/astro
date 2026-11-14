// Line colours per planet (distinct on the dark map) and dash patterns per angle.
export const ACG_COLORS: Record<string, string> = {
    sun: '#E2C275',
    moon: '#D8DCEB',
    mercury: '#9CC9FF',
    venus: '#F7A8C9',
    mars: '#F28B8B',
    jupiter: '#F4A06B',
    saturn: '#B8A47A',
    uranus: '#7FD1E8',
    neptune: '#8FA6FF',
    pluto: '#C77DFF',
};

export const ANGLE_DASH: Record<string, string | undefined> = {
    mc: undefined,
    ic: '8 5',
    asc: '2 4',
    dsc: '10 4 2 4',
};
