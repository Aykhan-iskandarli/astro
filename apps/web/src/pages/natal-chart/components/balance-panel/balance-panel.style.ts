import {createUseStyles} from 'react-jss';
import colors from 'assets/styles/abstracts/color';
import sizes from 'assets/styles/abstracts/sizes';
import {rem} from 'assets/styles/abstracts/functions';
import {breakpoint} from 'assets/styles/abstracts/mixins';

const styles = {
    panel: {
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: rem(28),
        [breakpoint(sizes.breakpointLg)]: {gridTemplateColumns: '1fr'},
    },
    group: {
        display: 'flex',
        flexDirection: 'column',
        gap: rem(10),
    },
    groupTitle: {
        fontSize: rem(sizes.small),
        textTransform: 'uppercase',
        letterSpacing: '0.12em',
        color: colors.textSubtle,
        fontWeight: sizes.weight500,
    },
    row: {
        display: 'grid',
        gridTemplateColumns: `${rem(110)} 1fr ${rem(20)} ${rem(110)}`,
        alignItems: 'center',
        gap: rem(10),
        fontSize: rem(sizes.small),
    },
    label: {
        color: colors.text,
        cursor: 'help',
    },
    track: {
        height: 6,
        borderRadius: 3,
        background: colors.surfaceRaised,
        overflow: 'hidden',
        display: 'block',
    },
    bar: {
        display: 'block',
        height: '100%',
        width: '100%',
        borderRadius: 3,
    },
    count: {
        textAlign: 'right',
        color: colors.textMuted,
        fontVariantNumeric: 'tabular-nums',
    },
    members: {
        color: colors.textMuted,
        letterSpacing: '0.1em',
        whiteSpace: 'nowrap',
    },
    dominant: {
        gridColumn: '1 / -1',
        color: colors.textMuted,
        fontSize: rem(sizes.small),
    },
};

// @ts-ignore
export const useBalancePanelStyles = createUseStyles(styles);
