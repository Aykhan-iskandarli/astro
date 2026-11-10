import {createUseStyles} from 'react-jss';
import colors from 'assets/styles/abstracts/color';
import sizes from 'assets/styles/abstracts/sizes';
import {rem} from 'assets/styles/abstracts/functions';
import {breakpoint, transition} from 'assets/styles/abstracts/mixins';

// Shared by the transits and synastry panels
export const panelStyles = {
    wrapper: {
        display: 'flex',
        flexDirection: 'column',
        gap: rem(40),
    },
    head: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        gap: rem(24),
        flexWrap: 'wrap',
        '& h2': {fontSize: rem(36), marginBottom: rem(8)},
        '& p': {color: colors.textMuted, maxWidth: rem(560)},
    },
    stage: {
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 7fr) minmax(0, 5fr)',
        gap: rem(40),
        alignItems: 'start',
        transition: transition('opacity', 0.3),
        [breakpoint(sizes.breakpointLg)]: {gridTemplateColumns: '1fr'},
    },
    busy: {opacity: 0.6},
    side: {
        position: 'sticky',
        top: rem(96),
        maxHeight: 'calc(100vh - 128px)',
        overflowY: 'auto',
        overscrollBehavior: 'contain',
        padding: rem(24),
        borderRadius: rem(sizes.radius),
        border: `1px solid ${colors.borderSoft}`,
        background: 'linear-gradient(170deg, rgba(28,28,56,0.9), rgba(11,11,30,0.6))',
        '& h3': {fontSize: rem(22), marginBottom: rem(16)},
        [breakpoint(sizes.breakpointLg)]: {position: 'static', maxHeight: 'none'},
    },
    list: {
        display: 'flex',
        flexDirection: 'column',
        gap: rem(4),
        '& li': {
            display: 'flex',
            gap: rem(12),
            alignItems: 'flex-start',
            padding: rem(10),
            borderRadius: rem(10),
            fontSize: rem(sizes.small),
            cursor: 'default',
            outline: 'none',
            transition: transition('background', 0.2),
            '&:hover, &:focus-visible': {background: colors.surfaceRaised},
        },
    },
    itemActive: {background: colors.surfaceRaised},
    aspectGlyph: {fontSize: rem(18), width: rem(20), textAlign: 'center', lineHeight: 1.2},
    meta: {color: colors.textMuted},
    muted: {color: colors.textSubtle},
    note: {color: colors.textSubtle, fontSize: rem(sizes.small), marginTop: rem(16)},
    harmonious: {color: colors.harmonious},
    tense: {color: colors.tense},
    neutral: {color: colors.neutral},
    minor: {color: colors.minor},
    section: {
        display: 'flex',
        flexDirection: 'column',
        gap: rem(16),
        '& > h3': {fontSize: rem(26)},
        '& .ant-table': {background: 'transparent'},
        '& td': {whiteSpace: 'nowrap'},
    },
    cell: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: rem(8),
        '& .glyph': {color: colors.gold, width: rem(18), textAlign: 'center'},
    },
    retro: {color: colors.tense, textDecoration: 'none', fontWeight: 600, cursor: 'help'},
};

const styles = {
    ...panelStyles,
    controls: {
        display: 'flex',
        flexDirection: 'column',
        gap: rem(6),
    },
    label: {color: colors.textMuted, fontSize: rem(sizes.small)},
    controlRow: {display: 'flex', gap: rem(8), flexWrap: 'wrap'},
};

// @ts-ignore
export const useTransitsPanelStyles = createUseStyles(styles);
