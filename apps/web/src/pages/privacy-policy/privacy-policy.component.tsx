import {Alert} from 'antd';
import {Routes} from 'router/routes';
import SeoComponent from 'core/shared/seo/seo.component';
import useLocalization from 'assets/lang';
import {usePrivacyPolicyStyles} from './privacy-policy.style';

const SECTIONS = ['s1', 's2', 's3', 's4'] as const;

// Legal text is a placeholder draft: it must be reviewed by a lawyer before launch.
function PrivacyPolicyComponent() {
    const translate = useLocalization();
    const {page, section} = usePrivacyPolicyStyles();

    return (
        <article className={`container ${page}`}>
            <SeoComponent titleKey='seo_privacy_title' descriptionKey='seo_privacy_description' path={Routes.privacyPolicy}/>
            <h1>{translate('privacy_title')}</h1>
            <Alert type='warning' showIcon message={translate('privacy_draft')}/>
            {SECTIONS.map((s) => (
                <section key={s} className={section}>
                    <h2>{translate(`privacy_${s}_title`)}</h2>
                    <p>{translate(`privacy_${s}_text`)}</p>
                </section>
            ))}
        </article>
    );
}

export default PrivacyPolicyComponent;
