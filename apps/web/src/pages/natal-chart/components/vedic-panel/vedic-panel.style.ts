import {createUseStyles} from 'react-jss';
import colors from 'assets/styles/abstracts/color';
import sizes from 'assets/styles/abstracts/sizes';
import {rem} from 'assets/styles/abstracts/functions';
import {breakpoint, transition} from 'assets/styles/abstracts/mixins';

const styles = {
    wrapper: {display: 'flex', flexDirection: 'column', gap: rem(40)},
    head: {
        '& h2': {fontSize: rem(36), marginBottom: rem(8)},
        '& p': {color: colors.textMuted},
    },
    note: {fontSize: rem(sizes.small), color: `${colors.textSubtle} !important`, marginTop: rem(6)},
    charts: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: rem(32),
        justifyItems: 'center',
        [breakpoint(sizes.breakpoint)]: {gridTemplateColumns: '1fr'},
    },
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
    rowActive: {'& > td': {background: `${colors.surfaceRaised} !important`}},
    muted: {color: colors.textSubtle},
    retro: {color: colors.tense},
    dignity: {color: colors.violet},
    dashas: {display: 'flex', flexDirection: 'column', gap: rem(8)},
    dasha: {
        borderRadius: rem(12),
        border: `1px solid ${colors.borderSoft}`,
        background: colors.surface,
        overflow: 'hidden',
    },
    dashaCurrent: {borderColor: colors.goldDeep},
    dashaHead: {
        width: '100%',
        minHeight: rem(sizes.touch),
        display: 'flex',
        alignItems: 'center',
        gap: rem(12),
        flexWrap: 'wrap',
        padding: [rem(10), rem(16)],
        background: 'transparent',
        border: 'none',
        color: colors.text,
        cursor: 'pointer',
        textAlign: 'left',
        transition: transition('background', 0.2),
        '&:hover': {background: colors.surfaceRaised},
        '& .glyph': {color: colors.gold, fontSize: rem(18), width: rem(20)},
    },
    badge: {
        marginLeft: 'auto',
        padding: [rem(2), rem(10)],
        borderRadius: 999,
        background: colors.gold,
        color: colors.onGold,
        fontSize: rem(12),
        fontWeight: sizes.weight600,
    },
    dashaBody: {padding: [0, rem(16), rem(14)], overflow: 'hidden'},
    antar: {
        marginTop: rem(10),
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
        gap: rem(6),
        '& li': {
            display: 'flex',
            justifyContent: 'space-between',
            gap: rem(8),
            padding: [rem(6), rem(10)],
            borderRadius: rem(8),
            background: colors.surfaceRaised,
            fontSize: rem(sizes.small),
        },
    },
    antarCurrent: {outline: `2px solid ${colors.gold}`},
};

// @ts-ignore
export const useVedicPanelStyles = createUseStyles(styles);
