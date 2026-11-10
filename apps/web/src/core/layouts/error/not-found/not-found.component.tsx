import {useCallback} from 'react';
import {useNavigate} from 'react-router-dom';
import {Button} from 'antd';
import {Routes} from 'router/routes';
import SeoComponent from 'core/shared/seo/seo.component';
import useLocalization from 'assets/lang';
import {useNotFoundStyles} from './not-found.style';

// Note: SPA hosting returns HTTP 200 here; configure the reverse proxy to send 404 for unknown paths.
const NotFoundComponent = () => {
    const translate = useLocalization();
    const {notFound, code} = useNotFoundStyles();
    const navigate = useNavigate();

    const handleHome = useCallback(() => {
        navigate(Routes.default);
    }, [navigate]);

    return (
        <section className={`container ${notFound}`}>
            <SeoComponent titleKey='seo_404_title' descriptionKey='seo_404_description' path='/404' noIndex/>
            <p className={code} aria-hidden='true'>404</p>
            <h1>{translate('not_found_title')}</h1>
            <p>{translate('not_found_text')}</p>
            <Button type='primary' size='large' onClick={handleHome}>{translate('not_found_cta')}</Button>
        </section>
    );
};

export default NotFoundComponent;
