import {createUseStyles} from 'react-jss';
import colors from 'assets/styles/abstracts/color';
import sizes from 'assets/styles/abstracts/sizes';
import {rem} from 'assets/styles/abstracts/functions';
import {skyStyles} from 'pages/sky/sky.style';

const card = {
    padding: rem(20),
    borderRadius: rem(sizes.radius),
    border: `1px solid ${colors.borderSoft}`,
    background: 'linear-gradient(170deg, rgba(28,28,56,0.8), rgba(11,11,30,0.5))',
    display: 'flex',
    flexDirection: 'column',
    gap: rem(8),
};

const styles = {
    stage: skyStyles.stage,
    backdrop: skyStyles.backdrop,
    page: skyStyles.page,
    head: skyStyles.head,
    eyebrow: skyStyles.eyebrow,
    muted: skyStyles.muted,
    form: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: rem(16),
        alignItems: 'flex-end',
        '& label': {display: 'flex', flexDirection: 'column', gap: rem(6), color: colors.textMuted},
        '& .ant-picker': {width: '100%'},
    },
    nameField: {flex: '2 1 320px'},
    dateField: {flex: '1 1 200px', maxWidth: rem(260)},
    body: {display: 'flex', flexDirection: 'column', gap: rem(36)},
    busy: {opacity: 0.6},
    section: {display: 'flex', flexDirection: 'column', gap: rem(14), '& > h2': {fontSize: rem(28)}},
    grid: {display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 260px), 1fr))', gap: rem(14)},
    card,
    cardHead: {display: 'flex', alignItems: 'center', gap: rem(14), '& h3': {fontSize: rem(19)}},
    number: {
        width: rem(52),
        height: rem(52),
        flexShrink: 0,
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: rem(24),
        color: colors.onGold,
        background: 'radial-gradient(circle at 35% 30%, #F6E3B0, #E2C275 60%, #B8964A)',
        fontWeight: sizes.weight600,
    },
    letterBadge: {
        width: rem(52),
        height: rem(52),
        flexShrink: 0,
        borderRadius: rem(12),
        border: `1px solid ${colors.border}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: rem(26),
        color: colors.gold,
    },
    small: {color: colors.textSubtle, fontSize: rem(sizes.small), lineHeight: 1.5},
    text: {color: colors.textMuted, lineHeight: 1.65},
    strong: {fontWeight: sizes.weight600, color: colors.text},
    letters: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: rem(6),
        '& li': {
            minWidth: rem(36),
            padding: [rem(6), rem(8)],
            borderRadius: rem(8),
            border: `1px solid ${colors.borderSoft}`,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            '& b': {color: colors.gold, fontSize: rem(13)},
        },
    },
    inclusion: {
        display: 'grid',
        gridTemplateColumns: 'repeat(9, minmax(0, 1fr))',
        gap: rem(6),
        '& div': {
            padding: [rem(8), 0],
            borderRadius: rem(8),
            border: `1px solid ${colors.borderSoft}`,
            textAlign: 'center',
            '& b': {display: 'block', color: colors.gold, fontSize: rem(18)},
            '& small': {color: colors.textSubtle, fontSize: rem(12)},
        },
    },
    zero: {borderStyle: 'dashed !important', opacity: 0.55},
    planes: {display: 'flex', flexDirection: 'column', gap: rem(10)},
    plane: {display: 'grid', gridTemplateColumns: `${rem(110)} 1fr ${rem(28)}`, alignItems: 'center', gap: rem(10)},
    bar: {height: rem(10), borderRadius: rem(999), background: colors.surfaceRaised, overflow: 'hidden', '& span': {display: 'block', height: '100%', background: colors.gold}},
    list: {display: 'flex', flexDirection: 'column', gap: rem(6), '& li': {color: colors.textMuted, lineHeight: 1.6}, '& b': {color: colors.gold}},
    cta: {...card, flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between'},
};

// @ts-ignore
export const useNameAnalysisStyles = createUseStyles(styles);
