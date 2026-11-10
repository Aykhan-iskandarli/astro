import {createUseStyles} from 'react-jss';
import colors from 'assets/styles/abstracts/color';
import sizes from 'assets/styles/abstracts/sizes';
import {rem} from 'assets/styles/abstracts/functions';
import {breakpoint, transition} from 'assets/styles/abstracts/mixins';

const styles = {
    section: {
        position: 'relative',
    },
    sticky: {
        position: 'sticky',
        top: 0,
        height: '100svh',
        overflow: 'hidden',
    },
    scene: {
        position: 'absolute',
        inset: 0,
    },
    sceneFallback: {
        position: 'absolute',
        inset: 0,
        background: `radial-gradient(circle at 70% 50%, rgba(226,194,117,0.12), transparent 40%), ${colors.space}`,
    },
    vignette: {
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        background: `linear-gradient(90deg, ${colors.space} 0%, rgba(11,11,30,0.75) 30%, rgba(11,11,30,0) 60%),
            linear-gradient(to bottom, ${colors.space} 0%, transparent 18%, transparent 82%, ${colors.space} 100%)`,
        [breakpoint(sizes.breakpoint)]: {
            background: `linear-gradient(to top, ${colors.space} 0%, rgba(11,11,30,0.85) 35%, transparent 65%),
                linear-gradient(to bottom, ${colors.space} 0%, transparent 15%)`,
        },
    },
    overlay: {
        position: 'relative',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        pointerEvents: 'none',
        '& button, & a': {pointerEvents: 'auto'},
        [breakpoint(sizes.breakpoint)]: {justifyContent: 'flex-end', paddingBottom: rem(72)},
    },
    intro: {
        position: 'absolute',
        top: rem(96),
        left: rem(24),
        right: rem(24),
        [breakpoint(sizes.breakpoint)]: {top: rem(80), left: rem(16), right: rem(16)},
    },
    heading: {
        fontSize: 'clamp(1.6rem, 3.2vw, 2.4rem)',
        marginBottom: rem(6),
    },
    subheading: {
        color: colors.textMuted,
    },
    cards: {
        position: 'relative',
        maxWidth: rem(440),
        minHeight: rem(280),
        [breakpoint(sizes.breakpoint)]: {minHeight: rem(240)},
    },
    dots: {
        position: 'absolute',
        right: rem(16),
        top: '50%',
        transform: 'translateY(-50%)',
        display: 'flex',
        flexDirection: 'column',
        gap: rem(2),
        [breakpoint(sizes.breakpoint)]: {
            flexDirection: 'row',
            top: 'auto',
            bottom: rem(16),
            right: '50%',
            transform: 'translateX(50%)',
        },
    },
    dot: {
        width: rem(sizes.touch),
        height: rem(28),
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: 'none',
        background: 'transparent',
        cursor: 'pointer',
        [breakpoint(sizes.breakpoint)]: {width: rem(28), height: rem(sizes.touch)},
        '& span': {
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: colors.border,
            transition: transition('background, transform', 0.3),
        },
        '&:hover span': {background: colors.textMuted},
    },
    dotActive: {
        '& span': {
            background: colors.gold,
            transform: 'scale(1.5)',
            boxShadow: `0 0 10px ${colors.gold}`,
        },
    },
    staticSection: {
        padding: [rem(96), 0],
    },
    staticList: {
        marginTop: rem(40),
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: rem(20),
    },
};

// @ts-ignore
export const useSolarJourneyStyles = createUseStyles(styles);
