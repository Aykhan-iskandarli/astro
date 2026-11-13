import {Fragment, ReactNode} from 'react';
import {Alert} from 'antd';
import {Routes} from 'router/routes';
import {environment} from 'core/configs/app.config';
import SeoComponent from 'core/shared/seo/seo.component';
import {useStore} from 'store/store.config';
import useLocalization from 'assets/lang';
import {ILang} from 'assets/lang/lang';
import {PRIVACY_POLICY, PRIVACY_UPDATED} from './privacy-policy.data';
import {usePrivacyPolicyStyles} from './privacy-policy.style';

// Legal text is a draft: it must be reviewed by a lawyer before launch.
function PrivacyPolicyComponent() {
    const translate = useLocalization();
    const locale = useStore('locale') as ILang;
    const {page, updated, section, pending} = usePrivacyPolicyStyles();

    const siteSet = !environment.siteUrl.includes('astra.example');
    const values: Record<string, string> = {
        controller: environment.privacy.controller,
        email: environment.privacy.email,
        hosting: environment.privacy.hosting,
        site: siteSet ? environment.siteUrl.replace(/^https?:\/\//, '') : '',
        source: environment.sourceUrl,
    };

    // Fills {placeholders}; a value not configured yet is shown highlighted as "to be set"
    const fill = (text: string): ReactNode => text.split(/(\{\w+\})/g).map((part, i) => {
        const key = part.match(/^\{(\w+)\}$/)?.[1];
        if (!key) return <Fragment key={i}>{part}</Fragment>;
        const value = values[key];
        if (!value) return <mark key={i} className={pending}>{translate('privacy_pending')}</mark>;
        if (key === 'email') return <a key={i} href={`mailto:${value}`}>{value}</a>;
        if (key === 'source') return <a key={i} href={value} target='_blank' rel='noopener noreferrer'>{value}</a>;
        return <Fragment key={i}>{value}</Fragment>;
    });

    const sections = PRIVACY_POLICY[locale] ?? PRIVACY_POLICY.az;

    return (
        <article className={`container ${page}`}>
            <SeoComponent titleKey='seo_privacy_title' descriptionKey='seo_privacy_description' path={Routes.privacyPolicy}/>
            <h1>{translate('privacy_title')}</h1>
            <p className={updated}>{translate('privacy_updated', {date: PRIVACY_UPDATED.split('-').reverse().join('.')})}</p>
            <Alert type='warning' showIcon title={translate('privacy_draft')}/>
            {sections.map((s) => (
                <section key={s.title} className={section}>
                    <h2>{s.title}</h2>
                    {s.paragraphs?.map((p) => <p key={p}>{fill(p)}</p>)}
                    {s.items ? <ul>{s.items.map((it) => <li key={it}>{fill(it)}</li>)}</ul> : null}
                    {s.after?.map((p) => <p key={p}>{fill(p)}</p>)}
                </section>
            ))}
        </article>
    );
}

export default PrivacyPolicyComponent;
