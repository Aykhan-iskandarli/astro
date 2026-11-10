import {createUseStyles} from 'react-jss';

const styles = {
    canvas: {
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
    },
};

// @ts-ignore
export const useStarfieldStyles = createUseStyles(styles);
