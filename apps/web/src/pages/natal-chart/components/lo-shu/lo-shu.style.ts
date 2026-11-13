import {createUseStyles} from 'react-jss';
import colors from 'assets/styles/abstracts/color';
import sizes from 'assets/styles/abstracts/sizes';
import {rem} from 'assets/styles/abstracts/functions';
import {breakpoint} from 'assets/styles/abstracts/mixins';

const styles = {
    section: {display: 'flex', flexDirection: 'column', gap: rem(16), '& > h3': {fontSize: rem(24)}},
    lead: {color: colors.textMuted, lineHeight: 1.7, maxWidth: rem(780)},
    layout: {
        display: 'grid',
        gridTemplateColumns: 'auto minmax(0, 1fr)',
        gap: rem(24),
        alignItems: 'start',
        [breakpoint(sizes.breakpoint)]: {gridTemplateColumns: '1fr'},
    },
    grid: {
        display: 'grid',
        gridTemplateColumns: `repeat(3, ${rem(88)})`,
        gridTemplateRows: `repeat(3, ${rem(88)})`,
        gap: rem(6),
        justifySelf: 'start',
    },
    cell: {
        borderRadius: rem(10),
        border: `1px solid ${colors.borderSoft}`,
        background: 'rgba(28,28,56,0.6)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: rem(2),
        '& b': {color: colors.gold, fontSize: rem(22), letterSpacing: '0.08em'},
        '& small': {color: colors.textSubtle, fontSize: rem(11)},
    },
    cellEmpty: {background: 'transparent', borderStyle: 'dashed', '& b': {color: colors.textSubtle}},
    side: {display: 'flex', flexDirection: 'column', gap: rem(14)},
    subhead: {fontWeight: sizes.weight600},
    list: {display: 'flex', flexDirection: 'column', gap: rem(6), '& li': {color: colors.textMuted, lineHeight: 1.6}, '& b': {color: colors.text}},
    complete: {color: colors.harmonious},
    note: {color: colors.textSubtle, fontSize: rem(sizes.small)},
};

// @ts-ignore
export const useLoShuStyles = createUseStyles(styles);
