import {createUseStyles} from 'react-jss';
import colors from 'assets/styles/abstracts/color';
import {rem} from 'assets/styles/abstracts/functions';

const styles = {
    wrapper: {
        display: 'flex',
        flexDirection: 'column',
        gap: rem(20),
        '& .ant-table': {background: 'transparent'},
        '& td': {whiteSpace: 'nowrap'},
    },
    glyphCell: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: rem(8),
        '& .glyph': {color: colors.gold, width: rem(18), textAlign: 'center'},
    },
    rulerCell: {
        display: 'inline-flex',
        flexDirection: 'column',
        gap: rem(2),
    },
    muted: {
        color: colors.textMuted,
    },
    linkHead: {
        fontSize: rem(18),
        marginTop: rem(12),
        marginBottom: rem(4),
    },
    links: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 320px), 1fr))',
        gap: rem(12),
        listStyle: 'none',
        padding: 0,
        margin: 0,
    },
    linkItem: {
        display: 'flex',
        flexDirection: 'column',
        gap: rem(6),
        padding: rem(16),
        borderRadius: rem(14),
        border: `1px solid ${colors.borderSoft}`,
        background: 'rgba(28,28,56,0.45)',
        '& > p:first-child': {flexWrap: 'wrap', whiteSpace: 'normal'},
    },
    linkText: {
        color: colors.textMuted,
        lineHeight: 1.6,
    },
};

// @ts-ignore
export const useHousesTableStyles = createUseStyles(styles);
