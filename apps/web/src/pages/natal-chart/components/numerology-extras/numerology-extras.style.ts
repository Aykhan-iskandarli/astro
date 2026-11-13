import {createUseStyles} from 'react-jss';
import colors from 'assets/styles/abstracts/color';
import sizes from 'assets/styles/abstracts/sizes';
import {rem} from 'assets/styles/abstracts/functions';

const card = {
    padding: rem(20),
    borderRadius: rem(sizes.radius),
    border: `1px solid ${colors.borderSoft}`,
    background: 'linear-gradient(170deg, rgba(28,28,56,0.75), rgba(11,11,30,0.45))',
};

const styles = {
    section: {
        display: 'flex',
        flexDirection: 'column',
        gap: rem(16),
        '& > h3': {fontSize: rem(24)},
    },
    lead: {color: colors.textMuted, maxWidth: rem(760)},
    grid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 240px), 1fr))',
        gap: rem(16),
    },
    card: {...card, display: 'flex', flexDirection: 'column', gap: rem(8)},
    cardCurrent: {borderColor: 'rgba(226,194,117,0.55)', boxShadow: '0 0 0 1px rgba(226,194,117,0.25)'},
    period: {color: colors.gold, fontSize: rem(sizes.small), letterSpacing: '0.08em', textTransform: 'uppercase'},
    row: {display: 'flex', alignItems: 'baseline', gap: rem(10)},
    big: {fontSize: rem(32), color: colors.gold, lineHeight: 1, minWidth: rem(36)},
    label: {color: colors.textSubtle, fontSize: rem(sizes.small)},
    name: {fontWeight: sizes.weight600},
    text: {color: colors.textMuted, lineHeight: 1.65},
    divider: {borderTop: `1px solid ${colors.borderSoft}`, margin: [rem(4), 0]},
    inputs: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: rem(12),
        alignItems: 'flex-end',
        '& label': {display: 'flex', flexDirection: 'column', gap: rem(6), color: colors.textMuted, flex: '1 1 240px'},
        '& .ant-picker': {width: '100%'},
    },
    tableWrap: {overflowX: 'auto'},
    table: {
        width: '100%',
        borderCollapse: 'collapse',
        '& th, & td': {padding: [rem(10), rem(12)], textAlign: 'left', borderBottom: `1px solid ${colors.borderSoft}`},
        '& th': {color: colors.textSubtle, fontWeight: sizes.weight500, fontSize: rem(sizes.small)},
        '& td b': {color: colors.gold, fontSize: rem(20)},
    },
    changed: {color: colors.gold, fontSize: rem(sizes.small)},
    same: {color: colors.textSubtle, fontSize: rem(sizes.small)},
    pairs: {display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 260px), 1fr))', gap: rem(16)},
    relation: {fontSize: rem(sizes.small), fontWeight: sizes.weight600},
    rel_same: {color: colors.gold},
    rel_harmonious: {color: colors.harmonious},
    rel_different: {color: colors.tense},
    note: {color: colors.textSubtle, fontSize: rem(sizes.small)},
};

// @ts-ignore
export const useNumerologyExtrasStyles = createUseStyles(styles);
