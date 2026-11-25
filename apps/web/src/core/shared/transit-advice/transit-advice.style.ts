import {createUseStyles} from 'react-jss';
import colors from 'assets/styles/abstracts/color';
import sizes from 'assets/styles/abstracts/sizes';
import {rem} from 'assets/styles/abstracts/functions';

const styles = {
    wrap: {
        display: 'grid',
        gridTemplateColumns: 'auto 1fr',
        gap: [rem(6), rem(12)],
        margin: 0,
        padding: [rem(10), rem(14)],
        borderRadius: rem(12),
        background: 'rgba(255,255,255,0.04)',
        fontSize: rem(sizes.small + 1),
        lineHeight: 1.6,
        '& dd': {margin: 0, color: colors.text},
        '@media (max-width: 600px)': {gridTemplateColumns: '1fr', '& dd': {marginBottom: rem(6)}},
    },
    do: {color: colors.harmonious, fontWeight: 600},
    avoid: {color: colors.tense, fontWeight: 600},
};

// @ts-ignore
export const useTransitAdviceStyles = createUseStyles(styles);
