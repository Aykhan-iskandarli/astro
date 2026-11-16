import {createUseStyles} from 'react-jss';
import colors from 'assets/styles/abstracts/color';
import sizes from 'assets/styles/abstracts/sizes';
import {rem} from 'assets/styles/abstracts/functions';

const styles = {
    wrap: {display: 'flex', flexDirection: 'column', gap: rem(14)},
    title: {fontSize: rem(28)},
    muted: {color: colors.textMuted, fontSize: rem(sizes.small)},
    grid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))',
        gap: rem(14),
        alignItems: 'start',
    },
    card: {
        display: 'flex',
        flexDirection: 'column',
        gap: rem(8),
        padding: rem(18),
        borderRadius: rem(16),
        border: `1px solid ${colors.borderSoft}`,
        background: 'linear-gradient(170deg, rgba(28,28,56,0.78), rgba(11,11,30,0.6))',
        '& h3': {fontSize: rem(18), '& .glyph': {color: colors.gold}},
        '& p': {lineHeight: 1.6},
        '& .glyph': {color: colors.gold},
    },
    label: {color: colors.gold, fontSize: rem(sizes.small), letterSpacing: '0.12em', textTransform: 'uppercase'},
    fact: {color: colors.gold, fontVariantNumeric: 'tabular-nums'},
    text: {color: colors.textMuted},
    note: {color: colors.textSubtle, fontSize: rem(sizes.small)},
    items: {listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: rem(12)},
    item: {
        display: 'grid',
        gridTemplateColumns: `${rem(32)} 1fr`,
        gap: rem(12),
        padding: rem(14),
        borderRadius: rem(14),
        border: `1px solid ${colors.borderSoft}`,
        background: 'rgba(28,28,56,0.45)',
        '& p': {lineHeight: 1.6},
        '& .glyph': {color: colors.gold},
    },
    tone: {fontSize: rem(24), lineHeight: 1},
    head: {fontSize: rem(17)},
    harmonious: {color: `${colors.harmonious} !important`},
    tense: {color: `${colors.tense} !important`},
    neutral: {color: `${colors.neutral} !important`},
    minor: {color: `${colors.minor} !important`},
    list: {listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: rem(4), color: colors.text},
    bars: {display: 'flex', flexDirection: 'column', gap: rem(6)},
    bar: {
        display: 'grid',
        gridTemplateColumns: `${rem(110)} 1fr ${rem(28)}`,
        alignItems: 'center',
        gap: rem(8),
        '& > span:nth-child(2)': {height: rem(8), borderRadius: rem(4), background: colors.surface, overflow: 'hidden', '& i': {display: 'block', height: '100%', background: colors.gold}},
        '& b': {textAlign: 'right', fontVariantNumeric: 'tabular-nums'},
    },
    rules: {
        color: colors.textMuted,
        '& summary': {cursor: 'pointer', color: colors.text, minHeight: rem(sizes.touch), display: 'flex', alignItems: 'center'},
        '& p': {lineHeight: 1.6, marginTop: rem(6)},
    },
};

// @ts-ignore
export const useChartAspectsStyles = createUseStyles(styles);
