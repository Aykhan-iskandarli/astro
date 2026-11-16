import {createUseStyles} from 'react-jss';
import colors from 'assets/styles/abstracts/color';
import sizes from 'assets/styles/abstracts/sizes';
import {rem} from 'assets/styles/abstracts/functions';

const styles = {
    wrap: {display: 'flex', flexDirection: 'column', gap: rem(14)},
    title: {fontSize: rem(28)},
    muted: {color: colors.textMuted, fontSize: rem(sizes.small)},
    grid: {
        display: 'flex',
        flexDirection: 'column',
        gap: rem(20),
        width: '100%',
        maxWidth: rem(820),
    },
    card: {
        display: 'flex',
        flexDirection: 'column',
        gap: rem(14),
        padding: [rem(24), rem(26)],
        borderRadius: rem(18),
        border: `1px solid ${colors.borderSoft}`,
        background: 'linear-gradient(170deg, rgba(28,28,56,0.78), rgba(11,11,30,0.6))',
        '& h3': {fontSize: rem(22), lineHeight: 1.3, '& .glyph': {color: colors.gold}},
        '& h4': {fontSize: rem(16), color: colors.text, marginTop: rem(4)},
        '& p': {lineHeight: 1.75, fontSize: rem(17), margin: 0},
        '& .glyph': {color: colors.gold},
        // each sub-block (a ruler, a planet) is a separate paragraph group, divided by a thin rule
        '& > div': {display: 'flex', flexDirection: 'column', gap: rem(8), paddingTop: rem(14), borderTop: `1px solid ${colors.borderSoft}`},
        '& p$fact': {
            alignSelf: 'flex-start', padding: [rem(4), rem(12)], borderRadius: rem(12), background: 'rgba(255,255,255,0.05)',
            fontSize: rem(14), lineHeight: 1.5,
        },
        '@media (max-width: 600px)': {padding: rem(18), '& p': {fontSize: rem(16)}},
    },
    label: {color: colors.gold, fontSize: rem(sizes.small), letterSpacing: '0.12em', textTransform: 'uppercase'},
    fact: {color: colors.gold, fontVariantNumeric: 'tabular-nums'},
    text: {color: colors.text},
    note: {color: colors.textSubtle, fontSize: rem(sizes.small)},
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
export const useChartDepthStyles = createUseStyles(styles);
