import {createUseStyles} from 'react-jss';
import colors from 'assets/styles/abstracts/color';
import sizes from 'assets/styles/abstracts/sizes';
import fonts from 'assets/styles/abstracts/fonts';
import {rem} from 'assets/styles/abstracts/functions';
import {breakpoint} from 'assets/styles/abstracts/mixins';

const styles = {
    page: {
        paddingTop: rem(120),
        paddingBottom: rem(96),
        display: 'flex',
        flexDirection: 'column',
        gap: rem(24),
        [breakpoint(sizes.breakpoint)]: {paddingTop: rem(96)},
    },
    head: {
        display: 'flex',
        flexDirection: 'column',
        gap: rem(8),
        '& h1': {fontSize: 'clamp(2.2rem, 5vw, 3.2rem)'},
    },
    muted: {color: colors.textMuted},
    toolbar: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: rem(10),
    },
    list: {
        listStyle: 'none',
        margin: 0,
        padding: 0,
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 340px), 1fr))',
        gap: rem(16),
    },
    card: {
        display: 'flex',
        flexDirection: 'column',
        gap: rem(10),
        padding: rem(20),
        borderRadius: rem(18),
        border: `1px solid ${colors.borderSoft}`,
        background: 'linear-gradient(170deg, rgba(28,28,56,0.8), rgba(11,11,30,0.6))',
    },
    primary: {
        borderColor: 'rgba(226,194,117,0.6)',
        boxShadow: '0 0 0 1px rgba(226,194,117,0.25)',
    },
    top: {
        display: 'flex',
        alignItems: 'center',
        gap: rem(10),
        minHeight: rem(40),
    },
    name: {
        fontFamily: fonts.heading,
        fontSize: rem(22),
    },
    nameInput: {maxWidth: rem(260)},
    badge: {
        padding: [rem(2), rem(10)],
        borderRadius: 999,
        background: 'rgba(226,194,117,0.15)',
        color: colors.gold,
        fontSize: rem(sizes.small),
        whiteSpace: 'nowrap',
    },
    relation: {width: rem(200)},
    actions: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: rem(6),
        marginTop: rem(4),
    },
    empty: {
        padding: rem(24),
        borderRadius: rem(18),
        border: `1px dashed ${colors.border}`,
        color: colors.textMuted,
    },
};

// @ts-ignore
export const useProfilesStyles = createUseStyles(styles);
