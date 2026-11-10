import {createUseStyles} from 'react-jss';
import colors from 'assets/styles/abstracts/color';
import fonts from 'assets/styles/abstracts/fonts';
import sizes from 'assets/styles/abstracts/sizes';
import {rem} from 'assets/styles/abstracts/functions';
import {breakpoint} from 'assets/styles/abstracts/mixins';

const styles = {
    grid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
        gridTemplateRows: 'repeat(4, minmax(150px, auto))',
        gap: rem(4),
        [breakpoint(sizes.breakpoint)]: {
            // Phones: palaces as a list, centre info on top
            display: 'flex',
            flexDirection: 'column',
        },
    },
    palace: {
        display: 'flex',
        flexDirection: 'column',
        gap: rem(4),
        padding: rem(10),
        borderRadius: rem(10),
        border: `1px solid ${colors.borderSoft}`,
        background: colors.surface,
        fontSize: rem(sizes.small),
        minWidth: 0,
        cursor: 'help',
    },
    soul: {borderColor: colors.gold},
    current: {boxShadow: `inset 0 0 0 2px ${colors.violet}`},
    palaceHead: {
        display: 'flex',
        justifyContent: 'space-between',
        gap: rem(6),
        '& strong': {color: colors.gold, fontWeight: sizes.weight600},
    },
    bodyMark: {
        fontSize: rem(11),
        padding: [0, rem(6)],
        borderRadius: 999,
        border: `1px solid ${colors.violet}`,
        color: colors.violet,
    },
    major: {
        display: 'flex',
        flexDirection: 'column',
        gap: rem(2),
        '& li': {display: 'flex', alignItems: 'baseline', gap: rem(4), flexWrap: 'wrap'},
        '& span': {color: colors.text, fontWeight: sizes.weight500},
        '& small': {color: colors.textSubtle, fontSize: rem(10)},
        '& b': {fontSize: rem(10), padding: [0, rem(4)], borderRadius: 4, color: colors.onGold},
    },
    mutA: {background: colors.success},
    mutB: {background: colors.gold},
    mutC: {background: colors.harmonious},
    mutD: {background: colors.tense},
    minor: {color: colors.textSubtle, fontSize: rem(11), lineHeight: 1.4},
    palaceFoot: {
        marginTop: 'auto',
        display: 'flex',
        justifyContent: 'space-between',
        color: colors.textSubtle,
        fontSize: rem(11),
    },
    center: {
        gridRow: '2 / 4',
        gridColumn: '2 / 4',
        padding: rem(20),
        borderRadius: rem(10),
        background: 'linear-gradient(160deg, rgba(91,75,196,0.16), rgba(20,20,43,0.8))',
        border: `1px solid ${colors.borderSoft}`,
        '& h4': {fontFamily: fonts.heading, fontSize: rem(22), fontWeight: 500, color: colors.gold, marginBottom: rem(12)},
        '& dl': {display: 'grid', gridTemplateColumns: 'auto 1fr', gap: [rem(6), rem(12)], margin: 0, fontSize: rem(sizes.small)},
        '& dt': {color: colors.textMuted},
        '& dd': {margin: 0},
        [breakpoint(sizes.breakpoint)]: {order: -1},
    },
};

// @ts-ignore
export const useZiweiChartStyles = createUseStyles(styles);
