import {ITranslationKey} from 'assets/lang/lang';

export interface ISeo {
    titleKey: ITranslationKey;
    descriptionKey: ITranslationKey;
    path: string;
    image?: string;
    noIndex?: boolean;
    jsonLd?: Record<string, unknown>;
}
