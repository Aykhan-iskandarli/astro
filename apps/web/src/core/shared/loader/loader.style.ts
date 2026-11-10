import {createUseStyles} from 'react-jss';
import colors from 'assets/styles/abstracts/color';
import {rem} from 'assets/styles/abstracts/functions';
import {reducedMotion} from 'assets/styles/abstracts/mixins';

const styles = {
    '@keyframes astraSpin': {
        to: {transform: 'rotate(360deg)'},
    },
    loader: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: rem(240),
    },
    orbit: {
        width: rem(56),
        height: rem(56),
        borderRadius: '50%',
        border: `1px solid ${colors.border}`,
        position: 'relative',
        animation: '$astraSpin 2.4s linear infinite',
        [reducedMotion]: {animation: 'none'},
    },
    planet: {
        position: 'absolute',
        top: -5,
        left: '50%',
        width: 10,
        height: 10,
        marginLeft: -5,
        borderRadius: '50%',
        background: colors.gold,
        boxShadow: `0 0 12px ${colors.gold}`,
    },
};

// @ts-ignore
export const useLoaderStyles = createUseStyles(styles);
