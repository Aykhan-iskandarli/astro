import {createUseStyles} from 'react-jss';
import colors from 'assets/styles/abstracts/color';
import {rem} from 'assets/styles/abstracts/functions';

const styles = {
    wrap: {
        display: 'flex',
        flexDirection: 'column',
        gap: rem(12),
    },
    muted: {color: colors.textMuted},
    more: {alignSelf: 'flex-start'},
    list: {
        listStyle: 'none',
        margin: 0,
        padding: 0,
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 360px), 1fr))',
        gap: rem(12),
    },
    item: {
        display: 'flex',
        flexDirection: 'column',
        gap: rem(6),
        padding: rem(18),
        borderRadius: rem(16),
        border: `1px solid ${colors.borderSoft}`,
        background: 'rgba(28,28,56,0.45)',
        '& p': {lineHeight: 1.6},
        '& .glyph': {color: colors.gold},
    },
    eclipse: {
        borderColor: 'rgba(226,194,117,0.55)',
        background: 'linear-gradient(170deg, rgba(226,194,117,0.1), rgba(28,28,56,0.5))',
    },
    head: {
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'baseline',
        gap: rem(10),
    },
    badge: {
        padding: [rem(1), rem(10)],
        borderRadius: 999,
        background: 'rgba(226,194,117,0.18)',
        color: colors.gold,
        fontSize: rem(13),
    },
    when: {
        marginLeft: 'auto',
        color: colors.gold,
        fontVariantNumeric: 'tabular-nums',
    },
    theme: {color: colors.gold, fontSize: rem(14)},
    aspects: {
        listStyle: 'none',
        margin: 0,
        padding: 0,
        display: 'flex',
        flexDirection: 'column',
        gap: rem(4),
        fontSize: rem(14),
    },
    harmonious: {color: `${colors.harmonious} !important`},
    tense: {color: `${colors.tense} !important`},
    neutral: {color: `${colors.neutral} !important`},
    minor: {color: `${colors.minor} !important`},
};

// @ts-ignore
export const usePersonalLunationsStyles = createUseStyles(styles);
