import {createUseStyles} from 'react-jss';
import colors from 'assets/styles/abstracts/color';
import sizes from 'assets/styles/abstracts/sizes';
import {rem} from 'assets/styles/abstracts/functions';
import {breakpoint} from 'assets/styles/abstracts/mixins';

const styles = {
    result: {
        display: 'flex',
        flexDirection: 'column',
        gap: rem(48),
    },
    head: {
        display: 'flex',
        flexDirection: 'column',
        gap: rem(6),
    },
    eyebrow: {
        color: colors.gold,
        fontSize: rem(sizes.small),
        letterSpacing: '0.18em',
        textTransform: 'uppercase',
    },
    meta: {
        color: colors.textMuted,
    },
    actions: {
        display: 'flex',
        gap: rem(10),
        flexWrap: 'wrap',
        marginTop: rem(12),
    },
    notices: {
        display: 'flex',
        flexDirection: 'column',
        gap: rem(10),
        marginTop: rem(-24),
        '&:empty': {display: 'none'},
    },
    tabs: {
        // The tab panel takes focus on click; no page-wide focus frame around it
        '& .ant-tabs-content, & .ant-tabs-tabpane': {outline: 'none !important'},
        '& .ant-tabs-nav': {marginBottom: rem(32)},
        '& .ant-tabs-tab': {fontSize: rem(17)},
        // Phones: a natively swipeable tab strip instead of antd's hidden overflow menu
        [breakpoint(sizes.breakpoint)]: {
            '& .ant-tabs-nav-wrap': {overflowX: 'auto', scrollbarWidth: 'none', '&::-webkit-scrollbar': {display: 'none'}},
            '& .ant-tabs-nav-list': {transform: 'none !important'},
            '& .ant-tabs-nav-operations': {display: 'none !important'},
            '& .ant-tabs-tab': {fontSize: rem(15)},
            '& .ant-tabs-tab + .ant-tabs-tab': {marginLeft: `${rem(20)} !important`},
            '& .ant-tabs-ink-bar': {display: 'none'},
            '& .ant-tabs-tab-active': {borderBottom: `2px solid ${colors.gold}`},
        },
    },
    tabBody: {
        display: 'flex',
        flexDirection: 'column',
        gap: rem(48),
    },
    stage: {
        scrollMarginTop: rem(88),
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 7fr) minmax(0, 5fr)',
        gap: rem(40),
        alignItems: 'start',
        [breakpoint(sizes.breakpointLg)]: {gridTemplateColumns: '1fr'},
    },
    wheelWrap: {
        padding: rem(8),
    },
    side: {
        position: 'sticky',
        top: rem(96),
        [breakpoint(sizes.breakpointLg)]: {position: 'static'},
    },
    section: {
        display: 'flex',
        flexDirection: 'column',
        gap: rem(20),
        '& > h2': {fontSize: rem(30)},
    },
};

// @ts-ignore
export const useChartResultStyles = createUseStyles(styles);
