import {createUseStyles} from 'react-jss';
import colors from 'assets/styles/abstracts/color';
import sizes from 'assets/styles/abstracts/sizes';
import {rem} from 'assets/styles/abstracts/functions';
import {breakpoint} from 'assets/styles/abstracts/mixins';

const card = {
    padding: rem(24),
    borderRadius: rem(sizes.radius),
    border: `1px solid ${colors.borderSoft}`,
    background: 'linear-gradient(170deg, rgba(28,28,56,0.8), rgba(11,11,30,0.5))',
    display: 'flex',
    flexDirection: 'column',
    gap: rem(10),
};

const styles = {
    wrapper: {display: 'flex', flexDirection: 'column', gap: rem(40)},
    head: {
        display: 'flex',
        flexDirection: 'column',
        gap: rem(8),
        '& h2': {fontSize: rem(34)},
        '& p': {color: colors.textMuted, maxWidth: rem(780), lineHeight: 1.7},
    },
    section: {display: 'flex', flexDirection: 'column', gap: rem(16), '& > h3': {fontSize: rem(26)}},
    axis: {
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1fr) auto minmax(0, 1fr)',
        gap: rem(16),
        alignItems: 'stretch',
        [breakpoint(sizes.breakpoint)]: {gridTemplateColumns: '1fr'},
    },
    arrow: {
        alignSelf: 'center',
        fontSize: rem(30),
        color: colors.gold,
        [breakpoint(sizes.breakpoint)]: {justifySelf: 'center', transform: 'rotate(90deg)'},
    },
    card,
    cardFuture: {...card, borderColor: 'rgba(226,194,117,0.45)'},
    eyebrow: {color: colors.gold, fontSize: rem(sizes.small), letterSpacing: '0.14em', textTransform: 'uppercase'},
    pointHead: {
        display: 'flex',
        alignItems: 'center',
        gap: rem(12),
        '& h4': {fontSize: rem(22)},
    },
    glyph: {
        width: rem(44),
        height: rem(44),
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '50%',
        border: `1px solid ${colors.border}`,
        color: colors.gold,
        fontSize: rem(22),
    },
    position: {color: colors.textMuted, fontSize: rem(sizes.small), '& .glyph': {color: colors.gold}},
    text: {color: colors.text, lineHeight: 1.7},
    muted: {color: colors.textMuted, lineHeight: 1.7},
    advice: {
        ...card,
        flexDirection: 'row',
        alignItems: 'baseline',
        gap: rem(10),
        background: 'rgba(226,194,117,0.08)',
        borderColor: 'rgba(226,194,117,0.35)',
        '& strong': {color: colors.gold, whiteSpace: 'nowrap'},
    },
    contacts: {display: 'flex', flexDirection: 'column', gap: rem(10)},
    contact: {
        display: 'grid',
        gridTemplateColumns: 'auto 1fr',
        gap: rem(12),
        alignItems: 'baseline',
        padding: [rem(12), rem(14)],
        borderRadius: rem(10),
        border: `1px solid ${colors.borderSoft}`,
        '& .glyph': {color: colors.gold, fontSize: rem(18), width: rem(22), textAlign: 'center'},
    },
    contactTitle: {fontWeight: sizes.weight600, '& span': {color: colors.textMuted, fontWeight: sizes.weight400}},
    pair: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 340px), 1fr))',
        gap: rem(16),
    },
    note: {color: colors.textSubtle, fontSize: rem(sizes.small), lineHeight: 1.6},
};

// @ts-ignore
export const useKarmicPanelStyles = createUseStyles(styles);
