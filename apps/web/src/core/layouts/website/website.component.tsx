import {useEffect} from 'react';
import {useLocation} from 'react-router-dom';
import useLocalization from 'assets/lang';
import HeaderComponent from '../components/header/header.component';
import FooterComponent from '../components/footer/footer.component';
import AnimationComponent from '../animation/animation.component';
import {useWebsiteStyles} from './website.style';

// Public website layout: header + animated page outlet + footer. No login, no side menu.
const WebsiteComponent = () => {
    const translate = useLocalization();
    const {website, main} = useWebsiteStyles();
    const {pathname} = useLocation();

    useEffect(() => {
        const timeout = setTimeout(() => {
            window.scrollTo(0, 0);
        }, 50);
        return () => clearTimeout(timeout);
    }, [pathname]);

    return (
        <div className={website}>
            <a href='#main' className='skip-link'>{translate('skip_to_content')}</a>
            <HeaderComponent/>
            <main id='main' className={main} tabIndex={-1}>
                <AnimationComponent/>
            </main>
            <FooterComponent/>
        </div>
    );
};

export default WebsiteComponent;
