import {createUseStyles} from 'react-jss';

const styles = {
    svg: {
        display: 'block',
        overflow: 'visible',
        filter: 'drop-shadow(0 0 24px rgba(226,194,117,0.25))',
    },
    halo: {
        fill: 'none',
        stroke: 'rgba(226,194,117,0.18)',
        strokeWidth: 1,
    },
    dark: {
        fill: '#1C1C38',
        stroke: 'rgba(157,140,255,0.25)',
        strokeWidth: 1,
    },
};

// @ts-ignore
export const useMoonPhaseStyles = createUseStyles(styles);
