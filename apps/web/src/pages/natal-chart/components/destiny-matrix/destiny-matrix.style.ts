import {createUseStyles} from 'react-jss';
import colors from 'assets/styles/abstracts/color';
import fonts from 'assets/styles/abstracts/fonts';
import sizes from 'assets/styles/abstracts/sizes';
import {rem} from 'assets/styles/abstracts/functions';
import {breakpoint} from 'assets/styles/abstracts/mixins';

const styles = {
    wrapper: {
        display: 'flex',
        flexDirection: 'column',
        gap: rem(48),
    },
    head: {
        '& h2': {fontSize: rem(36), marginBottom: rem(8)},
        '& p': {color: colors.textMuted},
    },
    note: {
        fontSize: rem(sizes.small),
        color: `${colors.textSubtle} !important`,
        marginTop: rem(4),
    },
    stage: {
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 7fr) minmax(0, 5fr)',
        gap: rem(40),
        alignItems: 'start',
        [breakpoint(sizes.breakpointLg)]: {gridTemplateColumns: '1fr'},
    },
    panel: {
        position: 'sticky',
        top: rem(96),
        minHeight: rem(300),
        padding: rem(24),
        borderRadius: rem(sizes.radius),
        border: `1px solid ${colors.borderSoft}`,
        background: 'linear-gradient(170deg, rgba(28,28,56,0.9), rgba(11,11,30,0.6))',
        [breakpoint(sizes.breakpointLg)]: {position: 'static'},
    },
    eyebrow: {
        color: colors.gold,
        fontSize: rem(sizes.small),
        letterSpacing: '0.14em',
        textTransform: 'uppercase',
        marginBottom: rem(12),
    },
    cardHead: {
        display: 'flex',
        gap: rem(16),
        alignItems: 'center',
        marginBottom: rem(16),
        '& h3': {fontSize: rem(26)},
    },
    number: {
        width: rem(60),
        height: rem(60),
        flexShrink: 0,
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: fonts.heading,
        fontSize: rem(28),
        color: colors.onGold,
        background: `radial-gradient(circle at 35% 35%, #FFF6DD, ${colors.gold} 55%, ${colors.goldDeep})`,
    },
    keywords: {
        color: colors.textMuted,
        fontSize: rem(sizes.small),
    },
    meaning: {
        color: colors.text,
        lineHeight: 1.7,
        marginBottom: rem(16),
    },
    sides: {
        margin: 0,
        display: 'grid',
        gap: rem(6),
        '& dt': {color: colors.violet, fontWeight: sizes.weight600, fontSize: rem(sizes.small)},
        '& dd': {margin: [0, 0, rem(8)], color: colors.textMuted},
    },
    section: {
        display: 'flex',
        flexDirection: 'column',
        gap: rem(16),
        '& > h3': {fontSize: rem(26)},
        '& .ant-table': {background: 'transparent'},
    },
    purposes: {
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: rem(16),
        [breakpoint(sizes.breakpointLg)]: {gridTemplateColumns: '1fr'},
    },
    purposeGroup: {
        display: 'flex',
        flexDirection: 'column',
        gap: rem(10),
    },
    purpose: {
        display: 'flex',
        gap: rem(14),
        alignItems: 'flex-start',
        padding: rem(14),
        borderRadius: rem(12),
        border: `1px solid ${colors.borderSoft}`,
        background: colors.surface,
        '& div': {display: 'flex', flexDirection: 'column', gap: rem(2)},
        '& strong': {fontWeight: sizes.weight600},
        '& span': {color: colors.gold, fontSize: rem(sizes.small)},
        '& small': {color: colors.textMuted, fontSize: rem(sizes.small)},
    },
    purposeMain: {
        borderColor: colors.goldDeep,
        background: 'linear-gradient(160deg, rgba(226,194,117,0.12), rgba(20,20,43,0.8))',
    },
    purposeNumber: {
        minWidth: rem(40),
        height: rem(40),
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: sizes.weight600,
        color: `${colors.text} !important`,
        fontSize: `${rem(17)} !important`,
        border: `1px solid ${colors.violet}`,
    },
    totalRow: {
        '& td': {fontWeight: sizes.weight600, color: colors.gold},
    },
    lines: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
        gap: rem(12),
        '& li': {
            display: 'flex',
            flexDirection: 'column',
            gap: rem(6),
            padding: rem(14),
            borderRadius: rem(12),
            border: `1px solid ${colors.borderSoft}`,
            background: colors.surface,
        },
        '& strong': {fontWeight: sizes.weight500, color: colors.textMuted, fontSize: rem(sizes.small)},
    },
    sequence: {
        display: 'inline-block',
        marginRight: rem(16),
        fontSize: rem(20),
        fontVariantNumeric: 'tabular-nums',
        cursor: 'help',
    },
    ages: {
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: rem(10),
        [breakpoint(sizes.breakpoint)]: {gridTemplateColumns: '1fr'},
    },
    sector: {
        display: 'grid',
        gridTemplateColumns: 'repeat(8, 1fr)',
        gap: rem(4),
    },
    step: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: [rem(6), 0],
        borderRadius: rem(8),
        background: colors.surface,
        cursor: 'help',
        '& span': {fontSize: rem(11), color: colors.textSubtle},
        '& b': {fontSize: rem(16), fontWeight: sizes.weight600},
    },
    stepCorner: {
        background: colors.surfaceRaised,
        '& b': {color: colors.violet},
    },
    stepNow: {
        outline: `2px solid ${colors.gold}`,
        '& b': {color: colors.gold},
    },
};

// @ts-ignore
export const useDestinyMatrixStyles = createUseStyles(styles);
