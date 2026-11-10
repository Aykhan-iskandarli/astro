import {az} from './az';

export type ILang = 'az' | 'en';
export type ITranslationKey = keyof typeof az;
export type ITranslateParams = Record<string, string | number>;
