import {Link} from 'react-router-dom';
import {Routes} from 'router/routes';
import {environment} from 'core/configs/app.config';
import useLocalization from 'assets/lang';
import {useFooterStyles} from './footer.style';

const FooterComponent = () => {
    const translate = useLocalization();
    const {footer, inner, brand, links, small} = useFooterStyles();

    return (
        <footer className={footer}>
            <div className={`container ${inner}`}>
                <div className={brand}>
                    <strong>{translate('site_name')}</strong>
                    <span>{translate('footer_tagline')}</span>
                </div>
                <ul className={links}>
                    <li><Link to={Routes.natalChart}>{translate('nav_chart')}</Link></li>
                    <li><Link to={Routes.nameAnalysis}>{translate('nav_name')}</Link></li>
                    <li><Link to={Routes.today}>{translate('nav_today')}</Link></li>
                    <li><Link to={Routes.calendar}>{translate('nav_calendar')}</Link></li>
                    <li><Link to={Routes.privacyPolicy}>{translate('nav_privacy')}</Link></li>
                    <li><a href={environment.sourceUrl} target='_blank' rel='noopener noreferrer'>{translate('footer_source')}</a></li>
                </ul>
                <div className={small}>
                    <p>{translate('footer_ephemeris')} · <a href='https://www.geonames.org/' target='_blank' rel='noopener noreferrer'>{translate('footer_geonames')}</a></p>
                    <p>{translate('footer_disclaimer')}</p>
                </div>
            </div>
        </footer>
    );
};

export default FooterComponent;
