import {createUseStyles} from 'react-jss';
import colors from 'assets/styles/abstracts/color';
import sizes from 'assets/styles/abstracts/sizes';
import {rem} from 'assets/styles/abstracts/functions';

const styles = {
    full: {
        '& summary': {cursor: 'pointer', color: colors.gold, minHeight: rem(sizes.touch), display: 'flex', alignItems: 'center'},
        '& section': {display: 'flex', flexDirection: 'column', gap: rem(4), paddingTop: rem(10)},
        '& h5': {fontSize: rem(sizes.small), letterSpacing: '0.08em', textTransform: 'uppercase', color: colors.textSubtle},
        '& p': {lineHeight: 1.65, color: colors.text},
    },
};

// @ts-ignore
export const useTransitReadingStyles = createUseStyles(styles);
