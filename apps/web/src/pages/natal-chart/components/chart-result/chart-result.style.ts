import {createUseStyles} from 'react-jss';
import colors from 'assets/styles/abstracts/color';
import sizes from 'assets/styles/abstracts/sizes';
import {rem} from 'assets/styles/abstracts/functions';
import {breakpoint} from 'assets/styles/abstracts/mixins';

const styles = {
    result: {
        display: 'flex',
        flexDirection: 'column',
        gap: rem(48),
    },
    head: {
        display: 'flex',
        flexDirection: 'column',
        gap: rem(6),
    },
    eyebrow: {
        color: colors.gold,
        fontSize: rem(sizes.small),
        letterSpacing: '0.18em',
        textTransform: 'uppercase',
    },
    meta: {
        color: colors.textMuted,
    },
    actions: {
        display: 'flex',
        gap: rem(10),
        flexWrap: 'wrap',
        marginTop: rem(12),
    },
    notices: {
        display: 'flex',
        flexDirection: 'column',
        gap: rem(10),
        marginTop: rem(-24),
        '&:empty': {display: 'none'},
    },
    panel: {
        outline: 'none',
    },
    tabBody: {
        display: 'flex',
        flexDirection: 'column',
        gap: rem(48),
    },
    stage: {
        scrollMarginTop: rem(88),
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 7fr) minmax(0, 5fr)',
        gap: rem(40),
        alignItems: 'start',
        [breakpoint(sizes.breakpointLg)]: {gridTemplateColumns: '1fr'},
    },
    wheelWrap: {
        padding: rem(8),
    },
    // The interpretation must never change the row height: otherwise hovering a table row below swaps in a
    // longer text, the row grows, the table moves under the cursor and hover flickers between rows.
    // `contain: size` makes the aside contribute no height, so the wheel alone sets the row; the panel sticks
    // inside it and scrolls when its text is longer than the wheel.
    side: {
        alignSelf: 'stretch',
        contain: 'size',
        '& > [aria-live]': {
            position: 'sticky',
            top: rem(96),
            maxHeight: 'min(calc(100vh - 128px), 100%)',
        },
        [breakpoint(sizes.breakpointLg)]: {
            contain: 'none',
            '& > [aria-live]': {position: 'static', maxHeight: 'calc(100vh - 128px)'},
        },
    },
    section: {
        display: 'flex',
        flexDirection: 'column',
        gap: rem(20),
        '& > h2': {fontSize: rem(30)},
    },
};

// @ts-ignore
export const useChartResultStyles = createUseStyles(styles);
