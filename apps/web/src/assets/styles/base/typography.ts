import colors from '../abstracts/color';
import fonts from '../abstracts/fonts';
import sizes from '../abstracts/sizes';
import {rem} from '../abstracts/functions';
import {breakpoint} from '../abstracts/mixins';

const typography = {
    '@global': {
        html: {
            fontSize: '100%',
            scrollBehavior: 'smooth',
            '@media (prefers-reduced-motion: reduce)': {
                scrollBehavior: 'auto',
            },
        },
        body: {
            fontFamily: fonts.font,
            fontSize: rem(sizes.base),
            lineHeight: 1.6,
            color: colors.text,
            backgroundColor: colors.space,
            WebkitFontSmoothing: 'antialiased',
            overflowX: 'hidden',
        },
        'h1, h2, h3': {
            fontFamily: fonts.heading,
            fontWeight: sizes.weight500,
            lineHeight: 1.15,
            letterSpacing: '-0.01em',
            color: colors.text,
        },
        h1: {
            fontSize: rem(sizes.h1),
            [breakpoint(sizes.breakpoint)]: {fontSize: rem(36)},
        },
        h2: {
            fontSize: rem(sizes.h2),
            [breakpoint(sizes.breakpoint)]: {fontSize: rem(30)},
        },
        h3: {
            fontSize: rem(sizes.h3),
            [breakpoint(sizes.breakpoint)]: {fontSize: rem(22)},
        },
        a: {
            color: colors.gold,
            textUnderlineOffset: '0.2em',
        },
        '::selection': {
            background: colors.violetDeep,
            color: colors.white,
        },
    },
};

export default typography;
