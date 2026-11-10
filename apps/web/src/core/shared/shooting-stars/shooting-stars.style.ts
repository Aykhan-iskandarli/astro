import {createUseStyles} from 'react-jss';
import {reducedMotion} from 'assets/styles/abstracts/mixins';

const styles = {
    '@keyframes meteor': {
        '0%': {transform: 'rotate(215deg) translateX(0)', opacity: 0},
        '3%': {opacity: 1},
        '10%': {transform: 'rotate(215deg) translateX(-520px)', opacity: 0},
        '100%': {transform: 'rotate(215deg) translateX(-520px)', opacity: 0},
    },
    wrap: {
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        pointerEvents: 'none',
        zIndex: -1,
        [reducedMotion]: {display: 'none'},
    },
    star: {
        position: 'absolute',
        width: 140,
        height: 1.5,
        borderRadius: 2,
        background: 'linear-gradient(90deg, rgba(255,246,221,0.95), rgba(226,194,117,0.4) 30%, transparent)',
        transformOrigin: '0 50%',
        opacity: 0,
        animationName: '$meteor',
        animationTimingFunction: 'ease-out',
        animationIterationCount: 'infinite',
        '&::before': {
            content: '""',
            position: 'absolute',
            left: -2,
            top: -2,
            width: 5,
            height: 5,
            borderRadius: '50%',
            background: '#FFF6DD',
            boxShadow: '0 0 10px 2px rgba(255,246,221,0.8)',
        },
    },
};

// @ts-ignore
export const useShootingStarsStyles = createUseStyles(styles);
