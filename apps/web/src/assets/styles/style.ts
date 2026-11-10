import {createUseStyles} from 'react-jss';
import reset from './reset/reset';
import typography from './base/typography';
import commonStyles from './base/common';
import fontFaces from './base/font-faces';

const useGlobalStyles = createUseStyles({
    ...fontFaces,
    '@global': {
        ...reset['@global'],
        ...typography['@global'],
        ...commonStyles['@global'],
    },
});

export default useGlobalStyles;
