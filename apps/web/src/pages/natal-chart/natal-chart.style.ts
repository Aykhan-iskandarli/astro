import {createUseStyles} from 'react-jss';
import colors from 'assets/styles/abstracts/color';
import sizes from 'assets/styles/abstracts/sizes';
import {rem} from 'assets/styles/abstracts/functions';
import {breakpoint} from 'assets/styles/abstracts/mixins';

const styles = {
    stage: {
        position: 'relative',
        isolation: 'isolate',
        overflow: 'hidden',
        minHeight: '100svh',
    },
    backdrop: {
        position: 'absolute',
        inset: 0,
        zIndex: -1,
        pointerEvents: 'none',
        // Fade into the page background at the bottom so the footer seam is invisible
        maskImage: 'linear-gradient(to bottom, #000 75%, transparent)',
        WebkitMaskImage: 'linear-gradient(to bottom, #000 75%, transparent)',
    },
    astrolabe: {
        position: 'absolute',
        left: '50%',
        top: rem(120),
        width: 'min(1100px, 150vw)',
        transform: 'translateX(-50%)',
        zIndex: -1,
        [breakpoint(sizes.breakpoint)]: {top: rem(140)},
    },
    page: {
        paddingTop: rem(120),
        paddingBottom: rem(96),
        [breakpoint(sizes.breakpoint)]: {paddingTop: rem(96)},
    },
    formCard: {
        maxWidth: rem(560),
        margin: '0 auto',
        padding: rem(40),
        borderRadius: rem(24),
        border: `1px solid ${colors.borderSoft}`,
        background: 'linear-gradient(170deg, rgba(28,28,56,0.78), rgba(11,11,30,0.72))',
        backdropFilter: 'blur(14px) saturate(130%)',
        WebkitBackdropFilter: 'blur(14px) saturate(130%)',
        boxShadow: '0 30px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(226,194,117,0.06), inset 0 1px 0 rgba(255,255,255,0.06)',
        [breakpoint(sizes.breakpointSm)]: {padding: rem(24)},
    },
    formHead: {
        marginBottom: rem(28),
        '& h1': {fontSize: rem(40), marginBottom: rem(8)},
        '& p': {color: colors.textMuted},
    },
    resultWrap: {},
};

// @ts-ignore
export const useNatalChartStyles = createUseStyles(styles);
