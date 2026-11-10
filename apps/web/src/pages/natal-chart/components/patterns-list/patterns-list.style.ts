import {createUseStyles} from 'react-jss';
import colors from 'assets/styles/abstracts/color';
import fonts from 'assets/styles/abstracts/fonts';
import sizes from 'assets/styles/abstracts/sizes';
import {rem} from 'assets/styles/abstracts/functions';

const styles = {
    list: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
        gap: rem(16),
    },
    card: {
        padding: rem(20),
        borderRadius: rem(sizes.radius),
        border: `1px solid ${colors.borderSoft}`,
        background: 'linear-gradient(160deg, rgba(91,75,196,0.12), rgba(20,20,43,0.6))',
    },
    title: {
        fontFamily: fonts.heading,
        fontSize: rem(20),
        fontWeight: sizes.weight500,
        color: colors.gold,
        marginBottom: rem(8),
        '& span': {color: colors.textMuted, fontFamily: fonts.font, fontSize: rem(sizes.small)},
    },
    members: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: `${rem(4)} ${rem(12)}`,
        fontSize: rem(sizes.small),
        color: colors.text,
        marginBottom: rem(10),
        '& .glyph': {color: colors.violet},
    },
    meaning: {
        color: colors.textMuted,
        fontSize: rem(sizes.text),
    },
    empty: {
        color: colors.textMuted,
    },
};

// @ts-ignore
export const usePatternsListStyles = createUseStyles(styles);
