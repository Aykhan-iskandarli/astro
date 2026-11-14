import {createUseStyles} from 'react-jss';
import colors from 'assets/styles/abstracts/color';
import {rem} from 'assets/styles/abstracts/functions';

const styles = {
    wrap: {
        display: 'flex',
        flexDirection: 'column',
        gap: rem(14),
        marginTop: rem(16),
        '& h2': {fontSize: rem(26)},
    },
    muted: {color: colors.textMuted},
    select: {maxWidth: rem(360), width: '100%'},
    empty: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        gap: rem(12),
    },
};

// @ts-ignore
export const usePersonalYearStyles = createUseStyles(styles);
