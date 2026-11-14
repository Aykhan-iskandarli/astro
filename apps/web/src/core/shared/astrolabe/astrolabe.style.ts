import {createUseStyles} from 'react-jss';
import colors from 'assets/styles/abstracts/color';
import {reducedMotion} from 'assets/styles/abstracts/mixins';

const spin = (seconds: number, reverse = false) => ({
    animation: `$spin ${seconds}s linear infinite${reverse ? ' reverse' : ''}`,
    [reducedMotion]: {animation: 'none'},
});

const styles = {
    '@keyframes spin': {
        from: {transform: 'rotate(0deg)'},
        to: {transform: 'rotate(360deg)'},
    },
    root: {
        position: 'relative',
        pointerEvents: 'none',
    },
    layer: {
        position: 'absolute',
        inset: 0,
        willChange: 'transform',
    },
    spinSlow: spin(420),
    spinReverse: spin(260, true),
    spinFast: spin(140),
    svg: {
        display: 'block',
        width: '100%',
        height: 'auto',
        overflow: 'visible',
    },
    ring: {fill: 'none', stroke: colors.gold, strokeOpacity: 0.35, strokeWidth: 1.2},
    ringSoft: {fill: 'none', stroke: colors.violet, strokeOpacity: 0.35, strokeWidth: 1},
    ringDashed: {fill: 'none', stroke: colors.gold, strokeOpacity: 0.25, strokeWidth: 1, strokeDasharray: '2 10'},
    tick: {stroke: colors.gold, strokeOpacity: 0.3, strokeWidth: 1},
    glyph: {fill: colors.gold, fillOpacity: 0.55, fontSize: 26},
    star: {fill: 'none', stroke: colors.violet, strokeOpacity: 0.3, strokeWidth: 1},
    dotGold: {fill: colors.gold, filter: `drop-shadow(0 0 8px ${colors.gold})`},
    dotViolet: {fill: colors.violet, filter: `drop-shadow(0 0 6px ${colors.violet})`},
};

// @ts-ignore
export const useAstrolabeStyles = createUseStyles(styles);
