import {createUseStyles} from 'react-jss';
import colors from 'assets/styles/abstracts/color';
import sizes from 'assets/styles/abstracts/sizes';
import fonts from 'assets/styles/abstracts/fonts';
import {rem} from 'assets/styles/abstracts/functions';
import {breakpoint} from 'assets/styles/abstracts/mixins';

const card = {
    padding: rem(24),
    borderRadius: rem(20),
    border: `1px solid ${colors.borderSoft}`,
    background: 'linear-gradient(170deg, rgba(28,28,56,0.75), rgba(11,11,30,0.6))',
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
};

export const skyStyles = {
    stage: {
        position: 'relative',
        isolation: 'isolate',
        overflow: 'hidden',
        minHeight: '100svh',
    },
    backdrop: {
        position: 'absolute',
        inset: 0,
        height: '110svh',
        zIndex: -1,
        pointerEvents: 'none',
        maskImage: 'linear-gradient(to bottom, #000 60%, transparent)',
        WebkitMaskImage: 'linear-gradient(to bottom, #000 60%, transparent)',
    },
    page: {
        paddingTop: rem(120),
        paddingBottom: rem(96),
        display: 'flex',
        flexDirection: 'column',
        gap: rem(40),
        [breakpoint(sizes.breakpoint)]: {paddingTop: rem(96)},
    },
    head: {
        display: 'flex',
        flexDirection: 'column',
        gap: rem(6),
        '& h1': {fontSize: 'clamp(2.2rem, 5vw, 3.4rem)'},
    },
    eyebrow: {
        color: colors.gold,
        fontSize: rem(sizes.small),
        letterSpacing: '0.18em',
        textTransform: 'uppercase',
    },
    muted: {
        color: colors.textMuted,
    },
    hero: {
        ...card,
        display: 'grid',
        gridTemplateColumns: 'auto 1fr',
        gap: rem(40),
        alignItems: 'center',
        [breakpoint(sizes.breakpoint)]: {gridTemplateColumns: '1fr', justifyItems: 'center', gap: rem(24)},
    },
    moonArt: {
        padding: rem(8),
    },
    moonInfo: {
        display: 'flex',
        flexDirection: 'column',
        gap: rem(8),
        '& h2': {fontSize: rem(32)},
    },
    big: {
        fontFamily: fonts.heading,
        fontSize: rem(22),
        '& .glyph': {color: colors.gold},
    },
    voc: {
        marginTop: rem(12),
        padding: rem(16),
        borderRadius: rem(14),
        border: `1px solid ${colors.borderSoft}`,
        background: 'rgba(11,11,30,0.5)',
        display: 'flex',
        flexDirection: 'column',
        gap: rem(4),
        '& strong': {color: colors.gold},
    },
    vocActive: {
        borderColor: 'rgba(242,139,139,0.5)',
        '& strong': {color: colors.tense},
    },
    section: {
        display: 'flex',
        flexDirection: 'column',
        gap: rem(16),
        '& > h2': {fontSize: rem(24)},
        '& > a': {alignSelf: 'flex-start'},
    },
    chips: {
        listStyle: 'none',
        margin: 0,
        padding: 0,
        display: 'flex',
        flexWrap: 'wrap',
        gap: rem(8),
    },
    chip: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: rem(6),
        padding: [rem(8), rem(14)],
        borderRadius: rem(999),
        border: `1px solid ${colors.border}`,
        background: 'rgba(28,28,56,0.6)',
        '& .glyph': {color: colors.gold},
    },
    planets: {
        listStyle: 'none',
        margin: 0,
        padding: 0,
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 260px), 1fr))',
        gap: rem(8),
    },
    planet: {
        display: 'grid',
        gridTemplateColumns: `${rem(28)} 1fr auto`,
        alignItems: 'center',
        gap: rem(10),
        padding: [rem(12), rem(16)],
        borderRadius: rem(12),
        border: `1px solid ${colors.borderSoft}`,
        background: 'rgba(28,28,56,0.4)',
    },
    planetGlyph: {
        color: colors.gold,
        fontSize: rem(20),
        textAlign: 'center',
    },
    planetName: {
        fontWeight: 500,
    },
    planetPos: {
        color: colors.textMuted,
        fontVariantNumeric: 'tabular-nums',
        whiteSpace: 'nowrap',
    },
    events: {
        listStyle: 'none',
        margin: 0,
        padding: 0,
        display: 'flex',
        flexDirection: 'column',
        borderTop: `1px solid ${colors.borderSoft}`,
    },
    event: {
        display: 'grid',
        gridTemplateColumns: `${rem(170)} 1fr`,
        gap: rem(16),
        padding: [rem(12), 0],
        borderBottom: `1px solid ${colors.borderSoft}`,
        [breakpoint(sizes.breakpointSm)]: {gridTemplateColumns: '1fr', gap: rem(2)},
    },
    when: {
        color: colors.gold,
        fontVariantNumeric: 'tabular-nums',
    },
};

// @ts-ignore
export const useSkyStyles = createUseStyles(skyStyles);
