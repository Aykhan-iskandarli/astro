import {useCallback, useEffect, useState} from 'react';
import {Link, NavLink, useLocation} from 'react-router-dom';
import {AnimatePresence, motion} from 'framer-motion';
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
const NAV = [
    {to: Routes.default, key: 'nav_home', end: true},
    {to: Routes.natalChart, key: 'nav_chart', end: false},
    {to: Routes.nameAnalysis, key: 'nav_name', end: false},
    {to: Routes.today, key: 'nav_today', end: false},
    {to: Routes.calendar, key: 'nav_calendar', end: false},
] as const;

const HeaderComponent = () => {
    const translate = useLocalization();
    const dispatch = useDispatch();
    const locale = useStore('locale');
    const ambientSound = useStore('ambientSound');
    const {header, inner, logo, logoMark, nav, link, active, tools, langButton, langActive, iconButton, menuButton,
        mobileNav, mobileLink, scrim} = useHeaderStyles();
    const [menuOpen, setMenuOpen] = useState(false);
    const location = useLocation();

    // The mobile menu closes on navigation and on Escape
    useEffect(() => {
        setMenuOpen(false);
    }, [location.pathname]);

    useEffect(() => {
        if (!menuOpen) return undefined;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setMenuOpen(false);
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [menuOpen]);

    const handleMenu = useCallback(() => {
        setMenuOpen((v) => !v);
    }, []);

    const handleCloseMenu = useCallback(() => {
        setMenuOpen(false);
    }, []);

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
    const mobileClass = useCallback(({isActive}: {isActive: boolean}) => classNames(mobileLink, {[active]: isActive}), [mobileLink, active]);

    return (
        <header className={header}>
            <div className={classNames('container', inner)}>
                <Link to={Routes.default} className={logo}>
                    <span className={logoMark} aria-hidden='true'/>
                    {translate('site_name')}
                </Link>
                <nav className={nav} aria-label={translate('nav_main')}>
                    {NAV.map((n) => (
                        <NavLink key={n.to} to={n.to} end={n.end} className={navClass}>{translate(n.key)}</NavLink>
                    ))}
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
                        className={classNames(iconButton, menuButton)}
                        aria-expanded={menuOpen}
                        aria-controls='mobile-nav'
                        aria-label={translate(menuOpen ? 'menu_close' : 'menu_open')}
                        onClick={handleMenu}
                    >
                        <svg width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='1.6' aria-hidden='true'>
                            {menuOpen ? <path d='M6 6l12 12M18 6L6 18'/> : <path d='M4 7h16M4 12h16M4 17h16'/>}
                        </svg>
                    </button>
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
            <AnimatePresence>
                {menuOpen ? (
                    <>
                        <motion.div key='scrim' className={scrim} onClick={handleCloseMenu} aria-hidden='true'
                                    initial={{opacity: 0}} animate={{opacity: 1}} exit={{opacity: 0}}/>
                        <motion.nav key='menu' id='mobile-nav' className={mobileNav} aria-label={translate('nav_main')}
                                    initial={{opacity: 0, y: -8}} animate={{opacity: 1, y: 0}} exit={{opacity: 0, y: -8}}
                                    transition={{duration: 0.2}}>
                            {NAV.map((n) => (
                                <NavLink key={n.to} to={n.to} end={n.end} className={mobileClass}>
                                    {translate(n.key)}
                                </NavLink>
                            ))}
                        </motion.nav>
                    </>
                ) : null}
            </AnimatePresence>
        </header>
    );
};

export default HeaderComponent;
