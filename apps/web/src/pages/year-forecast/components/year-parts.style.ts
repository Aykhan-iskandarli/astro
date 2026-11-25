import {createUseStyles} from 'react-jss';
import colors from 'assets/styles/abstracts/color';
import sizes from 'assets/styles/abstracts/sizes';
import {rem} from 'assets/styles/abstracts/functions';

// The reading-column look shared by the parts of the year forecast (month by month, solar return, life stages,
// directions, other systems): one card per item, 820px wide, thin rules between its blocks.
const styles = {
    wrap: {display: 'flex', flexDirection: 'column', gap: rem(14)},
    title: {fontSize: rem(28)},
    muted: {color: colors.textMuted, fontSize: rem(sizes.small), lineHeight: 1.6},
    list: {listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: rem(20), width: '100%', maxWidth: rem(820)},
    card: {
        display: 'flex',
        flexDirection: 'column',
        gap: rem(12),
        padding: [rem(24), rem(26)],
        borderRadius: rem(18),
        border: `1px solid ${colors.borderSoft}`,
        background: 'linear-gradient(170deg, rgba(28,28,56,0.78), rgba(11,11,30,0.6))',
        '& h3': {fontSize: rem(22), lineHeight: 1.3, margin: 0, '& .glyph': {color: colors.gold}},
        '& h4': {fontSize: rem(18), lineHeight: 1.35, margin: 0, '& .glyph': {color: colors.gold}},
        '& p': {lineHeight: 1.75, fontSize: rem(17), margin: 0},
        '& .glyph': {color: colors.gold},
        '& > div': {display: 'flex', flexDirection: 'column', gap: rem(8), paddingTop: rem(14), borderTop: `1px solid ${colors.borderSoft}`},
        '@media (max-width: 600px)': {padding: rem(18), '& p': {fontSize: rem(16)}},
    },
    label: {color: colors.gold, fontSize: rem(sizes.small), letterSpacing: '0.12em', textTransform: 'uppercase'},
    fact: {color: colors.gold, fontVariantNumeric: 'tabular-nums'},
    text: {color: colors.text},
    soft: {color: colors.textMuted},
    note: {color: colors.textSubtle, fontSize: rem(sizes.small)},
    nav: {overflowX: 'auto', paddingBottom: rem(4)},
    chips: {display: 'flex', flexWrap: 'wrap', gap: rem(8)},
    chip: {padding: [rem(4), rem(12)], borderRadius: rem(12), background: 'rgba(255,255,255,0.05)', fontSize: rem(14), lineHeight: 1.5, color: colors.text},
    harmonious: {color: `${colors.harmonious} !important`},
    tense: {color: `${colors.tense} !important`},
    neutral: {color: `${colors.neutral} !important`},
    minor: {color: `${colors.minor} !important`},
};

// @ts-ignore
export const useYearPartsStyles = createUseStyles(styles);
