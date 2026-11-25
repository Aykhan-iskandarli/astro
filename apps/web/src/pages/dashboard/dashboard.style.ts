import {createUseStyles} from 'react-jss';
import colors from 'assets/styles/abstracts/color';
import sizes from 'assets/styles/abstracts/sizes';
import {rem} from 'assets/styles/abstracts/functions';
import {skyStyles} from 'pages/sky/sky.style';

const styles = {
    stage: skyStyles.stage,
    backdrop: skyStyles.backdrop,
    page: skyStyles.page,
    head: skyStyles.head,
    eyebrow: skyStyles.eyebrow,
    muted: skyStyles.muted,
    body: {display: 'flex', flexDirection: 'column', gap: rem(32)},
    empty: {display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: rem(12)},
    select: {maxWidth: rem(360), width: '100%'},
    grid: {display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: rem(16), alignItems: 'stretch'},
    card: {
        display: 'flex',
        flexDirection: 'column',
        gap: rem(12),
        padding: rem(22),
        borderRadius: rem(18),
        border: `1px solid ${colors.borderSoft}`,
        background: 'linear-gradient(170deg, rgba(28,28,56,0.78), rgba(11,11,30,0.6))',
        '& .glyph': {color: colors.gold},
    },
    label: {color: colors.gold, fontSize: rem(sizes.small), letterSpacing: '0.12em', textTransform: 'uppercase'},
    plain: {margin: 0, paddingLeft: rem(18), display: 'flex', flexDirection: 'column', gap: rem(6), lineHeight: 1.6, color: colors.text},
    more: {marginTop: 'auto', color: colors.gold, minHeight: rem(sizes.touch), display: 'inline-flex', alignItems: 'center'},
    section: {display: 'flex', flexDirection: 'column', gap: rem(14), '& > h2': {fontSize: rem(26)}},
    buttons: {display: 'flex', flexWrap: 'wrap', gap: rem(10)},
    guide: {
        listStyle: 'none',
        margin: 0,
        padding: 0,
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))',
        gap: rem(12),
        '& li': {
            display: 'flex', flexDirection: 'column', gap: rem(4), padding: rem(14), borderRadius: rem(14),
            border: `1px solid ${colors.borderSoft}`, background: 'rgba(255,255,255,0.03)',
        },
        '& a': {color: colors.gold},
        '& span': {color: colors.textMuted, fontSize: rem(sizes.small), lineHeight: 1.6},
    },
};

// @ts-ignore
export const useDashboardStyles = createUseStyles(styles);
