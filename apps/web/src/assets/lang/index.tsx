import {useCallback, useEffect, useSyncExternalStore} from 'react';
import {Content, ContentLang, getContent, isContentLoaded, loadContent} from '@astra/content';
import {useStore} from 'store/store.config';
import {az} from './az';
import {ILang, ITranslateParams, ITranslationKey} from './lang';

type Dictionary = Record<ITranslationKey, string>;

/**
 * UI strings per language. Azerbaijani (default, prerendered) is bundled; other languages are loaded on demand
 * together with their interpretation content, so a visitor downloads only the language they use.
 */
export const translations: Partial<Record<ILang, Dictionary>> = {az};

const uiLoaders: Record<Exclude<ILang, 'az'>, () => Promise<Dictionary>> = {
    en: () => import('./en').then((m) => m.en),
    ru: () => import('./ru').then((m) => m.ru),
};

// Tiny change notifier so components re-render when a language finishes loading
let version = 0;
const listeners = new Set<() => void>();
const subscribe = (fn: () => void) => {
    listeners.add(fn);
    return () => listeners.delete(fn);
};
const getVersion = () => version;

export const isLocaleReady = (lang: ILang) => Boolean(translations[lang]) && isContentLoaded(lang as ContentLang);

/** Load a language's UI strings and content (no-op when already loaded). */
export const ensureLocale = async (lang: ILang) => {
    if (isLocaleReady(lang)) return;
    const [dict] = await Promise.all([
        translations[lang] ? Promise.resolve(translations[lang]!) : uiLoaders[lang as Exclude<ILang, 'az'>](),
        loadContent(lang as ContentLang),
    ]);
    translations[lang] = dict;
    version += 1;
    listeners.forEach((fn) => fn());
};

export const format = (text: string, params?: ITranslateParams) => {
    if (!params) return text;
    return text.replace(/\{(\w+)\}/g, (_, key: string) => (key in params ? String(params[key]) : `{${key}}`));
};

/** Non-hook lookup (e.g. inside the axios interceptor); falls back to Azerbaijani until the language loads. */
export const translateFor = (lang: ILang, key: ITranslationKey, params?: ITranslateParams) =>
    format(translations[lang]?.[key] ?? az[key] ?? key, params);

const useResources = (locale: ILang) => {
    const v = useSyncExternalStore(subscribe, getVersion, getVersion);
    useEffect(() => {
        ensureLocale(locale).catch(() => undefined); // stays on the Azerbaijani fallback if loading fails
    }, [locale]);
    return v;
};

const useLocalization = () => {
    const locale = useStore('locale') as ILang;
    const v = useResources(locale);

    return useCallback(
        (key: ITranslationKey, params?: ITranslateParams) => translateFor(locale, key, params),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [locale, v],
    );
};

/** Interpretation content (packages/content) in the active language. */
export const useContent = (): Content => {
    const locale = useStore('locale') as ILang;
    useResources(locale);
    return getContent(locale as ContentLang);
};

export default useLocalization;
