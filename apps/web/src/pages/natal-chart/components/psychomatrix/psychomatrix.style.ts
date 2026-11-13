import {createUseStyles} from 'react-jss';
import colors from 'assets/styles/abstracts/color';
import sizes from 'assets/styles/abstracts/sizes';
import {rem} from 'assets/styles/abstracts/functions';
import {breakpoint} from 'assets/styles/abstracts/mixins';

const styles = {
    section: {display: 'flex', flexDirection: 'column', gap: rem(16), '& > h3': {fontSize: rem(24)}},
    lead: {color: colors.textMuted, lineHeight: 1.7, maxWidth: rem(780)},
    work: {display: 'flex', flexWrap: 'wrap', gap: rem(8), alignItems: 'center', color: colors.textMuted, '& b': {color: colors.gold}},
    layout: {
        display: 'grid',
        gridTemplateColumns: 'auto minmax(0, 1fr)',
        gap: rem(24),
        alignItems: 'start',
        [breakpoint(sizes.breakpoint)]: {gridTemplateColumns: '1fr'},
    },
    grid: {
        display: 'grid',
        gridTemplateColumns: `repeat(3, ${rem(104)})`,
        gap: rem(6),
        justifySelf: 'start',
    },
    cell: {
        minHeight: rem(88),
        padding: rem(8),
        borderRadius: rem(10),
        border: `1px solid ${colors.borderSoft}`,
        background: 'rgba(28,28,56,0.6)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: rem(4),
        textAlign: 'center',
        '& b': {color: colors.gold, fontSize: rem(18), letterSpacing: '0.06em', wordBreak: 'break-all'},
        '& small': {color: colors.textSubtle, fontSize: rem(11), lineHeight: 1.3},
    },
    cellEmpty: {background: 'transparent', borderStyle: 'dashed', '& b': {color: colors.textSubtle}},
    list: {display: 'flex', flexDirection: 'column', gap: rem(8), '& li': {color: colors.textMuted, lineHeight: 1.6}, '& b': {color: colors.text}},
    lines: {display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 260px), 1fr))', gap: rem(10)},
    line: {
        padding: [rem(10), rem(12)],
        borderRadius: rem(10),
        border: `1px solid ${colors.borderSoft}`,
        display: 'flex',
        flexDirection: 'column',
        gap: rem(4),
        '& b': {color: colors.text},
        '& span': {color: colors.textMuted, fontSize: rem(sizes.small + 1), lineHeight: 1.5},
    },
    count: {color: colors.gold, fontWeight: sizes.weight600},
    note: {color: colors.textSubtle, fontSize: rem(sizes.small)},
};

// @ts-ignore
export const usePsychomatrixStyles = createUseStyles(styles);
