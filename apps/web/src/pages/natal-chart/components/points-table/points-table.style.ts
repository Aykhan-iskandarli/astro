import {createUseStyles} from 'react-jss';
import colors from 'assets/styles/abstracts/color';
import {rem} from 'assets/styles/abstracts/functions';

const styles = {
    table: {
        '& .ant-table': {background: 'transparent'},
        '& .ant-table-row': {cursor: 'pointer'},
        '& td': {whiteSpace: 'nowrap'},
    },
    glyphCell: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: rem(8),
        '& .glyph': {
            width: rem(18),
            textAlign: 'center',
            color: colors.gold,
            fontSize: rem(17),
        },
    },
    active: {
        '& > td': {background: `${colors.surfaceRaised} !important`},
    },
    retro: {
        color: colors.tense,
        textDecoration: 'none',
        fontWeight: 600,
        cursor: 'help',
    },
    dignity: {
        color: colors.violet,
    },
};

// @ts-ignore
export const usePointsTableStyles = createUseStyles(styles);
