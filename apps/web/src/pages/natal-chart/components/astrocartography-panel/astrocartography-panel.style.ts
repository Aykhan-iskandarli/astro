import {createUseStyles} from 'react-jss';
import colors from 'assets/styles/abstracts/color';
import sizes from 'assets/styles/abstracts/sizes';
import {rem} from 'assets/styles/abstracts/functions';
import {breakpoint, transition} from 'assets/styles/abstracts/mixins';

const card = {
    padding: rem(20),
    borderRadius: rem(16),
    border: `1px solid ${colors.borderSoft}`,
    background: 'rgba(28,28,56,0.45)',
};

const styles = {
    wrap: {
        display: 'flex',
        flexDirection: 'column',
        gap: rem(20),
        transition: 'opacity .2s',
    },
    busy: {opacity: 0.7},
    head: {
        '& h2': {fontSize: rem(28), marginBottom: rem(6)},
    },
    muted: {color: colors.textMuted},
    toggles: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: rem(8),
    },
    toggle: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: rem(6),
        minHeight: rem(sizes.touch),
        padding: [0, rem(14)],
        borderRadius: 999,
        border: `1px solid ${colors.border}`,
        background: 'transparent',
        color: colors.textMuted,
        cursor: 'pointer',
        font: 'inherit',
        transition: transition('color, border-color, background', 0.2),
        '& .glyph': {color: 'var(--c)'},
        '&[aria-pressed="true"]': {
            color: colors.text,
            borderColor: 'var(--c)',
            background: 'rgba(28,28,56,0.7)',
        },
        '&:focus-visible': {outline: `2px solid ${colors.gold}`, outlineOffset: 2},
    },
    legend: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: rem(18),
        color: colors.textMuted,
        fontSize: rem(14),
        '& span': {display: 'inline-flex', alignItems: 'center', gap: rem(8)},
    },
    mapScroll: {
        overflowX: 'auto',
        borderRadius: rem(16),
        border: `1px solid ${colors.borderSoft}`,
    },
    map: {
        display: 'block',
        width: '100%',
        minWidth: rem(720),
        height: 'auto',
        [breakpoint(sizes.breakpointSm)]: {minWidth: rem(640)},
    },
    ocean: {fill: '#0E0E26'},
    graticule: {fill: 'none', stroke: 'rgba(157,140,255,0.08)', strokeWidth: 0.5},
    land: {fill: '#1E1D40', stroke: 'rgba(157,140,255,0.25)', strokeWidth: 0.5},
    line: {
        cursor: 'pointer',
        outline: 'none',
        transition: transition('opacity', 0.2),
    },
    dim: {opacity: 0.2},
    hit: {fill: 'none', stroke: 'transparent', strokeWidth: 12},
    stroke: {fill: 'none', strokeWidth: 1.6, strokeLinecap: 'round'},
    strokeActive: {strokeWidth: 3},
    label: {
        fontSize: 11,
        fontWeight: 600,
        paintOrder: 'stroke',
        stroke: '#0E0E26',
        strokeWidth: 3,
        pointerEvents: 'none',
    },
    birth: {fill: colors.gold, stroke: '#0E0E26', strokeWidth: 1.5},
    probe: {fill: 'none', stroke: colors.text, strokeWidth: 2},
    grid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
        gap: rem(16),
        alignItems: 'start',
        [breakpoint(sizes.breakpoint)]: {gridTemplateColumns: '1fr'},
    },
    card: {
        ...card,
        display: 'flex',
        flexDirection: 'column',
        gap: rem(10),
        '& h3': {fontSize: rem(18)},
        '& p': {lineHeight: 1.6},
    },
    place: {width: '100%'},
    near: {
        listStyle: 'none',
        margin: 0,
        padding: 0,
        display: 'flex',
        flexDirection: 'column',
    },
    nearBtn: {
        width: '100%',
        display: 'grid',
        gridTemplateColumns: `${rem(22)} 1fr auto`,
        alignItems: 'center',
        gap: rem(8),
        minHeight: rem(sizes.touch),
        padding: [0, rem(8)],
        border: 'none',
        borderBottom: `1px solid ${colors.borderSoft}`,
        background: 'transparent',
        color: colors.text,
        textAlign: 'left',
        cursor: 'pointer',
        font: 'inherit',
        '&:hover, &:focus-visible': {background: 'rgba(157,140,255,0.08)'},
    },
};

// @ts-ignore
export const useAstrocartographyPanelStyles = createUseStyles(styles);
