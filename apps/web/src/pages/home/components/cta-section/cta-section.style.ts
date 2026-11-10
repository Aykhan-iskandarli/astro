import {createUseStyles} from 'react-jss';
import colors from 'assets/styles/abstracts/color';
import sizes from 'assets/styles/abstracts/sizes';
import {rem} from 'assets/styles/abstracts/functions';

const styles = {
    cta: {
        position: 'relative',
        minHeight: rem(560),
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        padding: [rem(80), rem(16)],
    },
    orbits: {
        position: 'absolute',
        width: 'min(640px, 120vw)',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
    },
    orbit: {
        fill: 'none',
        stroke: colors.border,
        strokeWidth: 1,
    },
    inner: {
        position: 'relative',
        textAlign: 'center',
        maxWidth: rem(520),
        '& h2': {marginBottom: rem(16)},
        '& p': {color: colors.textMuted, fontSize: rem(sizes.large), marginBottom: rem(32)},
    },
    button: {
        height: rem(56),
        padding: [0, rem(40)],
        fontSize: rem(17),
        boxShadow: '0 10px 40px rgba(226,194,117,0.25)',
    },
};

// @ts-ignore
export const useCtaSectionStyles = createUseStyles(styles);
