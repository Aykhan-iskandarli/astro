import {useCallback} from 'react';
import {content, Content} from '@astra/content';
import {useStore} from 'store/store.config';
import {az} from './az';
import {en} from './en';
import {ILang, ITranslateParams, ITranslationKey} from './lang';

export const translations: Record<ILang, Record<ITranslationKey, string>> = {az, en};

export const format = (text: string, params?: ITranslateParams) => {
    if (!params) return text;
    return text.replace(/\{(\w+)\}/g, (_, key: string) => (key in params ? String(params[key]) : `{${key}}`));
};

const useLocalization = () => {
    const locale = useStore('locale') as ILang;

    return useCallback(
        (key: ITranslationKey, params?: ITranslateParams) => {
            return format(translations[locale]?.[key] ?? translations.az[key] ?? key, params);
        },
        [locale],
    );
};

/** Interpretation content (packages/content) in the active language. */
export const useContent = (): Content => {
    const locale = useStore('locale') as ILang;
    return content[locale] ?? content.az;
};

export default useLocalization;
