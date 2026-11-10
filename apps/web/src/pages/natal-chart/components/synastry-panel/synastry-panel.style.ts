import {createUseStyles} from 'react-jss';
import colors from 'assets/styles/abstracts/color';
import fonts from 'assets/styles/abstracts/fonts';
import sizes from 'assets/styles/abstracts/sizes';
import {rem} from 'assets/styles/abstracts/functions';
import {breakpoint} from 'assets/styles/abstracts/mixins';
import {panelStyles} from '../transits-panel/transits-panel.style';

const styles = {
    ...panelStyles,
    formCard: {
        maxWidth: rem(560),
        width: '100%',
        padding: rem(32),
        borderRadius: rem(20),
        border: `1px solid ${colors.borderSoft}`,
        background: 'linear-gradient(170deg, rgba(28,28,56,0.85), rgba(11,11,30,0.7))',
        '& > h3': {fontSize: rem(24), marginBottom: rem(20)},
        [breakpoint(sizes.breakpointSm)]: {padding: rem(20)},
    },
    score: {
        display: 'flex',
        gap: rem(32),
        alignItems: 'flex-start',
        padding: rem(28),
        borderRadius: rem(20),
        border: `1px solid ${colors.goldDeep}`,
        background: 'linear-gradient(160deg, rgba(226,194,117,0.10), rgba(20,20,43,0.8))',
        '& h3': {fontSize: rem(26), marginBottom: rem(4)},
        [breakpoint(sizes.breakpoint)]: {flexDirection: 'column', gap: rem(16)},
    },
    scoreValue: {
        width: rem(112),
        height: rem(112),
        flexShrink: 0,
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: fonts.heading,
        fontSize: rem(48),
        color: colors.onGold,
        background: `radial-gradient(circle at 35% 35%, #FFF6DD, ${colors.gold} 55%, ${colors.goldDeep})`,
        boxShadow: '0 0 40px rgba(226,194,117,0.3)',
    },
    rules: {
        margin: [rem(16), 0, rem(12)],
        display: 'flex',
        flexDirection: 'column',
        gap: rem(6),
        maxWidth: rem(520),
        '& li': {
            display: 'flex',
            justifyContent: 'space-between',
            gap: rem(16),
            padding: [rem(6), 0],
            borderBottom: `1px solid ${colors.borderSoft}`,
            cursor: 'help',
        },
        '& b': {color: colors.gold},
    },
    overlays: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: rem(24),
        [breakpoint(sizes.breakpoint)]: {gridTemplateColumns: '1fr'},
    },
    overlay: {
        padding: rem(20),
        borderRadius: rem(16),
        border: `1px solid ${colors.borderSoft}`,
        background: colors.surface,
        '& h4': {fontSize: rem(18), marginBottom: rem(12), fontFamily: fonts.heading, fontWeight: 500},
        '& li': {
            display: 'grid',
            gridTemplateColumns: `${rem(22)} 1fr auto`,
            gap: rem(8),
            padding: [rem(5), 0],
            borderBottom: `1px solid ${colors.borderSoft}`,
            fontSize: rem(sizes.small),
        },
        '& .glyph': {color: colors.gold},
    },
    elements: {
        display: 'flex',
        flexDirection: 'column',
        gap: rem(12),
        maxWidth: rem(720),
    },
    elementRow: {
        display: 'grid',
        gridTemplateColumns: `${rem(90)} 1fr 1fr`,
        gap: rem(16),
        alignItems: 'center',
        fontSize: rem(sizes.small),
        [breakpoint(sizes.breakpointSm)]: {gridTemplateColumns: '1fr', gap: rem(4)},
    },
    bar: {
        display: 'flex',
        flexDirection: 'column',
        gap: rem(4),
        '& > span': {display: 'block', height: 6, borderRadius: 3, maxWidth: '100%'},
        '& small': {color: colors.textMuted},
    },
};

// @ts-ignore
export const useSynastryPanelStyles = createUseStyles(styles);
