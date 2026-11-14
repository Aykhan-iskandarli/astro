import {createUseStyles} from 'react-jss';
import colors from 'assets/styles/abstracts/color';
import {rem} from 'assets/styles/abstracts/functions';

const styles = {
    term: {
        textDecoration: 'underline dotted',
        textDecorationColor: 'rgba(226,194,117,0.7)',
        textUnderlineOffset: '4px',
        cursor: 'help',
        borderRadius: 4,
        '&:focus-visible': {outline: `2px solid ${colors.gold}`, outlineOffset: 2},
    },
    tip: {
        display: 'flex',
        flexDirection: 'column',
        gap: rem(6),
        maxWidth: rem(300),
        lineHeight: 1.5,
        '& strong': {color: colors.gold},
    },
    more: {
        color: `${colors.violet} !important`,
        textDecoration: 'underline',
    },
};

// @ts-ignore
export const useTermStyles = createUseStyles(styles);
