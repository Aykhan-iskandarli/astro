import {createUseStyles} from 'react-jss';
import colors from 'assets/styles/abstracts/color';
import sizes from 'assets/styles/abstracts/sizes';
import {rem} from 'assets/styles/abstracts/functions';

const styles = {
    wrap: {display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', gap: rem(20)},
    dateField: {
        display: 'flex',
        flexDirection: 'column',
        gap: rem(6),
        '& > span': {color: colors.gold, fontSize: rem(sizes.small), letterSpacing: '0.12em', textTransform: 'uppercase'},
        '& small': {color: colors.textSubtle},
    },
};

// @ts-ignore
export const useBirthSourceStyles = createUseStyles(styles);
