import {createUseStyles} from 'react-jss';
import colors from 'assets/styles/abstracts/color';
import fonts from 'assets/styles/abstracts/fonts';
import sizes from 'assets/styles/abstracts/sizes';
import {rem} from 'assets/styles/abstracts/functions';
import {breakpoint, transition} from 'assets/styles/abstracts/mixins';

const styles = {
    header: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        background: 'linear-gradient(to bottom, rgba(11,11,30,0.85), rgba(11,11,30,0))',
        backdropFilter: 'blur(6px)',
    },
    inner: {
        display: 'flex',
        alignItems: 'center',
        gap: rem(24),
        height: rem(72),
        [breakpoint(sizes.breakpoint)]: {
            gap: rem(12),
            height: rem(64),
        },
    },
    logo: {
        display: 'flex',
        alignItems: 'center',
        gap: rem(10),
        fontFamily: fonts.heading,
        fontSize: rem(24),
        color: colors.text,
        textDecoration: 'none',
        letterSpacing: '0.04em',
        [breakpoint(sizes.breakpointSm)]: {fontSize: rem(20)},
    },
    logoMark: {
        width: rem(14),
        height: rem(14),
        borderRadius: '50%',
        background: `radial-gradient(circle at 35% 35%, ${colors.white}, ${colors.gold} 45%, ${colors.goldDeep})`,
        boxShadow: `0 0 16px ${colors.gold}`,
    },
    nav: {
        display: 'flex',
        gap: rem(4),
        marginLeft: 'auto',
        [breakpoint(sizes.breakpointSm)]: {
            '& a:first-child': {display: 'none'},
        },
    },
    link: {
        display: 'inline-flex',
        alignItems: 'center',
        minHeight: rem(sizes.touch),
        padding: [0, rem(14)],
        color: colors.textMuted,
        textDecoration: 'none',
        fontSize: rem(sizes.text),
        borderRadius: 999,
        transition: transition('color', 0.2),
        '&:hover': {color: colors.text},
        [breakpoint(sizes.breakpoint)]: {padding: [0, rem(10)]},
    },
    active: {
        color: colors.gold,
    },
    tools: {
        display: 'flex',
        alignItems: 'center',
        gap: rem(8),
        [breakpoint(sizes.breakpointSm)]: {gap: rem(2)},
    },
    langButton: {
        minWidth: rem(sizes.touch),
        minHeight: rem(sizes.touch),
        background: 'transparent',
        border: 'none',
        color: colors.textSubtle,
        cursor: 'pointer',
        fontSize: rem(sizes.small),
        letterSpacing: '0.08em',
        transition: transition('color', 0.2),
        '&:hover': {color: colors.text},
    },
    langActive: {
        color: colors.gold,
        // On phones only the language you can switch TO is shown, to save space
        [breakpoint(sizes.breakpointSm)]: {display: 'none'},
    },
    iconButton: {
        width: rem(sizes.touch),
        height: rem(sizes.touch),
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '50%',
        border: `1px solid ${colors.border}`,
        background: 'transparent',
        color: colors.textMuted,
        cursor: 'pointer',
        transition: transition('color, border-color', 0.2),
        '&:hover': {color: colors.gold, borderColor: colors.gold},
        '&[aria-pressed="true"]': {color: colors.gold, borderColor: colors.goldDeep},
    },
};

// @ts-ignore
export const useHeaderStyles = createUseStyles(styles);
