import {createUseStyles} from 'react-jss';
import colors from 'assets/styles/abstracts/color';
import fonts from 'assets/styles/abstracts/fonts';
import sizes from 'assets/styles/abstracts/sizes';
import {rem} from 'assets/styles/abstracts/functions';
import {breakpoint} from 'assets/styles/abstracts/mixins';

const styles = {
    footer: {
        position: 'relative',
        zIndex: 2,
        borderTop: `1px solid ${colors.borderSoft}`,
        background: colors.spaceDeep,
        padding: [rem(48), 0, rem(40)],
        color: colors.textMuted,
        fontSize: rem(sizes.small),
    },
    inner: {
        display: 'grid',
        gridTemplateColumns: '1fr auto',
        gap: rem(24),
        [breakpoint(sizes.breakpoint)]: {gridTemplateColumns: '1fr'},
    },
    brand: {
        display: 'flex',
        flexDirection: 'column',
        gap: rem(4),
        '& strong': {
            fontFamily: fonts.heading,
            fontSize: rem(22),
            fontWeight: sizes.weight500,
            color: colors.text,
        },
    },
    links: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: `${rem(4)} ${rem(20)}`,
        alignItems: 'center',
        '& a': {
            display: 'inline-flex',
            alignItems: 'center',
            minHeight: rem(sizes.touch),
            color: colors.textMuted,
            textDecoration: 'none',
            '&:hover': {color: colors.gold},
        },
    },
    small: {
        gridColumn: '1 / -1',
        color: colors.textSubtle,
        display: 'flex',
        flexDirection: 'column',
        gap: rem(6),
        '& a': {color: colors.textMuted},
    },
};

// @ts-ignore
export const useFooterStyles = createUseStyles(styles);
