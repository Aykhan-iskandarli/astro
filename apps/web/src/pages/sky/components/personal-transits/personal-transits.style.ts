import {createUseStyles} from 'react-jss';
import colors from 'assets/styles/abstracts/color';
import {rem} from 'assets/styles/abstracts/functions';

const styles = {
    wrap: {
        display: 'flex',
        flexDirection: 'column',
        gap: rem(16),
    },
    select: {
        maxWidth: rem(360),
        width: '100%',
    },
    empty: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        gap: rem(16),
        color: colors.textMuted,
    },
    list: {
        listStyle: 'none',
        margin: 0,
        padding: 0,
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 340px), 1fr))',
        gap: rem(12),
    },
    item: {
        display: 'flex',
        gap: rem(14),
        padding: rem(16),
        borderRadius: rem(14),
        border: `1px solid ${colors.borderSoft}`,
        background: 'rgba(28,28,56,0.45)',
    },
    tone: {
        fontSize: rem(22),
        lineHeight: 1.2,
        width: rem(24),
        flexShrink: 0,
        textAlign: 'center',
    },
    harmonious: {color: colors.harmonious},
    tense: {color: colors.tense},
    neutral: {color: colors.neutral},
    minor: {color: colors.minor},
    title: {
        '& .glyph': {color: colors.gold},
    },
    meta: {
        color: colors.textMuted,
        fontSize: rem(14),
        marginTop: rem(2),
    },
    text: {
        marginTop: rem(8),
        lineHeight: 1.6,
    },
};

// @ts-ignore
export const usePersonalTransitsStyles = createUseStyles(styles);
