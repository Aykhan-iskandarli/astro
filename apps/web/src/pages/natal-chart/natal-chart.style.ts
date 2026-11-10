import {createUseStyles} from 'react-jss';
import colors from 'assets/styles/abstracts/color';
import sizes from 'assets/styles/abstracts/sizes';
import {rem} from 'assets/styles/abstracts/functions';
import {breakpoint} from 'assets/styles/abstracts/mixins';

const styles = {
    page: {
        paddingTop: rem(120),
        paddingBottom: rem(96),
        [breakpoint(sizes.breakpoint)]: {paddingTop: rem(96)},
    },
    formCard: {
        maxWidth: rem(560),
        margin: '0 auto',
        padding: rem(40),
        borderRadius: rem(24),
        border: `1px solid ${colors.borderSoft}`,
        background: 'linear-gradient(170deg, rgba(28,28,56,0.85), rgba(11,11,30,0.7))',
        boxShadow: '0 30px 80px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.04)',
        [breakpoint(sizes.breakpointSm)]: {padding: rem(24)},
    },
    formHead: {
        marginBottom: rem(28),
        '& h1': {fontSize: rem(40), marginBottom: rem(8)},
        '& p': {color: colors.textMuted},
    },
    resultWrap: {},
};

// @ts-ignore
export const useNatalChartStyles = createUseStyles(styles);
