import {createUseStyles} from 'react-jss';
import colors from 'assets/styles/abstracts/color';
import sizes from 'assets/styles/abstracts/sizes';
import {rem} from 'assets/styles/abstracts/functions';

const styles = {
    features: {
        padding: [rem(120), 0, rem(80)],
    },
    title: {
        textAlign: 'center',
        marginBottom: rem(56),
    },
    grid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
        gap: rem(24),
    },
    card: {
        padding: rem(32),
        borderRadius: rem(20),
        border: `1px solid ${colors.borderSoft}`,
        background: 'linear-gradient(170deg, rgba(28,28,56,0.6), rgba(11,11,30,0.2))',
        '& h3': {fontSize: rem(22), margin: [rem(20), 0, rem(10)]},
        '& p': {color: colors.textMuted, fontSize: rem(sizes.text)},
    },
    icon: {
        width: rem(36),
        height: rem(36),
        color: colors.gold,
    },
};

// @ts-ignore
export const useFeaturesStyles = createUseStyles(styles);
