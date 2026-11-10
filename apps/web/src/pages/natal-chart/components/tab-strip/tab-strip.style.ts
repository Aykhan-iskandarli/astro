import {createUseStyles} from 'react-jss';
import colors from 'assets/styles/abstracts/color';
import sizes from 'assets/styles/abstracts/sizes';
import {rem} from 'assets/styles/abstracts/functions';
import {breakpoint, transition} from 'assets/styles/abstracts/mixins';

const styles = {
    strip: {
        display: 'flex',
        gap: rem(28),
        overflowX: 'auto',
        overscrollBehaviorX: 'contain',
        scrollbarWidth: 'none',
        borderBottom: `1px solid ${colors.borderSoft}`,
        marginBottom: rem(32),
        '&::-webkit-scrollbar': {display: 'none'},
        [breakpoint(sizes.breakpoint)]: {gap: rem(18)},
    },
    tab: {
        position: 'relative',
        flex: '0 0 auto',
        minHeight: rem(sizes.touch + 4),
        padding: [0, rem(2)],
        border: 'none',
        background: 'transparent',
        color: colors.textMuted,
        fontSize: rem(17),
        whiteSpace: 'nowrap',
        cursor: 'pointer',
        transition: transition('color', 0.2),
        '&:hover': {color: colors.text},
        [breakpoint(sizes.breakpoint)]: {fontSize: rem(15)},
    },
    active: {color: colors.gold},
    underline: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: -1,
        height: 2,
        borderRadius: 1,
        background: colors.gold,
    },
};

// @ts-ignore
export const useTabStripStyles = createUseStyles(styles);
