import {createUseStyles} from 'react-jss';
import colors from 'assets/styles/abstracts/color';
import fonts from 'assets/styles/abstracts/fonts';
import sizes from 'assets/styles/abstracts/sizes';
import {rem} from 'assets/styles/abstracts/functions';
import {transition} from 'assets/styles/abstracts/mixins';

const styles = {
    wrapper: {display: 'flex', flexDirection: 'column', gap: rem(32)},
    head: {
        '& h2': {fontSize: rem(36), marginBottom: rem(8)},
        '& p': {color: colors.textMuted},
    },
    nameRow: {
        display: 'flex',
        flexDirection: 'column',
        gap: rem(8),
        maxWidth: rem(560),
        '& label': {color: colors.textMuted, fontSize: rem(sizes.small)},
    },
    body: {display: 'flex', flexDirection: 'column', gap: rem(32), transition: transition('opacity', 0.3)},
    busy: {opacity: 0.6},
    grid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: rem(16),
    },
    card: {
        display: 'flex',
        flexDirection: 'column',
        gap: rem(10),
        padding: rem(22),
        borderRadius: rem(18),
        border: `1px solid ${colors.borderSoft}`,
        background: 'linear-gradient(165deg, rgba(28,28,56,0.85), rgba(11,11,30,0.6))',
        '& p': {lineHeight: 1.6},
    },
    cardMain: {
        borderColor: colors.goldDeep,
        background: 'linear-gradient(160deg, rgba(226,194,117,0.12), rgba(20,20,43,0.85))',
    },
    cardEmpty: {opacity: 0.55},
    cardHead: {
        display: 'flex',
        gap: rem(14),
        alignItems: 'center',
        '& h3': {fontSize: rem(22)},
    },
    number: {
        minWidth: rem(56),
        height: rem(56),
        padding: [0, rem(6)],
        borderRadius: rem(28),
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: fonts.heading,
        fontSize: rem(28),
        color: colors.onGold,
        background: `radial-gradient(circle at 35% 35%, #FFF6DD, ${colors.gold} 55%, ${colors.goldDeep})`,
        flexShrink: 0,
    },
    title: {fontWeight: sizes.weight600},
    muted: {color: colors.textMuted, fontSize: rem(sizes.small), fontWeight: sizes.weight400},
    tags: {display: 'flex', flexWrap: 'wrap', gap: rem(6)},
    tag: {
        padding: [rem(2), rem(10)],
        borderRadius: 999,
        border: `1px solid ${colors.border}`,
        color: colors.textMuted,
        fontSize: rem(12),
    },
    tagGold: {borderColor: colors.gold, color: colors.gold},
    tagDebt: {borderColor: colors.tense, color: colors.tense, cursor: 'help'},
    section: {
        display: 'flex',
        flexDirection: 'column',
        gap: rem(12),
        '& h3': {fontSize: rem(24)},
    },
    letters: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: rem(6),
        '& li': {
            width: rem(44),
            padding: [rem(6), 0],
            borderRadius: rem(10),
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            background: colors.surface,
            border: `1px solid ${colors.borderSoft}`,
            '& span': {fontSize: rem(15)},
            '& b': {fontSize: rem(13), color: colors.textMuted},
        },
    },
    vowel: {
        borderColor: `${colors.violet} !important`,
        '& b': {color: `${colors.violet} !important`},
    },
    note: {color: colors.textSubtle, fontSize: rem(sizes.small)},
};

// @ts-ignore
export const useNumerologyPanelStyles = createUseStyles(styles);
