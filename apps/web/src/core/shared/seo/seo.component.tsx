import useLocalization from 'assets/lang';
import {useStore} from 'store/store.config';
import {environment} from '../../configs/app.config';
import {ISeo} from './seo';

// React 19 hoists <title>, <meta> and <link> into <head> automatically.
const SeoComponent = ({titleKey, descriptionKey, path, image, noIndex, jsonLd}: ISeo) => {
    const translate = useLocalization();
    const locale = useStore('locale');
    const title = `${translate(titleKey)} | ${translate('site_name')}`;
    const description = translate(descriptionKey);
    const url = `${environment.siteUrl}${path === '/' ? '' : path}`;
    const ogImage = image || `${environment.siteUrl}/og-default.png`;

    return (
        <>
            <title>{title}</title>
            <meta name='description' content={description}/>
            <link rel='canonical' href={url}/>
            {noIndex ? <meta name='robots' content='noindex, nofollow'/> : null}

            <meta property='og:type' content='website'/>
            <meta property='og:title' content={title}/>
            <meta property='og:description' content={description}/>
            <meta property='og:url' content={url}/>
            <meta property='og:image' content={ogImage}/>
            <meta property='og:locale' content={locale === 'az' ? 'az_AZ' : 'en_US'}/>
            <meta name='twitter:card' content='summary_large_image'/>

            {jsonLd ? <script type='application/ld+json'>{JSON.stringify(jsonLd)}</script> : null}
        </>
    );
};

export default SeoComponent;
