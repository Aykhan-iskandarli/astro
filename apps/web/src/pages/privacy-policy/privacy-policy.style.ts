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
    updated: {
        color: colors.textSubtle,
        marginTop: rem(-12),
    },
    section: {
        display: 'flex',
        flexDirection: 'column',
        gap: rem(10),
        '& h2': {fontSize: rem(26), marginBottom: rem(2)},
        '& p, & li': {color: colors.textMuted, lineHeight: 1.75},
        '& ul': {display: 'flex', flexDirection: 'column', gap: rem(6), paddingLeft: rem(20), listStyle: 'disc'},
        '& a': {color: colors.gold, wordBreak: 'break-word'},
    },
    pending: {
        color: colors.gold,
        background: 'rgba(226,194,117,0.12)',
        borderRadius: rem(4),
        padding: [0, rem(4)],
    },
};

// @ts-ignore
export const usePrivacyPolicyStyles = createUseStyles(styles);
