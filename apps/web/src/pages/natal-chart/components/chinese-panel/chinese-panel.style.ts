import {createUseStyles} from 'react-jss';
import colors from 'assets/styles/abstracts/color';
import fonts from 'assets/styles/abstracts/fonts';
import sizes from 'assets/styles/abstracts/sizes';
import {rem} from 'assets/styles/abstracts/functions';
import {breakpoint, transition} from 'assets/styles/abstracts/mixins';

const styles = {
    wrapper: {display: 'flex', flexDirection: 'column', gap: rem(48)},
    head: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        gap: rem(24),
        flexWrap: 'wrap',
        '& h2': {fontSize: rem(36), marginBottom: rem(8)},
        '& p': {color: colors.textMuted, maxWidth: rem(560)},
    },
    gender: {
        display: 'flex',
        flexDirection: 'column',
        gap: rem(6),
        maxWidth: rem(320),
        '& > span': {color: colors.textMuted, fontSize: rem(sizes.small)},
        '& small': {color: colors.textSubtle},
    },
    section: {
        display: 'flex',
        flexDirection: 'column',
        gap: rem(16),
        '& > h3': {fontSize: rem(28)},
    },
    bazi: {
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 3fr) minmax(0, 2fr)',
        gap: rem(32),
        transition: transition('opacity', 0.3),
        [breakpoint(sizes.breakpointLg)]: {gridTemplateColumns: '1fr'},
    },
    busy: {opacity: 0.6},
    pillars: {
        display: 'grid',
        gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
        gap: rem(8),
    },
    pillar: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: rem(4),
        padding: [rem(14), rem(6)],
        borderRadius: rem(14),
        border: `1px solid ${colors.borderSoft}`,
        background: colors.surface,
        textAlign: 'center',
        minWidth: 0,
    },
    dayPillar: {borderColor: colors.goldDeep, background: 'linear-gradient(180deg, rgba(226,194,117,0.10), rgba(20,20,43,0.9))'},
    pillarLabel: {fontSize: rem(12), letterSpacing: '0.1em', textTransform: 'uppercase', color: colors.textSubtle},
    tenGod: {fontSize: rem(12), color: colors.violet, minHeight: rem(32)},
    char: {fontSize: rem(44), lineHeight: 1.1, fontFamily: '"Noto Serif SC", "Songti SC", "SimSun", serif', cursor: 'help'},
    sub: {fontSize: rem(12), color: colors.textMuted},
    hidden: {display: 'flex', gap: rem(6), fontSize: rem(16), marginTop: rem(6), cursor: 'help'},
    side: {
        display: 'flex',
        flexDirection: 'column',
        gap: rem(10),
        '& h4': {fontFamily: fonts.heading, fontSize: rem(20), fontWeight: 500, marginTop: rem(8)},
    },
    dayMaster: {
        display: 'flex',
        gap: rem(16),
        alignItems: 'center',
        padding: rem(16),
        borderRadius: rem(14),
        border: `1px solid ${colors.goldDeep}`,
        '& p': {fontSize: rem(sizes.small), color: colors.textMuted},
    },
    dmChar: {fontSize: rem(56), lineHeight: 1, fontFamily: '"Noto Serif SC", "Songti SC", "SimSun", serif'},
    elRow: {
        display: 'grid',
        gridTemplateColumns: `${rem(70)} 1fr ${rem(20)}`,
        gap: rem(10),
        alignItems: 'center',
        fontSize: rem(sizes.small),
    },
    track: {
        height: 6,
        borderRadius: 3,
        background: colors.surfaceRaised,
        overflow: 'hidden',
        '& span': {display: 'block', height: '100%', borderRadius: 3},
    },
    luckTitle: {fontFamily: fonts.heading, fontSize: rem(22), fontWeight: 500, marginTop: rem(12)},
    luck: {
        display: 'flex',
        gap: rem(8),
        overflowX: 'auto',
        paddingBottom: rem(6),
        '& li': {
            flex: '0 0 auto',
            width: rem(86),
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: rem(2),
            padding: [rem(10), rem(4)],
            borderRadius: rem(12),
            border: `1px solid ${colors.borderSoft}`,
            background: colors.surface,
            cursor: 'help',
            '& b': {fontSize: rem(26), lineHeight: 1.1, fontFamily: '"Noto Serif SC", "Songti SC", "SimSun", serif'},
            '& small': {color: colors.textSubtle, fontSize: rem(11)},
        },
    },
    luckNow: {borderColor: `${colors.gold} !important`, boxShadow: `0 0 0 1px ${colors.gold}`},
    muted: {color: colors.textMuted, fontSize: rem(sizes.small)},
    note: {color: colors.textSubtle, fontSize: rem(sizes.small)},
};

// @ts-ignore
export const useChinesePanelStyles = createUseStyles(styles);
