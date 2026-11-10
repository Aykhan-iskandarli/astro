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
    section: skyStyles.section,
    events: skyStyles.events,
    event: skyStyles.event,
    when: skyStyles.when,
    toolbar: {
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: rem(24),
    },
    yearSwitch: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: rem(12),
        '& strong': {fontSize: rem(22), minWidth: rem(56), textAlign: 'center', fontVariantNumeric: 'tabular-nums'},
        '& button': {minWidth: rem(sizes.touch), height: rem(sizes.touch)},
    },
    periods: {
        listStyle: 'none',
        margin: 0,
        padding: 0,
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 300px), 1fr))',
        gap: rem(8),
    },
    period: {
        display: 'flex',
        justifyContent: 'space-between',
        gap: rem(12),
        padding: [rem(12), rem(16)],
        borderRadius: rem(12),
        border: `1px solid ${colors.borderSoft}`,
        background: 'rgba(28,28,56,0.45)',
        flexWrap: 'wrap',
    },
    periodName: {
        display: 'inline-flex',
        gap: rem(6),
        '& .glyph': {color: colors.gold},
    },
    months: {
        display: 'grid',
        gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
        gap: rem(32),
        [breakpoint(sizes.breakpoint)]: {gridTemplateColumns: '1fr'},
    },
    month: {
        display: 'flex',
        flexDirection: 'column',
        gap: rem(8),
        '& h2': {fontSize: rem(22)},
    },
    eclipse: {
        '& span': {color: colors.gold, fontWeight: 600},
    },
};

// @ts-ignore
export const useCalendarStyles = createUseStyles(styles);
