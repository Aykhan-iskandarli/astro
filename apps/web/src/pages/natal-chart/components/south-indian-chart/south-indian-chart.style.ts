import {createUseStyles} from 'react-jss';
import colors from 'assets/styles/abstracts/color';
import fonts from 'assets/styles/abstracts/fonts';
import sizes from 'assets/styles/abstracts/sizes';
import {rem} from 'assets/styles/abstracts/functions';
import {transition} from 'assets/styles/abstracts/mixins';

const styles = {
    chart: {
        margin: 0,
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gridTemplateRows: 'repeat(4, 1fr)',
        aspectRatio: '1 / 1',
        width: '100%',
        maxWidth: rem(460),
        border: `1px solid ${colors.border}`,
        borderRadius: rem(12),
        overflow: 'hidden',
        background: colors.surface,
    },
    cell: {
        position: 'relative',
        border: `1px solid ${colors.borderSoft}`,
        padding: rem(6),
        display: 'flex',
        flexDirection: 'column',
        minWidth: 0,
    },
    lagna: {
        background: 'linear-gradient(135deg, rgba(226,194,117,0.16), transparent 60%)',
    },
    lagnaMark: {
        position: 'absolute',
        top: rem(4),
        right: rem(6),
        fontSize: rem(11),
        fontWeight: sizes.weight600,
        color: colors.gold,
        cursor: 'help',
    },
    signName: {
        fontSize: rem(11),
        color: colors.textSubtle,
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        paddingRight: rem(18),
    },
    grahas: {
        display: 'flex',
        flexWrap: 'wrap',
        alignContent: 'center',
        justifyContent: 'center',
        gap: rem(2),
        flex: 1,
    },
    graha: {
        minWidth: rem(28),
        minHeight: rem(28),
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: 'none',
        borderRadius: rem(8),
        background: 'transparent',
        color: colors.text,
        cursor: 'pointer',
        fontSize: rem(18),
        transition: transition('background, color', 0.2),
        '& sup': {fontSize: rem(9), color: colors.tense, fontFamily: fonts.font},
        '&:hover, &:focus-visible': {background: colors.surfaceRaised, color: colors.gold},
    },
    active: {
        background: colors.violetDeep,
        color: colors.white,
    },
    center: {
        gridRow: '2 / 4',
        gridColumn: '2 / 4',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        fontFamily: fonts.heading,
        fontSize: rem(20),
        color: colors.gold,
        padding: rem(8),
    },
};

// @ts-ignore
export const useSouthIndianChartStyles = createUseStyles(styles);
