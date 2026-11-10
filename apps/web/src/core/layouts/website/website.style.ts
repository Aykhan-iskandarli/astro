import {createUseStyles} from 'react-jss';
import colors from 'assets/styles/abstracts/color';

const styles = {
    website: {
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        background: `radial-gradient(ellipse at 20% 0%, rgba(91,75,196,0.18), transparent 55%),
            radial-gradient(ellipse at 90% 30%, rgba(199,125,255,0.08), transparent 50%), ${colors.space}`,
    },
    main: {
        flex: 1,
        outline: 'none',
    },
};

// @ts-ignore
export const useWebsiteStyles = createUseStyles(styles);
