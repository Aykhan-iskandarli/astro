import {createUseStyles} from 'react-jss';
import colors from 'assets/styles/abstracts/color';
import {rem} from 'assets/styles/abstracts/functions';
import {panelStyles} from '../transits-panel/transits-panel.style';

const styles = {
    ...panelStyles,
    body: {display: 'flex', flexDirection: 'column', gap: rem(24)},
    info: {color: colors.textMuted, maxWidth: rem(720)},
    subhead: {fontSize: rem(24)},
};

// @ts-ignore
export const useCompositeViewStyles = createUseStyles(styles);
