import {createUseStyles} from 'react-jss';
import colors from 'assets/styles/abstracts/color';
import {rem} from 'assets/styles/abstracts/functions';

const styles = {
    wrap: {
        display: 'flex',
        flexDirection: 'column',
        gap: rem(16),
        '& h3': {fontSize: rem(22), marginBottom: rem(4)},
    },
    muted: {color: colors.textMuted},
    control: {
        display: 'inline-flex',
        flexDirection: 'column',
        gap: rem(6),
        alignSelf: 'flex-start',
        color: colors.textMuted,
    },
};

// @ts-ignore
export const useRetrogradeCalendarStyles = createUseStyles(styles);
