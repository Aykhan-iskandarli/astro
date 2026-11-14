import {useCallback} from 'react';
import {Tooltip} from 'antd';
import {Link} from 'react-router-dom';
import {Routes} from 'router/routes';
import useLocalization, {useContent} from 'assets/lang';
import {useTermStyles} from './term.style';
import {ITerm} from './term';

// An astrology term with a short definition on hover or focus (a tap focuses it on touch screens; no 'click'
// trigger, which would toggle it shut right after the focus opened it), linking to the full glossary.
const TermComponent = ({id, children}: ITerm) => {
    const translate = useLocalization();
    const content = useContent();
    const {term, tip, more} = useTermStyles();
    // Keep focus on the term while pressing the link: otherwise the blur closes the tooltip before the tap lands
    const keepFocus = useCallback((e: React.MouseEvent) => {
        e.preventDefault();
    }, []);
    const entry = (content.glossary as Record<string, {term: string; definition: string}>)[id];
    if (!entry) return <>{children}</>;
    return (
        <Tooltip trigger={['hover', 'focus']} mouseEnterDelay={0.15}
                 title={(
                     <span className={tip}>
                         <strong>{entry.term}</strong>
                         <span>{entry.definition}</span>
                         <Link to={`${Routes.glossary}#${id}`} className={more} onMouseDown={keepFocus}>{translate('glossary_more')}</Link>
                     </span>
                 )}>
            <span className={term} tabIndex={0} role='button' aria-label={`${entry.term}: ${entry.definition}`}>{children}</span>
        </Tooltip>
    );
};

export default TermComponent;
