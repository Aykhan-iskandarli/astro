import {createUseStyles} from 'react-jss';
import colors from 'assets/styles/abstracts/color';
import sizes from 'assets/styles/abstracts/sizes';
import fonts from 'assets/styles/abstracts/fonts';
import {rem} from 'assets/styles/abstracts/functions';
import {breakpoint} from 'assets/styles/abstracts/mixins';

const styles = {
    page: {
        paddingTop: rem(120),
        paddingBottom: rem(96),
        display: 'flex',
        flexDirection: 'column',
        gap: rem(24),
        maxWidth: rem(860),
        [breakpoint(sizes.breakpoint)]: {paddingTop: rem(96)},
    },
    head: {
        display: 'flex',
        flexDirection: 'column',
        gap: rem(8),
        '& h1': {fontSize: 'clamp(2.2rem, 5vw, 3.2rem)'},
    },
    muted: {color: colors.textMuted},
    search: {maxWidth: rem(420)},
    list: {
        margin: 0,
        display: 'flex',
        flexDirection: 'column',
        borderTop: `1px solid ${colors.borderSoft}`,
    },
    item: {
        scrollMarginTop: rem(96),
        padding: [rem(16), rem(8)],
        borderBottom: `1px solid ${colors.borderSoft}`,
        '& dt': {fontFamily: fonts.heading, fontSize: rem(20), color: colors.gold, marginBottom: rem(4)},
        '& dd': {margin: 0, lineHeight: 1.7},
    },
    target: {
        background: 'rgba(226,194,117,0.08)',
        borderRadius: rem(10),
    },
};

// @ts-ignore
export const useGlossaryStyles = createUseStyles(styles);
