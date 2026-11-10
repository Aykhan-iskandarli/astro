import {createUseStyles} from 'react-jss';
import colors from 'assets/styles/abstracts/color';
import fonts from 'assets/styles/abstracts/fonts';
import {rem} from 'assets/styles/abstracts/functions';

const styles = {
    notFound: {
        minHeight: '80vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        gap: rem(16),
        paddingTop: rem(96),
        '& p': {color: colors.textMuted},
    },
    code: {
        fontFamily: fonts.heading,
        fontSize: rem(96),
        lineHeight: 1,
        color: 'transparent',
        WebkitTextStroke: `1px ${colors.gold}`,
    },
};

// @ts-ignore
export const useNotFoundStyles = createUseStyles(styles);
