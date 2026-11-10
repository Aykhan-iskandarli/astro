import {createUseStyles} from 'react-jss';
import colors from 'assets/styles/abstracts/color';
import sizes from 'assets/styles/abstracts/sizes';
import fonts from 'assets/styles/abstracts/fonts';
import {rem} from 'assets/styles/abstracts/functions';
import {breakpoint} from 'assets/styles/abstracts/mixins';

// Element accent: a soft glow in the card corner, tinted by the sign's element colour token
const accent = (hex: string) => ({
    '--accent': hex,
    background: `radial-gradient(120% 80% at 100% 0%, ${hex}29, transparent 55%),
        linear-gradient(170deg, rgba(28,28,56,0.8), rgba(11,11,30,0.6))`,
});

const styles = {
    wrap: {
        display: 'flex',
        flexDirection: 'column',
        gap: rem(16),
    },
    title: {
        fontSize: rem(24),
    },
    grid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
        gap: rem(16),
        [breakpoint(sizes.breakpointLg)]: {gridTemplateColumns: '1fr'},
    },
    card: {
        '--accent': colors.gold,
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        gap: rem(10),
        padding: rem(24),
        borderRadius: rem(20),
        border: `1px solid ${colors.borderSoft}`,
        background: 'linear-gradient(170deg, rgba(28,28,56,0.8), rgba(11,11,30,0.6))',
        overflow: 'hidden',
    },
    fire: accent(colors.fire),
    earth: accent(colors.earth),
    air: accent(colors.air),
    water: accent(colors.water),
    head: {
        display: 'flex',
        alignItems: 'center',
        gap: rem(14),
        marginBottom: rem(4),
    },
    pointGlyph: {
        width: rem(44),
        height: rem(44),
        flexShrink: 0,
        display: 'grid',
        placeItems: 'center',
        borderRadius: '50%',
        border: `1px solid ${colors.border}`,
        color: colors.gold,
        fontSize: rem(22),
        fontWeight: 600,
    },
    role: {
        color: colors.textMuted,
        fontSize: rem(sizes.small),
        letterSpacing: '0.12em',
        textTransform: 'uppercase',
    },
    pointName: {
        fontSize: rem(18),
    },
    signGlyph: {
        marginLeft: 'auto',
        fontSize: rem(48),
        lineHeight: 1,
        color: 'var(--accent)',
        opacity: 0.85,
    },
    sign: {
        fontFamily: fonts.heading,
        fontSize: rem(26),
        lineHeight: 1.2,
    },
    degree: {
        fontSize: rem(16),
        color: colors.textMuted,
        fontVariantNumeric: 'tabular-nums',
    },
    tags: {
        color: colors.gold,
        fontSize: rem(sizes.small),
    },
    text: {
        color: colors.text,
        lineHeight: 1.65,
        flex: 1,
    },
    more: {
        alignSelf: 'flex-start',
        minHeight: rem(sizes.touch),
        padding: 0,
        border: 'none',
        background: 'transparent',
        color: colors.gold,
        cursor: 'pointer',
        textDecoration: 'underline',
        textUnderlineOffset: '4px',
        font: 'inherit',
        '&:hover': {color: colors.text},
        '&:focus-visible': {outline: `2px solid ${colors.gold}`, outlineOffset: 2, borderRadius: 4},
    },
};

// @ts-ignore
export const useBigThreeStyles = createUseStyles(styles);
