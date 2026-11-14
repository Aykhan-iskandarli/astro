import {createUseStyles} from 'react-jss';
import colors from 'assets/styles/abstracts/color';
import sizes from 'assets/styles/abstracts/sizes';
import {rem} from 'assets/styles/abstracts/functions';
import {breakpoint} from 'assets/styles/abstracts/mixins';
import {skyStyles} from 'pages/sky/sky.style';

const styles = {
    stage: skyStyles.stage,
    backdrop: skyStyles.backdrop,
    page: skyStyles.page,
    head: skyStyles.head,
    eyebrow: skyStyles.eyebrow,
    muted: skyStyles.muted,
    busy: {opacity: 0.6, transition: 'opacity .2s'},
    body: {display: 'flex', flexDirection: 'column', gap: rem(20)},
    toolbar: {display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: rem(16)},
    monthSwitch: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: rem(12),
        '& strong': {fontSize: rem(22), minWidth: rem(170), textAlign: 'center'},
        '& button': {minWidth: rem(sizes.touch), height: rem(sizes.touch)},
    },
    select: {maxWidth: rem(360), width: '100%'},
    empty: {display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: rem(12)},
    controls: {display: 'flex', flexWrap: 'wrap', gap: rem(24), alignItems: 'flex-start'},
    control: {
        display: 'flex',
        flexDirection: 'column',
        gap: rem(6),
        minWidth: rem(260),
        '& > span': {color: colors.gold, fontSize: rem(sizes.small), letterSpacing: '0.12em', textTransform: 'uppercase'},
        '& small': {color: colors.textSubtle},
        [breakpoint(sizes.breakpointSm)]: {minWidth: 0, width: '100%'},
    },
    summary: {display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: rem(12)},
    only: {display: 'inline-flex', alignItems: 'center', gap: rem(10), cursor: 'pointer'},
    days: {listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: rem(10)},
    day: {
        display: 'grid',
        gridTemplateColumns: `${rem(110)} 1fr`,
        gap: rem(16),
        padding: rem(14),
        borderRadius: rem(14),
        border: `1px solid ${colors.borderSoft}`,
        background: 'rgba(28,28,56,0.45)',
        [breakpoint(sizes.breakpointSm)]: {gridTemplateColumns: '1fr', gap: rem(6)},
    },
    state_good: {borderColor: 'rgba(226,194,117,0.6)', background: 'rgba(226,194,117,0.08)'},
    state_care: {},
    state_none: {opacity: 0.6},
    state_unknown: {},
    when: {
        display: 'flex',
        flexDirection: 'column',
        '& strong': {fontSize: rem(22), color: colors.gold, fontVariantNumeric: 'tabular-nums'},
        '& span': {color: colors.textMuted, fontSize: rem(sizes.small)},
        [breakpoint(sizes.breakpointSm)]: {flexDirection: 'row', alignItems: 'baseline', gap: rem(10)},
    },
    what: {display: 'flex', flexDirection: 'column', gap: rem(4), '& p': {lineHeight: 1.5}},
    badgeRow: {display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: rem(10)},
    badge: {
        padding: [rem(2), rem(10)],
        borderRadius: rem(999),
        border: `1px solid ${colors.borderSoft}`,
        fontSize: rem(sizes.small),
        color: colors.text,
    },
    tag: {color: colors.tense, fontSize: rem(sizes.small)},
    window: {color: colors.text},
    free: {color: colors.textMuted},
    reason: {color: colors.textMuted, fontSize: rem(sizes.small)},
    rules: {
        color: colors.textMuted,
        '& summary': {cursor: 'pointer', color: colors.text, minHeight: rem(sizes.touch), display: 'flex', alignItems: 'center'},
        '& p': {lineHeight: 1.6, marginTop: rem(8)},
    },
    note: {color: colors.textSubtle, fontSize: rem(sizes.small)},
};

// @ts-ignore
export const useChooseDayStyles = createUseStyles(styles);
