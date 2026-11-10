import {createUseStyles} from 'react-jss';
import colors from 'assets/styles/abstracts/color';
import {rem} from 'assets/styles/abstracts/functions';

const CELL = 40;

const styles = {
    scroller: {
        overflowX: 'auto',
        paddingBottom: rem(4),
    },
    grid: {
        borderCollapse: 'collapse',
        margin: '0 auto',
    },
    cell: {
        width: rem(CELL),
        height: rem(CELL),
        minWidth: rem(CELL),
        border: `1px solid ${colors.borderSoft}`,
        textAlign: 'center',
        verticalAlign: 'middle',
        padding: 0,
    },
    cellActive: {
        background: 'rgba(226,194,117,0.08)',
    },
    head: {
        width: rem(CELL),
        height: rem(CELL),
        minWidth: rem(CELL),
        border: `1px solid ${colors.border}`,
        background: colors.surfaceRaised,
        color: colors.gold,
        fontSize: rem(17),
        fontWeight: 400,
        cursor: 'default',
    },
    headActive: {
        background: colors.violetDeep,
        color: colors.white,
    },
    abbr: {
        fontSize: rem(11),
        fontWeight: 600,
        letterSpacing: '0.04em',
    },
    aspect: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        lineHeight: 1.05,
        '& .glyph': {fontSize: rem(16)},
    },
    orb: {
        fontSize: rem(9),
        color: colors.textSubtle,
    },
    harmonious: {color: colors.harmonious},
    tense: {color: colors.tense},
    neutral: {color: colors.neutral},
    minor: {color: colors.minor},
};

// @ts-ignore
export const useAspectGridStyles = createUseStyles(styles);
