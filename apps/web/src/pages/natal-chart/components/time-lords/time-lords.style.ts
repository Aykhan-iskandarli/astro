import {createUseStyles} from 'react-jss';
import colors from 'assets/styles/abstracts/color';
import sizes from 'assets/styles/abstracts/sizes';
import fonts from 'assets/styles/abstracts/fonts';
import {rem} from 'assets/styles/abstracts/functions';
import {breakpoint} from 'assets/styles/abstracts/mixins';

const styles = {
    wrap: {
        display: 'flex',
        flexDirection: 'column',
        gap: rem(24),
        transition: 'opacity .2s',
    },
    busy: {opacity: 0.6},
    muted: {color: colors.textMuted},
    control: {
        display: 'inline-flex',
        flexDirection: 'column',
        gap: rem(6),
        alignSelf: 'flex-start',
        color: colors.textMuted,
    },
    cards: {
        display: 'grid',
        gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
        gap: rem(16),
        [breakpoint(sizes.breakpointLg)]: {gridTemplateColumns: '1fr'},
    },
    card: {
        display: 'flex',
        flexDirection: 'column',
        gap: rem(8),
        padding: rem(20),
        borderRadius: rem(18),
        border: `1px solid ${colors.borderSoft}`,
        background: 'linear-gradient(170deg, rgba(28,28,56,0.8), rgba(11,11,30,0.6))',
        '& h3': {fontSize: rem(22), '& .glyph': {color: colors.gold}},
        '& p': {lineHeight: 1.6},
    },
    eyebrow: {
        color: colors.gold,
        fontSize: rem(sizes.small),
        letterSpacing: '0.12em',
        textTransform: 'uppercase',
    },
    big: {
        fontFamily: fonts.heading,
        fontSize: rem(18),
        '& .glyph': {color: colors.gold},
    },
    section: {
        display: 'flex',
        flexDirection: 'column',
        gap: rem(12),
        '& > h3': {fontSize: rem(20)},
    },
    timeline: {
        display: 'flex',
        width: '100%',
        minHeight: rem(48),
        borderRadius: rem(12),
        overflow: 'hidden',
        border: `1px solid ${colors.borderSoft}`,
    },
    segment: {
        flexBasis: 0,
        minWidth: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: rem(2),
        padding: [rem(6), rem(2)],
        borderRight: `1px solid ${colors.borderSoft}`,
        background: 'rgba(28,28,56,0.4)',
        color: colors.textMuted,
        fontSize: rem(13),
        '&:last-child': {borderRight: 'none'},
        '& .glyph': {color: colors.gold, fontSize: rem(16)},
    },
    segmentCurrent: {
        background: 'rgba(226,194,117,0.18)',
        color: colors.text,
        boxShadow: `inset 0 0 0 1px ${colors.gold}`,
    },
    segAge: {
        fontVariantNumeric: 'tabular-nums',
        [breakpoint(sizes.breakpointSm)]: {display: 'none'},
    },
    years: {
        listStyle: 'none',
        margin: 0,
        padding: 0,
        borderTop: `1px solid ${colors.borderSoft}`,
    },
    yearItem: {
        display: 'grid',
        gridTemplateColumns: `${rem(44)} repeat(3, minmax(0, 1fr))`,
        gap: rem(12),
        alignItems: 'center',
        padding: [rem(10), rem(8)],
        borderBottom: `1px solid ${colors.borderSoft}`,
        '& .glyph': {color: colors.gold},
        [breakpoint(sizes.breakpointSm)]: {gridTemplateColumns: `${rem(36)} 1fr 1fr`, '& > span:nth-child(2)': {display: 'none'}},
    },
    yearCurrent: {
        background: 'rgba(226,194,117,0.1)',
        borderRadius: rem(8),
    },
    yearAge: {
        fontVariantNumeric: 'tabular-nums',
        color: colors.gold,
        fontWeight: 600,
    },
    aspects: {
        listStyle: 'none',
        margin: 0,
        padding: 0,
        display: 'flex',
        flexDirection: 'column',
        gap: rem(12),
        '& li': {display: 'flex', gap: rem(12)},
        '& .glyph': {color: colors.gold},
    },
    aspGlyph: {fontSize: rem(20), minWidth: rem(24), textAlign: 'center'},
    harmonious: {color: `${colors.harmonious} !important`},
    tense: {color: `${colors.tense} !important`},
    neutral: {color: `${colors.neutral} !important`},
    minor: {color: `${colors.minor} !important`},
    details: {
        '& summary': {cursor: 'pointer', color: colors.gold, minHeight: rem(sizes.touch), display: 'flex', alignItems: 'center'},
    },
    directed: {
        listStyle: 'none',
        margin: 0,
        padding: 0,
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 240px), 1fr))',
        gap: rem(6),
        '& .glyph': {color: colors.gold},
    },
};

// @ts-ignore
export const useTimeLordsStyles = createUseStyles(styles);
