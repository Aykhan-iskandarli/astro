import {createUseStyles} from 'react-jss';
import colors from 'assets/styles/abstracts/color';
import sizes from 'assets/styles/abstracts/sizes';
import {rem} from 'assets/styles/abstracts/functions';

// Shared look of the deeper-analysis panels (details, timing, compatibility summary, other systems, the day).
const card = {
    padding: rem(18),
    borderRadius: rem(sizes.radius),
    border: `1px solid ${colors.borderSoft}`,
    background: 'linear-gradient(170deg, rgba(28,28,56,0.78), rgba(11,11,30,0.48))',
    display: 'flex',
    flexDirection: 'column',
    gap: rem(8),
};

const styles = {
    wrapper: {display: 'flex', flexDirection: 'column', gap: rem(32)},
    section: {display: 'flex', flexDirection: 'column', gap: rem(14), '& > h3': {fontSize: rem(24)}},
    lead: {color: colors.textMuted, lineHeight: 1.7, maxWidth: rem(800)},
    grid: {display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 260px), 1fr))', gap: rem(14)},
    card,
    cardHot: {...card, borderColor: 'rgba(226,194,117,0.55)'},
    title: {fontWeight: sizes.weight600, color: colors.text},
    big: {fontSize: rem(30), color: colors.gold, lineHeight: 1.1},
    text: {color: colors.textMuted, lineHeight: 1.65},
    small: {color: colors.textSubtle, fontSize: rem(sizes.small), lineHeight: 1.5},
    gold: {color: colors.gold},
    good: {color: colors.harmonious},
    bad: {color: colors.tense},
    list: {display: 'flex', flexDirection: 'column', gap: rem(6), '& li': {color: colors.textMuted, lineHeight: 1.6}, '& .glyph': {color: colors.gold}},
    tableWrap: {overflowX: 'auto'},
    table: {
        width: '100%',
        borderCollapse: 'collapse',
        fontSize: rem(sizes.small + 1),
        '& th, & td': {padding: [rem(8), rem(10)], textAlign: 'left', borderBottom: `1px solid ${colors.borderSoft}`, whiteSpace: 'nowrap'},
        '& th': {color: colors.textSubtle, fontWeight: sizes.weight500},
        '& tr[data-hot="true"] td': {background: colors.surfaceRaised, color: colors.text},
        '& .glyph': {color: colors.gold},
    },
    bar: {
        height: rem(8),
        borderRadius: rem(999),
        background: colors.surfaceRaised,
        overflow: 'hidden',
        '& span': {display: 'block', height: '100%', background: colors.gold},
    },
    row: {display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: rem(12)},
    controls: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: rem(14),
        alignItems: 'flex-end',
        '& label': {display: 'flex', flexDirection: 'column', gap: rem(6), color: colors.textMuted},
    },
    badge: {fontSize: rem(12), padding: [rem(2), rem(8)], borderRadius: rem(999), border: `1px solid ${colors.borderSoft}`, color: colors.textMuted},
    badgeHot: {color: colors.gold, borderColor: 'rgba(226,194,117,0.5)'},
};

// @ts-ignore
export const useExtrasStyles = createUseStyles(styles);
