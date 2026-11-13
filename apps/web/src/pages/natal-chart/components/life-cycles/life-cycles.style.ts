import {createUseStyles} from 'react-jss';
import colors from 'assets/styles/abstracts/color';
import sizes from 'assets/styles/abstracts/sizes';
import {rem} from 'assets/styles/abstracts/functions';

const card = {
    padding: rem(24),
    borderRadius: rem(sizes.radius),
    border: `1px solid ${colors.borderSoft}`,
    background: 'linear-gradient(170deg, rgba(28,28,56,0.75), rgba(11,11,30,0.45))',
};

const styles = {
    wrapper: {display: 'flex', flexDirection: 'column', gap: rem(32)},
    info: {color: colors.textMuted, maxWidth: rem(760)},
    section: {
        display: 'flex',
        flexDirection: 'column',
        gap: rem(16),
        '& > h3': {fontSize: rem(24)},
    },
    profection: {
        ...card,
        display: 'flex',
        flexDirection: 'column',
        gap: rem(10),
    },
    eyebrow: {color: colors.gold, fontSize: rem(sizes.small), letterSpacing: '0.12em', textTransform: 'uppercase'},
    big: {fontSize: rem(26), lineHeight: 1.3},
    muted: {color: colors.textMuted, lineHeight: 1.7},
    subtle: {color: colors.textSubtle, fontSize: rem(sizes.small)},
    gold: {color: colors.gold},
    caption: {color: colors.textSubtle, fontSize: rem(sizes.small), textAlign: 'left', paddingBottom: rem(8)},
    table: {
        width: '100%',
        borderCollapse: 'collapse',
        fontSize: rem(sizes.small + 1),
        '& th, & td': {
            padding: [rem(8), rem(10)],
            textAlign: 'left',
            borderBottom: `1px solid ${colors.borderSoft}`,
            whiteSpace: 'nowrap',
        },
        '& th': {color: colors.textSubtle, fontWeight: sizes.weight500},
        '& tr[data-current="true"] td': {background: colors.surfaceRaised, color: colors.text},
        '& .glyph': {color: colors.gold},
    },
    tableWrap: {overflowX: 'auto'},
    returns: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 300px), 1fr))',
        gap: rem(16),
    },
    returnCard: {...card, display: 'flex', flexDirection: 'column', gap: rem(12)},
    returnHead: {
        display: 'flex',
        alignItems: 'center',
        gap: rem(12),
        '& h4': {fontSize: rem(20)},
        '& .glyph': {color: colors.gold, fontSize: rem(22), width: rem(28), textAlign: 'center'},
    },
    list: {display: 'flex', flexDirection: 'column', gap: rem(6)},
    item: {
        display: 'grid',
        gridTemplateColumns: 'auto 1fr auto',
        gap: rem(10),
        alignItems: 'baseline',
        padding: [rem(8), rem(10)],
        borderRadius: rem(8),
    },
    itemNext: {background: 'rgba(226,194,117,0.10)', outline: '1px solid rgba(226,194,117,0.35)'},
    itemPast: {opacity: 0.6},
    num: {color: colors.gold, fontWeight: sizes.weight600},
    dates: {display: 'flex', flexDirection: 'column', gap: rem(2), '& small': {color: colors.textSubtle}},
    badge: {
        fontSize: rem(12),
        padding: [rem(2), rem(8)],
        borderRadius: rem(999),
        border: `1px solid ${colors.borderSoft}`,
        color: colors.textMuted,
    },
    badgeNext: {color: colors.gold, borderColor: 'rgba(226,194,117,0.5)'},
    retro: {color: colors.tense},
};

// @ts-ignore
export const useLifeCyclesStyles = createUseStyles(styles);
