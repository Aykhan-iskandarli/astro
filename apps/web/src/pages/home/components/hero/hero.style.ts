import {createUseStyles} from 'react-jss';
import colors from 'assets/styles/abstracts/color';
import sizes from 'assets/styles/abstracts/sizes';
import {rem} from 'assets/styles/abstracts/functions';
import {breakpoint, reducedMotion} from 'assets/styles/abstracts/mixins';

const styles = {
    '@keyframes heroBreath': {
        '0%, 100%': {transform: 'translateY(0)', opacity: 0.5},
        '50%': {transform: 'translateY(8px)', opacity: 1},
    },
    hero: {
        position: 'relative',
        minHeight: '100svh',
        display: 'flex',
        alignItems: 'center',
        overflow: 'hidden',
        isolation: 'isolate',
    },
    nebulaA: {
        position: 'absolute',
        width: '70vmax',
        height: '70vmax',
        left: '-20vmax',
        top: '-25vmax',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(91,75,196,0.35), rgba(91,75,196,0) 65%)',
        filter: 'blur(20px)',
        zIndex: -1,
    },
    nebulaB: {
        position: 'absolute',
        width: '60vmax',
        height: '60vmax',
        right: '-25vmax',
        bottom: '-30vmax',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(226,194,117,0.16), rgba(199,125,255,0.08) 40%, transparent 70%)',
        filter: 'blur(30px)',
        zIndex: -1,
    },
    orbits: {
        position: 'absolute',
        width: 'min(110vmin, 1100px)',
        right: '-18vmin',
        top: '50%',
        marginTop: 'calc(min(110vmin, 1100px) / -2)',
        zIndex: -1,
        opacity: 0.85,
        [breakpoint(sizes.breakpoint)]: {right: '-45vmin', opacity: 0.35},
    },
    content: {
        position: 'relative',
        paddingTop: rem(80),
    },
    eyebrow: {
        color: colors.gold,
        letterSpacing: '0.2em',
        textTransform: 'uppercase',
        fontSize: rem(sizes.small),
        marginBottom: rem(20),
    },
    title: {
        maxWidth: rem(760),
        fontSize: 'clamp(2.4rem, 6vw, 4.6rem)',
        lineHeight: 1.05,
        marginBottom: rem(24),
    },
    subtitle: {
        maxWidth: rem(520),
        fontSize: rem(sizes.large),
        color: colors.textMuted,
        marginBottom: rem(40),
    },
    actions: {
        display: 'flex',
        gap: rem(12),
        flexWrap: 'wrap',
        alignItems: 'center',
    },
    cta: {
        height: rem(56),
        padding: [0, rem(32)],
        fontSize: rem(17),
        boxShadow: '0 10px 40px rgba(226,194,117,0.25)',
    },
    secondary: {
        height: rem(56),
        color: `${colors.text} !important`,
    },
    scrollHint: {
        position: 'absolute',
        left: '50%',
        bottom: rem(28),
        width: rem(sizes.touch),
        height: rem(sizes.touch),
        marginLeft: rem(-22),
        border: 'none',
        background: 'transparent',
        cursor: 'pointer',
        '& span': {
            display: 'block',
            width: 1,
            height: rem(36),
            margin: '0 auto',
            background: `linear-gradient(to bottom, transparent, ${colors.gold})`,
            animation: '$heroBreath 2.8s ease-in-out infinite',
            [reducedMotion]: {animation: 'none'},
        },
    },
};

// @ts-ignore
export const useHeroStyles = createUseStyles(styles);
