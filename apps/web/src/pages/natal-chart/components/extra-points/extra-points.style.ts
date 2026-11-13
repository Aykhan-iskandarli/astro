import {createUseStyles} from 'react-jss';
import colors from 'assets/styles/abstracts/color';
import sizes from 'assets/styles/abstracts/sizes';
import {rem} from 'assets/styles/abstracts/functions';

const styles = {
    grid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 280px), 1fr))',
        gap: rem(16),
    },
    card: {
        padding: rem(20),
        borderRadius: rem(sizes.radius),
        border: `1px solid ${colors.borderSoft}`,
        background: 'linear-gradient(170deg, rgba(28,28,56,0.75), rgba(11,11,30,0.45))',
        display: 'flex',
        flexDirection: 'column',
        gap: rem(8),
    },
    head: {
        display: 'flex',
        alignItems: 'center',
        gap: rem(12),
        '& h3': {fontSize: rem(20)},
    },
    glyph: {
        width: rem(40),
        height: rem(40),
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '50%',
        border: `1px solid ${colors.border}`,
        color: colors.gold,
        fontSize: rem(20),
        fontWeight: sizes.weight600,
    },
    position: {
        color: colors.textMuted,
        fontSize: rem(sizes.small),
        '& .glyph': {color: colors.gold},
    },
    retro: {color: colors.tense, fontWeight: sizes.weight600},
    keywords: {color: colors.gold, fontSize: rem(sizes.small)},
    text: {color: colors.textMuted, lineHeight: 1.65},
    note: {color: colors.textSubtle, fontSize: rem(sizes.small)},
};

// @ts-ignore
export const useExtraPointsStyles = createUseStyles(styles);
