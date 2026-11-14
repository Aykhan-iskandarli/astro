import {createUseStyles} from 'react-jss';
import colors from 'assets/styles/abstracts/color';
import sizes from 'assets/styles/abstracts/sizes';
import fonts from 'assets/styles/abstracts/fonts';
import {rem} from 'assets/styles/abstracts/functions';
import {breakpoint} from 'assets/styles/abstracts/mixins';

const styles = {
    wrap: {
        display: 'flex',
        flexDirection: 'column',
        gap: rem(12),
    },
    title: {fontSize: rem(20)},
    sub: {fontSize: rem(16), marginTop: rem(8), color: colors.textMuted, fontWeight: 600},
    muted: {color: colors.textMuted},
    gold: {color: colors.gold},
    card: {
        display: 'flex',
        flexDirection: 'column',
        gap: rem(8),
        padding: rem(20),
        borderRadius: rem(16),
        border: `1px solid ${colors.borderSoft}`,
        background: 'linear-gradient(170deg, rgba(28,28,56,0.75), rgba(11,11,30,0.55))',
        '& p': {lineHeight: 1.6},
    },
    big: {
        fontFamily: fonts.heading,
        fontSize: rem(22),
    },
    text: {color: colors.textMuted, lineHeight: 1.6},
    list: {
        listStyle: 'none',
        margin: 0,
        padding: 0,
        borderTop: `1px solid ${colors.borderSoft}`,
    },
    item: {
        display: 'grid',
        gridTemplateColumns: `${rem(120)} 1fr`,
        gap: rem(12),
        padding: [rem(12), 0],
        borderBottom: `1px solid ${colors.borderSoft}`,
        [breakpoint(sizes.breakpointSm)]: {gridTemplateColumns: '1fr', gap: rem(2)},
    },
    when: {
        color: colors.gold,
        fontVariantNumeric: 'tabular-nums',
    },
    harmonious: {color: colors.harmonious},
    tense: {color: colors.tense},
    neutral: {color: colors.neutral},
    minor: {color: colors.minor},
};

// @ts-ignore
export const usePersonalMoonDayStyles = createUseStyles(styles);
