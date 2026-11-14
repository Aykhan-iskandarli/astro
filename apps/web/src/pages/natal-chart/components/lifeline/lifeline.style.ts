import {createUseStyles} from 'react-jss';
import colors from 'assets/styles/abstracts/color';
import sizes from 'assets/styles/abstracts/sizes';
import {rem} from 'assets/styles/abstracts/functions';
import {breakpoint} from 'assets/styles/abstracts/mixins';

const seg = (hex: string) => ({
    background: `${hex}2E`,
    borderColor: `${hex}88`,
    '&:hover, &:focus-visible': {background: `${hex}55`},
});

const styles = {
    wrap: {
        display: 'flex',
        flexDirection: 'column',
        gap: rem(20),
        transition: 'opacity .2s',
    },
    busy: {opacity: 0.6},
    head: {
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        gap: rem(12),
        '& h3': {fontSize: rem(22), marginBottom: rem(4)},
    },
    muted: {color: colors.textMuted},
    chart: {
        display: 'flex',
        flexDirection: 'column',
        gap: rem(10),
    },
    row: {
        display: 'grid',
        gridTemplateColumns: `${rem(110)} 1fr`,
        alignItems: 'center',
        gap: rem(12),
        [breakpoint(sizes.breakpointSm)]: {gridTemplateColumns: '1fr', gap: rem(4)},
    },
    who: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: rem(8),
        '& .glyph': {color: colors.gold, fontSize: rem(18)},
    },
    bar: {
        display: 'flex',
        height: rem(46),
        borderRadius: rem(10),
        overflow: 'hidden',
        border: `1px solid ${colors.borderSoft}`,
        gap: 1,
        background: colors.borderSoft,
    },
    seg: {
        flexBasis: 0,
        minWidth: 2,
        padding: 0,
        border: 'none',
        borderLeft: '1px solid transparent',
        color: colors.text,
        cursor: 'pointer',
        font: 'inherit',
        overflow: 'hidden',
        background: 'rgba(28,28,56,0.7)',
        '&:focus-visible': {outline: `2px solid ${colors.gold}`, outlineOffset: -2},
    },
    segText: {
        fontSize: rem(14),
        fontVariantNumeric: 'tabular-nums',
        '& .glyph': {color: colors.gold},
    },
    segOn: {
        boxShadow: `inset 0 0 0 2px ${colors.gold}`,
    },
    fire: seg(colors.fire),
    earth: seg(colors.earth),
    air: seg(colors.air),
    water: seg(colors.water),
    axis: {
        position: 'relative',
        height: rem(18),
        marginLeft: rem(122),
        color: colors.textMuted,
        fontSize: rem(13),
        fontVariantNumeric: 'tabular-nums',
        [breakpoint(sizes.breakpointSm)]: {marginLeft: 0},
    },
    axisLabel: {position: 'absolute', top: 0, transform: 'translateX(-50%)', '&:first-child': {transform: 'none'}},
    card: {
        display: 'flex',
        flexDirection: 'column',
        gap: rem(6),
        padding: rem(20),
        borderRadius: rem(16),
        border: `1px solid ${colors.borderSoft}`,
        background: 'linear-gradient(170deg, rgba(28,28,56,0.75), rgba(11,11,30,0.55))',
        '& h4': {fontSize: rem(20), '& .glyph': {color: colors.gold}},
        '& p': {lineHeight: 1.6},
    },
    range: {color: colors.gold, fontVariantNumeric: 'tabular-nums'},
    theme: {color: colors.textMuted, fontSize: rem(14)},
    details: {
        '& summary': {cursor: 'pointer', color: colors.gold, minHeight: rem(sizes.touch), display: 'flex', alignItems: 'center'},
    },
    signs: {
        listStyle: 'none',
        margin: 0,
        padding: 0,
        display: 'flex',
        flexDirection: 'column',
        gap: rem(8),
        lineHeight: 1.6,
        '& .glyph': {color: colors.gold},
    },
};

// @ts-ignore
export const useLifelineStyles = createUseStyles(styles);
