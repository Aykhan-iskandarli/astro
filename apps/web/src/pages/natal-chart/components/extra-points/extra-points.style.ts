import {createUseStyles} from 'react-jss';
import colors from 'assets/styles/abstracts/color';
import {rem} from 'assets/styles/abstracts/functions';

const styles = {
    wrap: {
        display: 'flex',
        flexDirection: 'column',
        gap: rem(16),
    },
    grid: {
        listStyle: 'none',
        margin: 0,
        padding: 0,
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 260px), 1fr))',
        gap: rem(12),
    },
    card: {
        display: 'flex',
        flexDirection: 'column',
        gap: rem(6),
        padding: rem(16),
        borderRadius: rem(14),
        border: `1px solid ${colors.borderSoft}`,
        background: 'rgba(28,28,56,0.45)',
    },
    title: {
        display: 'flex',
        alignItems: 'center',
        gap: rem(10),
    },
    glyph: {
        color: colors.gold,
        fontSize: rem(20),
        minWidth: rem(24),
        textAlign: 'center',
    },
    pos: {
        color: colors.textMuted,
        '& .glyph': {color: colors.gold},
    },
    text: {
        lineHeight: 1.6,
        color: colors.textMuted,
    },
    sub: {
        fontSize: rem(18),
        marginTop: rem(8),
    },
    stars: {
        listStyle: 'none',
        margin: 0,
        padding: 0,
        display: 'flex',
        flexDirection: 'column',
        borderTop: `1px solid ${colors.borderSoft}`,
    },
    star: {
        padding: [rem(12), 0],
        borderBottom: `1px solid ${colors.borderSoft}`,
        '& .glyph': {color: colors.gold},
    },
    starMark: {
        color: colors.gold,
        marginRight: rem(8),
    },
    muted: {color: colors.textMuted},
};

// @ts-ignore
export const useExtraPointsStyles = createUseStyles(styles);
