import {createUseStyles} from 'react-jss';
import colors from 'assets/styles/abstracts/color';
import sizes from 'assets/styles/abstracts/sizes';
import {rem} from 'assets/styles/abstracts/functions';
import {transition} from 'assets/styles/abstracts/mixins';

const HANZI = '"Noto Serif SC", "Songti SC", "SimSun", serif';

const styles = {
    wrap: {display: 'flex', flexDirection: 'column', gap: rem(14), transition: transition('opacity', 0.3)},
    busy: {opacity: 0.6},
    strip: {display: 'flex', gap: rem(8), overflowX: 'auto', paddingBottom: rem(6), margin: 0, padding: 0, listStyle: 'none'},
    year: {
        flex: '0 0 auto',
        width: rem(92),
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: rem(2),
        padding: [rem(10), rem(4)],
        borderRadius: rem(12),
        border: `1px solid ${colors.borderSoft}`,
        background: colors.surface,
        color: colors.text,
        cursor: 'pointer',
        font: 'inherit',
        '& b': {fontSize: rem(24), lineHeight: 1.1, fontFamily: HANZI},
        '& small': {color: colors.textSubtle, fontSize: rem(11), textAlign: 'center'},
        '&:hover, &:focus-visible': {borderColor: colors.gold},
        '&:focus-visible': {outline: `2px solid ${colors.gold}`, outlineOffset: 2},
    },
    yearOn: {borderColor: `${colors.gold} !important`, boxShadow: `0 0 0 1px ${colors.gold}`},
    yearNum: {color: colors.textMuted, fontSize: rem(sizes.small), fontVariantNumeric: 'tabular-nums'},
    own: {color: colors.gold, fontSize: rem(11)},
    card: {
        display: 'flex',
        flexDirection: 'column',
        gap: rem(10),
        padding: rem(20),
        borderRadius: rem(18),
        border: `1px solid ${colors.borderSoft}`,
        background: 'linear-gradient(170deg, rgba(28,28,56,0.78), rgba(11,11,30,0.6))',
        '& h4': {fontSize: rem(22)},
        '& p': {lineHeight: 1.6},
    },
    god: {color: colors.gold},
    muted: {color: colors.textMuted, fontSize: rem(sizes.small)},
    relations: {listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: rem(10)},
    relation: {
        display: 'flex',
        flexDirection: 'column',
        gap: rem(2),
        paddingTop: rem(10),
        borderTop: `1px solid ${colors.borderSoft}`,
        '& strong': {fontSize: rem(sizes.small), color: colors.gold, letterSpacing: '0.04em'},
    },
    note: {color: colors.textSubtle, fontSize: rem(sizes.small)},
};

// @ts-ignore
export const useChineseAnnualStyles = createUseStyles(styles);
