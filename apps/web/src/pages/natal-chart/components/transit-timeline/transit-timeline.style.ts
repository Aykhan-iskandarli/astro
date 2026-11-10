import {createUseStyles} from 'react-jss';
import colors from 'assets/styles/abstracts/color';
import sizes from 'assets/styles/abstracts/sizes';
import {rem} from 'assets/styles/abstracts/functions';
import {breakpoint} from 'assets/styles/abstracts/mixins';

const styles = {
    wrap: {
        display: 'flex',
        flexDirection: 'column',
        gap: rem(20),
        transition: 'opacity .2s',
    },
    busy: {opacity: 0.6},
    retry: {alignSelf: 'flex-start'},
    muted: {color: colors.textMuted},
    month: {
        display: 'flex',
        flexDirection: 'column',
        gap: rem(8),
        '& h3': {fontSize: rem(20)},
    },
    list: {
        listStyle: 'none',
        margin: 0,
        padding: 0,
        borderTop: `1px solid ${colors.borderSoft}`,
    },
    item: {
        display: 'grid',
        gridTemplateColumns: `${rem(110)} ${rem(28)} 1fr`,
        gap: rem(12),
        alignItems: 'start',
        padding: [rem(14), 0],
        borderBottom: `1px solid ${colors.borderSoft}`,
        '& .glyph': {color: colors.gold},
        [breakpoint(sizes.breakpointSm)]: {gridTemplateColumns: `${rem(28)} 1fr`, '& time': {gridColumn: '1 / -1'}},
    },
    when: {
        color: colors.gold,
        fontVariantNumeric: 'tabular-nums',
    },
    aspect: {
        fontSize: rem(20),
        textAlign: 'center',
    },
    harmonious: {color: `${colors.harmonious} !important`},
    tense: {color: `${colors.tense} !important`},
    neutral: {color: `${colors.neutral} !important`},
    minor: {color: `${colors.minor} !important`},
    text: {
        marginTop: rem(6),
        color: colors.textMuted,
        lineHeight: 1.6,
    },
};

// @ts-ignore
export const useTransitTimelineStyles = createUseStyles(styles);
