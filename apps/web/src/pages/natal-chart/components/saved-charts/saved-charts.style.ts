import {createUseStyles} from 'react-jss';
import colors from 'assets/styles/abstracts/color';
import sizes from 'assets/styles/abstracts/sizes';
import {rem} from 'assets/styles/abstracts/functions';

const styles = {
    wrapper: {
        marginTop: rem(32),
    },
    title: {
        fontSize: rem(20),
        marginBottom: rem(12),
    },
    item: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: rem(12),
        padding: [rem(12), 0],
        borderTop: `1px solid ${colors.borderSoft}`,
        flexWrap: 'wrap',
    },
    meta: {
        display: 'flex',
        flexDirection: 'column',
        '& span': {color: colors.textMuted, fontSize: rem(sizes.small)},
    },
    actions: {
        display: 'flex',
        gap: rem(4),
    },
};

// @ts-ignore
export const useSavedChartsStyles = createUseStyles(styles);
