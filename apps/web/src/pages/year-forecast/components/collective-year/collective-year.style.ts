import {createUseStyles} from 'react-jss';
import colors from 'assets/styles/abstracts/color';
import sizes from 'assets/styles/abstracts/sizes';
import {rem} from 'assets/styles/abstracts/functions';

const styles = {
    wrap: {display: 'flex', flexDirection: 'column', gap: rem(28)},
    title: {fontSize: rem(28)},
    nav: {overflowX: 'auto', paddingBottom: rem(4)},
    block: {display: 'flex', flexDirection: 'column', gap: rem(14), '& > h3': {fontSize: rem(22)}},
    muted: {color: colors.textMuted, fontSize: rem(sizes.small), lineHeight: 1.6},
    grid: {display: 'flex', flexDirection: 'column', gap: rem(20), width: '100%', maxWidth: rem(820)},
    card: {
        display: 'flex',
        flexDirection: 'column',
        gap: rem(14),
        padding: [rem(24), rem(26)],
        borderRadius: rem(18),
        border: `1px solid ${colors.borderSoft}`,
        background: 'linear-gradient(170deg, rgba(28,28,56,0.78), rgba(11,11,30,0.6))',
        '& h4': {fontSize: rem(22), lineHeight: 1.3, '& .glyph': {color: colors.gold}},
        '& p': {lineHeight: 1.75, fontSize: rem(17), margin: 0},
        '& .glyph': {color: colors.gold},
        // each stay in a sign is a separate paragraph group, divided by a thin rule
        '& > div': {display: 'flex', flexDirection: 'column', gap: rem(8), paddingTop: rem(14), borderTop: `1px solid ${colors.borderSoft}`},
        '& p$fact': {
            alignSelf: 'flex-start', padding: [rem(4), rem(12)], borderRadius: rem(12), background: 'rgba(255,255,255,0.05)',
            fontSize: rem(14), lineHeight: 1.5,
        },
        '@media (max-width: 600px)': {padding: rem(18), '& p': {fontSize: rem(16)}},
    },
    role: {color: colors.textMuted},
    fact: {color: colors.gold, fontVariantNumeric: 'tabular-nums'},
    text: {color: colors.text},
    note: {color: colors.textSubtle, fontSize: rem(sizes.small)},
    harmonious: {color: `${colors.harmonious} !important`},
    tense: {color: `${colors.tense} !important`},
    neutral: {color: `${colors.neutral} !important`},
    minor: {color: `${colors.minor} !important`},
};

// @ts-ignore
export const useCollectiveYearStyles = createUseStyles(styles);
