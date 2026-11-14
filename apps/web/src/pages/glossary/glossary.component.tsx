import {useCallback, useEffect, useMemo, useState} from 'react';
import {useLocation} from 'react-router-dom';
import {Input} from 'antd';
import {Routes} from 'router/routes';
import SeoComponent from 'core/shared/seo/seo.component';
import useLocalization, {useContent} from 'assets/lang';
import {useStore} from 'store/store.config';
import {useGlossaryStyles} from './glossary.style';

// Plain-language glossary of the terms used across the site; each entry has an anchor (#id) for tooltips.
function GlossaryComponent() {
    const translate = useLocalization();
    const content = useContent();
    const locale = useStore('locale');
    const classes = useGlossaryStyles();
    const location = useLocation();
    const [query, setQuery] = useState('');

    const entries = useMemo(() => Object.entries(content.glossary as Record<string, {term: string; definition: string}>)
        .sort((a, b) => a[1].term.localeCompare(b[1].term, locale)), [content, locale]);
    const filtered = useMemo(() => {
        const q = query.trim().toLocaleLowerCase(locale);
        return q ? entries.filter(([, e]) => `${e.term} ${e.definition}`.toLocaleLowerCase(locale).includes(q)) : entries;
    }, [entries, query, locale]);

    const handleQuery = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setQuery(e.target.value);
    }, []);

    // Arriving from a tooltip link: scroll to the entry
    useEffect(() => {
        const id = location.hash.slice(1);
        if (id) document.getElementById(id)?.scrollIntoView({block: 'center'});
    }, [location.hash]);

    return (
        <article className={`container ${classes.page}`}>
            <SeoComponent titleKey='seo_glossary_title' descriptionKey='seo_glossary_description' path={Routes.glossary}/>
            <header className={classes.head}>
                <h1>{translate('glossary_title')}</h1>
                <p className={classes.muted}>{translate('glossary_intro')}</p>
            </header>
            <Input.Search allowClear size='large' value={query} onChange={handleQuery} placeholder={translate('glossary_search')}
                          aria-label={translate('glossary_search')} className={classes.search}/>
            {filtered.length ? (
                <dl className={classes.list}>
                    {filtered.map(([id, e]) => (
                        <div key={id} id={id} className={`${classes.item} ${location.hash === `#${id}` ? classes.target : ''}`}>
                            <dt>{e.term}</dt>
                            <dd>{e.definition}</dd>
                        </div>
                    ))}
                </dl>
            ) : <p className={classes.muted}>{translate('glossary_empty')}</p>}
        </article>
    );
}

export default GlossaryComponent;
