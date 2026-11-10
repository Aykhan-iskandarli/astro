// Visual configuration of the solar-system journey (look only — no astronomical values).
export interface IJourneyPlanet {
    id: 'sun' | 'moon' | 'mercury' | 'venus' | 'mars' | 'jupiter' | 'saturn' | 'uranus' | 'neptune' | 'pluto';
    radius: number;
    colorA: string;     // base
    colorB: string;     // bands / detail
    glow: string;       // atmosphere rim
    bands: number;      // 0 = rocky noise, >0 = gas-giant bands
    ring?: {inner: number; outer: number; color: string; tilt: number};
    tilt: number;
}

export const JOURNEY: IJourneyPlanet[] = [
    {id: 'sun', radius: 2.2, colorA: '#FFB347', colorB: '#FFF1B8', glow: '#FFC861', bands: 0, tilt: 0},
    {id: 'moon', radius: 0.8, colorA: '#9C9AA6', colorB: '#D9D7E0', glow: '#C9C7E8', bands: 0, tilt: 0.1},
    {id: 'mercury', radius: 0.75, colorA: '#7D736B', colorB: '#B9AEA2', glow: '#C2B7A8', bands: 0, tilt: 0.05},
    {id: 'venus', radius: 1.05, colorA: '#D9A86C', colorB: '#F5DEB3', glow: '#FFD9A0', bands: 3, tilt: 0.2},
    {id: 'mars', radius: 0.9, colorA: '#A8462E', colorB: '#E07A52', glow: '#FF9C7A', bands: 0, tilt: 0.4},
    {id: 'jupiter', radius: 1.9, colorA: '#B98A5E', colorB: '#EED9BC', glow: '#F2C998', bands: 9, tilt: 0.05},
    {id: 'saturn', radius: 1.6, colorA: '#C9A86A', colorB: '#F1E2BC', glow: '#F5DFA8', bands: 6, tilt: 0.45,
        ring: {inner: 2.1, outer: 3.4, color: '#E4D2A6', tilt: 0.45}},
    {id: 'uranus', radius: 1.3, colorA: '#6FB7C4', colorB: '#B8E6EC', glow: '#9EF0FF', bands: 2, tilt: 1.7,
        ring: {inner: 1.7, outer: 2.0, color: '#9EC9D1', tilt: 1.7}},
    {id: 'neptune', radius: 1.25, colorA: '#2F4FB3', colorB: '#6E8BEA', glow: '#7C9CFF', bands: 3, tilt: 0.5},
    {id: 'pluto', radius: 0.6, colorA: '#8E7A6B', colorB: '#D8C3AE', glow: '#C9B6FF', bands: 0, tilt: 0.3},
];

export const PLANET_SPACING = 11;
