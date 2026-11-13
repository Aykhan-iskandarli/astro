import {createUseStyles} from 'react-jss';
import colors from 'assets/styles/abstracts/color';
import sizes from 'assets/styles/abstracts/sizes';
import {rem} from 'assets/styles/abstracts/functions';

const styles = {
    wrapper: {display: 'flex', flexDirection: 'column', gap: rem(24)},
    toolbar: {
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'flex-end',
        gap: rem(16),
        '& label': {display: 'flex', flexDirection: 'column', gap: rem(6), color: colors.textMuted},
    },
    monthSwitch: {display: 'flex', alignItems: 'center', gap: rem(10), '& strong': {minWidth: rem(150), textAlign: 'center'}},
    city: {minWidth: rem(260), flex: '1 1 260px', maxWidth: rem(420)},
    info: {color: colors.textMuted, lineHeight: 1.7, maxWidth: rem(820)},
    days: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 340px), 1fr))',
        gap: rem(14),
    },
    day: {
        padding: rem(18),
        borderRadius: rem(sizes.radius),
        border: `1px solid ${colors.borderSoft}`,
        background: 'linear-gradient(170deg, rgba(28,28,56,0.75), rgba(11,11,30,0.45))',
        display: 'flex',
        flexDirection: 'column',
        gap: rem(8),
    },
    today: {borderColor: 'rgba(226,194,117,0.6)', boxShadow: '0 0 0 1px rgba(226,194,117,0.25)'},
    dayHead: {display: 'flex', alignItems: 'center', gap: rem(12)},
    date: {fontSize: rem(28), color: colors.gold, lineHeight: 1, minWidth: rem(38)},
    weekday: {color: colors.textMuted, fontSize: rem(sizes.small)},
    phase: {marginLeft: 'auto', textAlign: 'right', fontSize: rem(sizes.small), color: colors.textMuted},
    moonIcon: {fontSize: rem(22), lineHeight: 1, display: 'block'},
    line: {fontSize: rem(sizes.small + 1), lineHeight: 1.6, '& .glyph': {color: colors.gold}, '& b': {color: colors.text}},
    muted: {color: colors.textMuted, fontSize: rem(sizes.small + 1), lineHeight: 1.6},
    voc: {
        fontSize: rem(sizes.small),
        color: colors.tense,
        border: '1px solid rgba(242,139,139,0.35)',
        borderRadius: rem(8),
        padding: [rem(4), rem(8)],
    },
    note: {color: colors.textSubtle, fontSize: rem(sizes.small), lineHeight: 1.6},
};

// @ts-ignore
export const useMoonCalendarStyles = createUseStyles(styles);
