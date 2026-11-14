import {useCallback, useEffect, useRef, useState} from 'react';
import {Link, NavLink, useLocation} from 'react-router-dom';
import {AnimatePresence, motion} from 'framer-motion';
import classNames from 'classnames';
import {useDispatch} from 'react-redux';
import {useStore} from 'store/store.config';
import {setAmbientSound, setLocale} from 'store/store.reducer';
import {Routes} from 'router/routes';
import {startAmbient, stopAmbient} from 'core/helpers/ambient-sound';
import useLocalization, {ensureLocale} from 'assets/lang';
import {ILang} from 'assets/lang/lang';
import {useHeaderStyles} from './header.style';

const LANGS: ILang[] = ['az', 'en', 'ru'];
const NAV = [
    {to: Routes.default, key: 'nav_home', end: true},
    {to: Routes.natalChart, key: 'nav_chart', end: false},
    {to: Routes.nameAnalysis, key: 'nav_name', end: false},
    {to: Routes.today, key: 'nav_today', end: false},
    {to: Routes.profiles, key: 'nav_profiles', end: false},
] as const;
// The forecast pages share one menu on wide screens (ten links do not fit in the header); the phone menu lists them all
const FORECAST = [
    {to: Routes.calendar, key: 'nav_calendar', end: false},
    {to: Routes.yearForecast, key: 'nav_year', end: false},
    {to: Routes.chooseDay, key: 'nav_choose', end: false},
    {to: Routes.transformations, key: 'nav_transform', end: false},
    {to: Routes.lifeTimeline, key: 'nav_life', end: false},
] as const;
const MOBILE_NAV = [...NAV.slice(0, 4), ...FORECAST, ...NAV.slice(4)];

const HeaderComponent = () => {
    const translate = useLocalization();
    const dispatch = useDispatch();
    const locale = useStore('locale');
    const ambientSound = useStore('ambientSound');
    const {header, inner, logo, logoMark, nav, link, active, tools, langButton, langActive, iconButton, menuButton,
        mobileNav, mobileLink, scrim, group, groupMenu, groupLink} = useHeaderStyles();
    const [menuOpen, setMenuOpen] = useState(false);
    const [groupOpen, setGroupOpen] = useState(false);
    const groupRef = useRef<HTMLDivElement>(null);
    const location = useLocation();

    // The mobile menu closes on navigation and on Escape
    useEffect(() => {
        setMenuOpen(false);
        setGroupOpen(false);
    }, [location.pathname]);

    // The forecast menu closes on Escape and on a click anywhere else
    useEffect(() => {
        if (!groupOpen) return undefined;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setGroupOpen(false);
        };
        const onClick = (e: MouseEvent) => {
            if (groupRef.current && !groupRef.current.contains(e.target as Node)) setGroupOpen(false);
        };
        window.addEventListener('keydown', onKey);
        window.addEventListener('mousedown', onClick);
        return () => {
            window.removeEventListener('keydown', onKey);
            window.removeEventListener('mousedown', onClick);
        };
    }, [groupOpen]);

    const handleGroup = useCallback(() => {
        setGroupOpen((v) => !v);
    }, []);

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

    const handleLocale = useCallback(async (e: React.MouseEvent<HTMLButtonElement>) => {
        const lang = e.currentTarget.dataset.lang as ILang;
        await ensureLocale(lang).catch(() => undefined);
        dispatch(setLocale(lang));
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

    const forecastActive = FORECAST.some((f) => location.pathname === f.to || location.pathname.startsWith(`${f.to}/`));
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
                    {NAV.slice(0, 4).map((n) => (
                        <NavLink key={n.to} to={n.to} end={n.end} className={navClass}>{translate(n.key)}</NavLink>
                    ))}
                    <div ref={groupRef} className={group}>
                        <button type='button' className={classNames(link, {[active]: forecastActive})} aria-expanded={groupOpen}
                                aria-controls='forecast-menu' aria-haspopup='true' onClick={handleGroup}>
                            {translate('nav_forecast')} <span aria-hidden='true'>▾</span>
                        </button>
                        {groupOpen ? (
                            <div id='forecast-menu' className={groupMenu}>
                                {FORECAST.map((n) => (
                                    <NavLink key={n.to} to={n.to} end={n.end} className={groupLink}>{translate(n.key)}</NavLink>
                                ))}
                            </div>
                        ) : null}
                    </div>
                    {NAV.slice(4).map((n) => (
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
                            {MOBILE_NAV.map((n) => (
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
