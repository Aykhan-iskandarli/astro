import {createUseStyles} from 'react-jss';
import colors from 'assets/styles/abstracts/color';
import {rem} from 'assets/styles/abstracts/functions';

const styles = {
    page: {
        maxWidth: rem(760),
        padding: [rem(128), rem(24), rem(96)],
        display: 'flex',
        flexDirection: 'column',
        gap: rem(24),
    },
    section: {
        '& h2': {fontSize: rem(26), marginBottom: rem(8)},
        '& p': {color: colors.textMuted, lineHeight: 1.75},
    },
};

// @ts-ignore
export const usePrivacyPolicyStyles = createUseStyles(styles);
