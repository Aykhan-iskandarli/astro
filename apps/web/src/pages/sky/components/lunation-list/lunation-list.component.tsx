import {useCallback, useState} from 'react';
import {Button} from 'antd';
import {aspectPairText} from '@astra/content';
import {ASPECT_GLYPHS, aspectTone, formatDegree, formatLocal, formatOrb, glyph, moonAspectKey, POINT_GLYPHS, SIGN_GLYPHS} from 'core/helpers/astro';
import {useStore} from 'store/store.config';
import TermComponent from 'core/shared/term/term.component';
import useLocalization, {useContent} from 'assets/lang';
import {ITranslationKey} from 'assets/lang/lang';
import {PersonalLunationModel} from '../../models/personal-moon.model';
import {useLunationListStyles} from './lunation-list.style';
import {ILunationList} from './lunation-list';

const MAX_ASPECTS = 3;

// Lunations and eclipses read in a natal chart: the natal house each one falls in (with a short reading) and
// the natal points it touches. Presentational: the data comes from the Moon or the year endpoint.
const LunationListComponent = ({lunations, timeUnknown, limit, expandable}: ILunationList) => {
    const translate = useLocalization();
    const content = useContent();
    const locale = useStore('locale');
    const classes = useLunationListStyles();
    const [all, setAll] = useState(false);
    const handleAll = useCallback(() => {
        setAll(true);
    }, []);

    const name = (id: string | null) => (id ? content.points[id as keyof typeof content.points]?.name ?? id : '');
    const sign = (id: string | null) => (id ? content.signs[id as keyof typeof content.signs]?.name ?? id : '');
    const house = (n: number | null) => (n ? content.houses[String(n) as keyof typeof content.houses] : null);
    const reading = (l: PersonalLunationModel): string | null => {
        const r = content.lunationReading as {new: Record<string, string>; full: Record<string, string>;
            quarter: Record<string, string>; eclipse: Record<string, string>};
        if (l.phase === 'new' || l.phase === 'full') return l.house ? r[l.phase][String(l.house)] : null;
        return r.quarter[l.phase!] ?? null;
    };

    const items = limit && !all ? lunations.slice(0, limit) : lunations;

    return (
        <div className={classes.wrap}>
            {timeUnknown ? <p className={classes.muted}>{translate('lunation_time_unknown')}</p> : null}
            <ul className={classes.list}>
                {items.map((l) => {
                    const h = house(l.house);
                    return (
                        <li key={`${l.phase}-${l.at}`} className={`${classes.item} ${l.eclipse ? classes.eclipse : ''}`}>
                            <div className={classes.head}>
                                <strong>{translate(`lunation_${l.phase}` as ITranslationKey)}</strong>
                                {l.eclipse ? (
                                    <span className={classes.badge}>
                                        <TermComponent id='eclipse'>{translate(`eclipse_${l.eclipse.kind}` as ITranslationKey)}</TermComponent>
                                        {` (${translate(`eclipse_type_${l.eclipse.type}` as ITranslationKey)})`}
                                    </span>
                                ) : null}
                                <time dateTime={l.at ?? undefined} className={classes.when}>{formatLocal(l.at)}</time>
                            </div>
                            <p className={classes.muted}>
                                <span className='glyph' aria-hidden='true'>{glyph(SIGN_GLYPHS[l.sign!])}</span>
                                {` ${sign(l.sign)} ${formatDegree(l.degree, l.minute)}`}
                                {h ? ` · ${translate('lunation_house', {house: h.name})}` : ''}
                                {l.sunHouse ? ` · ${translate('lunation_sun_house', {house: house(l.sunHouse)?.name ?? ''})}` : ''}
                            </p>
                            {h ? <p className={classes.theme}>{h.theme}</p> : null}
                            {reading(l) ? <p>{reading(l)}</p> : null}
                            {l.eclipse ? <p className={classes.muted}>{(content.lunationReading.eclipse as Record<string, string>)[l.eclipse.kind]}</p> : null}
                            {l.aspects.length ? (
                                <ul className={classes.aspects}>
                                    {l.aspects.slice(0, MAX_ASPECTS).map((a) => (
                                        <li key={`${a.point}-${a.aspect}`}>
                                            <span className={`glyph ${classes[aspectTone(a.aspect!)]}`} aria-hidden='true'>{glyph(ASPECT_GLYPHS[a.aspect!])}</span>
                                            {` ${translate('lunation_touches', {
                                                aspect: content.aspects[a.aspect as keyof typeof content.aspects]?.name.toLowerCase() ?? '',
                                                point: name(a.point),
                                            })} `}
                                            <span className='glyph' aria-hidden='true'>{glyph(POINT_GLYPHS[a.point!])}</span>
                                            <span className={classes.muted}>{` ${formatOrb(a.orb)}`}</span>
                                            {(l.phase === 'new' || l.phase === 'full') && moonAspectKey(a.point, a.aspect) ? (
                                                <span className={classes.muted}>{aspectPairText(locale, 'moon', a.point!) ? ` · ${aspectPairText(locale, 'moon', a.point!)}` : ''}</span>
                                            ) : null}
                                        </li>
                                    ))}
                                </ul>
                            ) : null}
                        </li>
                    );
                })}
            </ul>
            {expandable && limit && !all && lunations.length > limit ? (
                <Button onClick={handleAll} className={classes.more}>
                    {translate('lunations_show_all', {n: lunations.length})}
                </Button>
            ) : null}
        </div>
    );
};

export default LunationListComponent;
