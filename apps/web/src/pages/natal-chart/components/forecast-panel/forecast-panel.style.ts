import {createUseStyles} from 'react-jss';
import colors from 'assets/styles/abstracts/color';
import sizes from 'assets/styles/abstracts/sizes';
import {rem} from 'assets/styles/abstracts/functions';
import {panelStyles} from '../transits-panel/transits-panel.style';

const styles = {
    ...panelStyles,
    head: {
        ...panelStyles.head,
        // Three long segment labels do not fit a phone: let the segmented control scroll inside itself
        '& .ant-segmented': {maxWidth: '100%', overflowX: 'auto', scrollbarWidth: 'none'},
    },
    controls: {
        display: 'flex',
        gap: rem(24),
        flexWrap: 'wrap',
        alignItems: 'flex-end',
        marginTop: rem(-16),
    },
    control: {
        display: 'flex',
        flexDirection: 'column',
        gap: rem(6),
        '& > span': {color: colors.textMuted, fontSize: rem(sizes.small)},
    },
    place: {minWidth: rem(280)},
    body: {display: 'flex', flexDirection: 'column', gap: rem(24)},
    info: {color: colors.textMuted, maxWidth: rem(720)},
    moment: {color: colors.gold, fontWeight: sizes.weight500},
    subhead: {fontSize: rem(24)},
};

// @ts-ignore
export const useForecastPanelStyles = createUseStyles(styles);
