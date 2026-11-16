import {createUseStyles} from 'react-jss';
import {rem} from 'assets/styles/abstracts/functions';

const styles = {
    wrap: {display: 'flex', flexDirection: 'column', gap: rem(24)},
    nav: {overflowX: 'auto', paddingBottom: rem(4)},
};

// @ts-ignore
export const useDepthTabsStyles = createUseStyles(styles);
