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
};

// @ts-ignore
export const useHousesTableStyles = createUseStyles(styles);
