import {createUseStyles} from 'react-jss';
import colors from 'assets/styles/abstracts/color';
import sizes from 'assets/styles/abstracts/sizes';
import {rem} from 'assets/styles/abstracts/functions';

const styles = {
    wrap: {display: 'flex', flexDirection: 'column', gap: rem(16), width: '100%', maxWidth: rem(820)},
    muted: {color: colors.textMuted, fontSize: rem(sizes.small), lineHeight: 1.6},
    card: {
        display: 'flex',
        flexDirection: 'column',
        gap: rem(14),
        padding: [rem(22), rem(24)],
        borderRadius: rem(18),
        border: `1px solid ${colors.borderSoft}`,
        background: 'linear-gradient(170deg, rgba(28,28,56,0.78), rgba(11,11,30,0.6))',
        '& h4': {fontSize: rem(20)},
        '& p': {margin: 0, lineHeight: 1.75, fontSize: rem(17), color: colors.text},
        '@media (max-width: 600px)': {padding: rem(16), '& p': {fontSize: rem(16)}},
    },
    branch: {display: 'flex', flexDirection: 'column', gap: rem(10)},
    steps: {
        listStyle: 'none',
        margin: 0,
        padding: 0,
        display: 'grid',
        gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
        gap: rem(10),
        '@media (max-width: 600px)': {gridTemplateColumns: '1fr'},
    },
    step: {
        display: 'flex',
        flexDirection: 'column',
        gap: rem(4),
        padding: [rem(12), rem(14)],
        borderRadius: rem(12),
        background: 'rgba(255,255,255,0.04)',
        '& b': {fontSize: rem(26), color: colors.gold, fontVariantNumeric: 'tabular-nums', lineHeight: 1.1},
        '& strong': {fontSize: rem(16)},
        '& span': {color: colors.textSubtle, fontSize: rem(13), lineHeight: 1.45},
        '& em': {fontStyle: 'normal', color: colors.textMuted, fontSize: rem(14), lineHeight: 1.45},
    },
    role: {color: colors.gold, fontSize: rem(12), letterSpacing: '0.1em', textTransform: 'uppercase'},
    more: {
        color: colors.textMuted,
        '& summary': {cursor: 'pointer', color: colors.gold, minHeight: rem(sizes.touch), display: 'flex', alignItems: 'center'},
        '& p': {marginTop: rem(8), fontSize: rem(16)},
        '& strong': {color: colors.text},
    },
};

// @ts-ignore
export const useMatrixLinesStyles = createUseStyles(styles);
