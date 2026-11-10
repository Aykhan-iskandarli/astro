import {createUseStyles} from 'react-jss';
import colors from 'assets/styles/abstracts/color';

const styles = {
    svg: {
        display: 'block',
        width: '100%',
        height: 'auto',
        overflow: 'visible',
        pointerEvents: 'none',
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
