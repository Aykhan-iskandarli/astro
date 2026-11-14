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
};

// @ts-ignore
export const useChartPortraitStyles = createUseStyles(styles);
