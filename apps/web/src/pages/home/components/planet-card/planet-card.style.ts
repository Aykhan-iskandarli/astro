import {createUseStyles} from 'react-jss';
import colors from 'assets/styles/abstracts/color';
import sizes from 'assets/styles/abstracts/sizes';
import {rem} from 'assets/styles/abstracts/functions';

const styles = {
    card: {
        position: 'absolute',
        inset: 0,
        padding: rem(28),
        borderRadius: rem(20),
        border: `1px solid ${colors.borderSoft}`,
        background: 'linear-gradient(160deg, rgba(28,28,56,0.72), rgba(11,11,30,0.55))',
        backdropFilter: 'blur(10px)',
        boxShadow: '0 20px 60px rgba(0,0,0,0.35)',
        willChange: 'opacity, transform',
    },
    static: {
        position: 'relative',
        inset: 'auto',
        height: '100%',
    },
    top: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: rem(18),
    },
    orb: {
        width: rem(40),
        height: rem(40),
        borderRadius: '50%',
    },
    counter: {
        color: colors.textSubtle,
        fontSize: rem(12),
        letterSpacing: '0.16em',
        textTransform: 'uppercase',
        fontVariantNumeric: 'tabular-nums',
    },
    name: {
        display: 'flex',
        alignItems: 'baseline',
        gap: rem(12),
        fontSize: 'clamp(2rem, 4vw, 2.8rem)',
        marginBottom: rem(10),
        '& .glyph': {color: colors.gold, fontSize: '0.7em'},
    },
    archetype: {
        fontSize: rem(sizes.large),
        color: colors.text,
        marginBottom: rem(16),
    },
    keywords: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: rem(8),
        '& li': {
            padding: [rem(4), rem(12)],
            borderRadius: 999,
            border: `1px solid ${colors.border}`,
            color: colors.textMuted,
            fontSize: rem(sizes.small),
        },
    },
};

// @ts-ignore
export const usePlanetCardStyles = createUseStyles(styles);
