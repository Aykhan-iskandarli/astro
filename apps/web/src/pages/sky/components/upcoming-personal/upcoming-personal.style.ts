import {createUseStyles} from 'react-jss';
import colors from 'assets/styles/abstracts/color';
import sizes from 'assets/styles/abstracts/sizes';
import {rem} from 'assets/styles/abstracts/functions';

const styles = {
    wrap: {display: 'flex', flexDirection: 'column', gap: rem(12)},
    head: {display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: rem(12)},
    sub: {fontSize: rem(20), margin: 0},
    meta: {color: colors.textMuted, fontSize: rem(sizes.small)},
    busy: {opacity: 0.6, transition: 'opacity .2s'},
    list: {listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: rem(12)},
    item: {
        display: 'flex',
        flexDirection: 'column',
        gap: rem(8),
        padding: rem(16),
        borderRadius: rem(14),
        border: `1px solid ${colors.borderSoft}`,
        background: 'rgba(255,255,255,0.03)',
        '& .glyph': {color: colors.gold},
    },
    when: {color: colors.gold, fontVariantNumeric: 'tabular-nums', fontSize: rem(sizes.small)},
    title: {margin: 0, lineHeight: 1.5},
    text: {margin: 0, color: colors.textMuted, lineHeight: 1.6},
    harmonious: {color: `${colors.harmonious} !important`},
    tense: {color: `${colors.tense} !important`},
    neutral: {color: `${colors.neutral} !important`},
    minor: {color: `${colors.minor} !important`},
};

// @ts-ignore
export const useUpcomingPersonalStyles = createUseStyles(styles);
