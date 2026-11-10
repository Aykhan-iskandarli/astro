import {createUseStyles} from 'react-jss';

const styles = {
    canvas: {
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        display: 'block',
        pointerEvents: 'none',
        zIndex: -2,
    },
};

// @ts-ignore
export const useCosmicBackgroundStyles = createUseStyles(styles);
