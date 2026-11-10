import {ITranslateParams, ITranslationKey} from 'assets/lang/lang';
import {SkyEventModel} from '../../models/sky.model';

type Translate = (key: ITranslationKey, params?: ITranslateParams) => string;
type Names = {point: (id: string | null) => string; sign: (id: string | null) => string};

/** One-line label for a sky event (lunation, station, ingress, eclipse). No inflection needed. */
export const eventLabel = (e: SkyEventModel, translate: Translate, names: Names): string => {
    if (e.kind === 'new' || e.kind === 'first_quarter' || e.kind === 'full' || e.kind === 'last_quarter') {
        return `${translate(`lunation_${e.kind}` as ITranslationKey)} · ${names.sign(e.sign)}`;
    }
    if (e.kind === 'solar' || e.kind === 'lunar') {
        return `${translate(`eclipse_${e.kind}` as ITranslationKey)} (${translate(`eclipse_type_${e.type}` as ITranslationKey)}) · ${names.sign(e.sign)}`;
    }
    if (e.kind === 'station' || e.type === 'SR' || e.type === 'SD') {
        return translate(e.type === 'SR' ? 'station_retrograde' : 'station_direct', {planet: names.point(e.planet)});
    }
    if (e.kind === 'ingress') {
        return `${names.point(e.planet)} → ${names.sign(e.sign)}${e.retrograde ? ` (${translate('retrograde_word')})` : ''}`;
    }
    return e.kind ?? '';
};
