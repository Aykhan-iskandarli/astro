import {useCallback, useEffect} from 'react';
import {Link, NavLink} from 'react-router-dom';
import classNames from 'classnames';
import {useDispatch} from 'react-redux';
import {useStore} from 'store/store.config';
import {setAmbientSound, setLocale} from 'store/store.reducer';
import {Routes} from 'router/routes';
import {startAmbient, stopAmbient} from 'core/helpers/ambient-sound';
import useLocalization from 'assets/lang';
import {ILang} from 'assets/lang/lang';
import {useHeaderStyles} from './header.style';

const LANGS: ILang[] = ['az', 'en'];

const HeaderComponent = () => {
    const translate = useLocalization();
    const dispatch = useDispatch();
    const locale = useStore('locale');
    const ambientSound = useStore('ambientSound');
    const {header, inner, logo, logoMark, nav, link, active, tools, langButton, langActive, iconButton} = useHeaderStyles();

    const handleLocale = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
        dispatch(setLocale(e.currentTarget.dataset.lang as ILang));
    }, [dispatch]);

    const handleSound = useCallback(() => {
        if (ambientSound) {
            stopAmbient();
        } else {
            startAmbient();
        }
        dispatch(setAmbientSound(!ambientSound));
    }, [ambientSound, dispatch]);

    useEffect(() => {
        document.documentElement.lang = locale;
    }, [locale]);

    const navClass = useCallback(({isActive}: {isActive: boolean}) => classNames(link, {[active]: isActive}), [link, active]);

    return (
        <header className={header}>
            <div className={classNames('container', inner)}>
                <Link to={Routes.default} className={logo}>
                    <span className={logoMark} aria-hidden='true'/>
                    {translate('site_name')}
                </Link>
                <nav className={nav} aria-label={translate('nav_main')}>
                    <NavLink to={Routes.default} end className={navClass}>{translate('nav_home')}</NavLink>
                    <NavLink to={Routes.natalChart} className={navClass}>{translate('nav_chart')}</NavLink>
                </nav>
                <div className={tools}>
                    <div role='group' aria-label={translate('language')}>
                        {LANGS.map((lang) => (
                            <button
                                key={lang}
                                type='button'
                                lang={lang}
                                data-lang={lang}
                                className={classNames(langButton, {[langActive]: locale === lang})}
                                aria-pressed={locale === lang}
                                onClick={handleLocale}
                            >
                                {lang.toUpperCase()}
                            </button>
                        ))}
                    </div>
                    <button
                        type='button'
                        className={iconButton}
                        aria-pressed={ambientSound}
                        aria-label={translate(ambientSound ? 'sound_off' : 'sound_on')}
                        title={translate(ambientSound ? 'sound_off' : 'sound_on')}
                        onClick={handleSound}
                    >
                        <svg width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='1.6' aria-hidden='true'>
                            <path d='M4 9v6h4l5 4V5L8 9H4z'/>
                            {ambientSound
                                ? <path d='M16 8.5a5 5 0 010 7M18.5 6a8.5 8.5 0 010 12'/>
                                : <path d='M17 9l5 6M22 9l-5 6'/>}
                        </svg>
                    </button>
                </div>
            </div>
        </header>
    );
};

export default HeaderComponent;
