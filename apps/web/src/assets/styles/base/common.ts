import colors from '../abstracts/color';
import sizes from '../abstracts/sizes';
import {rem} from '../abstracts/functions';
import {breakpoint} from '../abstracts/mixins';

const common = {
    '@global': {
        ':focus-visible': {
            outline: `2px solid ${colors.gold}`,
            outlineOffset: 3,
            borderRadius: 4,
        },
        '.container': {
            width: '100%',
            maxWidth: rem(sizes.container),
            margin: '0 auto',
            padding: [0, rem(sizes.gutter)],
            [breakpoint(sizes.breakpoint)]: {
                padding: [0, rem(16)],
            },
        },
        '.sr-only': {
            position: 'absolute',
            width: 1,
            height: 1,
            padding: 0,
            margin: -1,
            overflow: 'hidden',
            clip: 'rect(0, 0, 0, 0)',
            whiteSpace: 'nowrap',
            border: 0,
        },
        '.skip-link': {
            position: 'absolute',
            left: rem(16),
            top: -100,
            zIndex: 1000,
            padding: [rem(10), rem(16)],
            background: colors.gold,
            color: colors.onGold,
            borderRadius: 8,
            '&:focus': {top: rem(16)},
        },
        '.glyph': {
            fontFamily: '"Noto Sans Symbols", "Segoe UI Symbol", "DejaVu Sans", sans-serif',
            fontVariantEmoji: 'text',
        },
        '.Toastify__toast': {
            background: colors.surfaceRaised,
            color: colors.text,
            border: `1px solid ${colors.border}`,
        },
    },
};

export default common;
