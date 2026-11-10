import {createUseStyles} from 'react-jss';
import colors from 'assets/styles/abstracts/color';
import sizes from 'assets/styles/abstracts/sizes';
import {rem} from 'assets/styles/abstracts/functions';
import {breakpoint} from 'assets/styles/abstracts/mixins';

const styles = {
    form: {
        '& .ant-form-item-label > label': {
            color: colors.textMuted,
        },
    },
    row: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: rem(16),
        [breakpoint(sizes.breakpointSm)]: {gridTemplateColumns: '1fr'},
    },
    submit: {
        marginTop: rem(8),
        height: rem(52),
        fontSize: rem(16),
    },
    optionBox: {
        display: 'flex',
        flexDirection: 'column',
        padding: [rem(4), 0],
        whiteSpace: 'normal',
    },
    optionHint: {
        fontSize: rem(sizes.small),
        color: colors.textMuted,
        lineHeight: 1.4,
    },
    note: {
        marginTop: rem(12),
        textAlign: 'center',
        color: colors.textSubtle,
        fontSize: rem(sizes.small),
    },
};

// @ts-ignore
export const useBirthFormStyles = createUseStyles(styles);
