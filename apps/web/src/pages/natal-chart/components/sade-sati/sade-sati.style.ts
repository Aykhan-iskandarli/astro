import {createUseStyles} from 'react-jss';
import colors from 'assets/styles/abstracts/color';
import sizes from 'assets/styles/abstracts/sizes';
import {rem} from 'assets/styles/abstracts/functions';

const styles = {
    section: {display: 'flex', flexDirection: 'column', gap: rem(16), '& > h3': {fontSize: rem(24)}},
    muted: {color: colors.textMuted, lineHeight: 1.7, maxWidth: rem(780)},
    list: {display: 'flex', flexDirection: 'column', gap: rem(14)},
    period: {
        padding: rem(20),
        borderRadius: rem(sizes.radius),
        border: `1px solid ${colors.borderSoft}`,
        background: 'linear-gradient(170deg, rgba(28,28,56,0.75), rgba(11,11,30,0.45))',
        display: 'flex',
        flexDirection: 'column',
        gap: rem(12),
    },
    periodNow: {borderColor: 'rgba(226,194,117,0.55)'},
    periodPast: {opacity: 0.65},
    head: {display: 'flex', flexWrap: 'wrap', alignItems: 'baseline', gap: rem(10), '& strong': {fontSize: rem(18)}},
    badge: {
        fontSize: rem(12),
        padding: [rem(2), rem(8)],
        borderRadius: rem(999),
        border: `1px solid ${colors.borderSoft}`,
        color: colors.textMuted,
    },
    badgeNow: {color: colors.gold, borderColor: 'rgba(226,194,117,0.5)'},
    phases: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))',
        gap: rem(10),
    },
    phase: {
        padding: [rem(10), rem(12)],
        borderRadius: rem(10),
        border: `1px solid ${colors.borderSoft}`,
        display: 'flex',
        flexDirection: 'column',
        gap: rem(4),
        '& b': {color: colors.gold},
        '& .glyph': {color: colors.gold},
    },
    small: {color: colors.textSubtle, fontSize: rem(sizes.small), lineHeight: 1.5},
};

// @ts-ignore
export const useSadeSatiStyles = createUseStyles(styles);
