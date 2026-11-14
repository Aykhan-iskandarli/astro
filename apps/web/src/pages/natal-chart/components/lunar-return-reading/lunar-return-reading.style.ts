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
    grid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
        gap: rem(12),
        [breakpoint(sizes.breakpoint)]: {gridTemplateColumns: '1fr'},
    },
    card: {
        display: 'flex',
        flexDirection: 'column',
        gap: rem(6),
        padding: rem(18),
        borderRadius: rem(16),
        border: `1px solid ${colors.borderSoft}`,
        background: 'linear-gradient(170deg, rgba(28,28,56,0.75), rgba(11,11,30,0.55))',
        '& p': {lineHeight: 1.6},
        '& .glyph': {color: colors.gold},
    },
    label: {
        color: colors.gold,
        fontSize: rem(sizes.small),
        letterSpacing: '0.12em',
        textTransform: 'uppercase',
    },
    big: {fontFamily: fonts.heading, fontSize: rem(20)},
    text: {color: colors.textMuted},
};

// @ts-ignore
export const useLunarReturnReadingStyles = createUseStyles(styles);
