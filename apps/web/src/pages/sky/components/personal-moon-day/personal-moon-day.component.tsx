import {useMemo, useState} from 'react';
import {aspectPairText} from '@astra/content';
import {ASPECT_GLYPHS, aspectTone, formatClock, formatDegree, formatLocal, glyph, moonAspectKey, POINT_GLYPHS, SIGN_GLYPHS} from 'core/helpers/astro';
import {useStore} from 'store/store.config';
import TermComponent from 'core/shared/term/term.component';
import LoaderComponent from 'core/shared/loader/loader.component';
import useLocalization, {useContent} from 'assets/lang';
import {useGetMoonDay} from '../../actions/sky.query';
import {usePersonalMoonDayStyles} from './personal-moon-day.style';
import {IPersonalMoonDay} from './personal-moon-day';

// The Moon today, read in the user's own chart: the house it passes through, the mansion, and what it does in the
// next 24 hours (house and sign changes, exact aspects to natal points). Times are the viewer's local time.
const PersonalMoonDayComponent = ({input}: IPersonalMoonDay) => {
    const translate = useLocalization();
    const content = useContent();
    const locale = useStore('locale');
    const classes = usePersonalMoonDayStyles();
    // From this moment, 24 hours (the position shown is the Moon right now)
    const [start] = useState(() => {
        const d = new Date();
        d.setSeconds(0, 0);
        return d.toISOString();
    });
    const {data, isFetching, isError} = useGetMoonDay(input, start);

    const todayKey = new Date().toDateString();
    const when = (iso: string | null) => (iso && new Date(iso).toDateString() !== todayKey ? formatLocal(iso) : formatClock(iso));
    const name = (id: string | null) => (id ? content.points[id as keyof typeof content.points]?.name ?? id : '');
    const sign = (id: string | null) => (id ? content.signs[id as keyof typeof content.signs]?.name ?? id : '');
    const house = (n: number | null) => (n ? content.houses[String(n) as keyof typeof content.houses] : null);
    const houseText = (n: number | null) => (n ? (content.moonDay.house as Record<string, string>)[String(n)] : null);
    const mansion = useMemo(() => (data ? (content.moonMansions as Record<string, {name: string; meaning: string; theme: string}>)[String(data.moon.mansion)] : null),
        [data, content]);

    if (isError) return <p className={classes.muted}>{translate('moon_day_error')}</p>;
    if (!data) return isFetching ? <LoaderComponent/> : null;

    const moon = data.moon;
    const h = house(moon.house);

    return (
        <div className={classes.wrap}>
            <h3 className={classes.title}>{translate('moon_day_title')}</h3>
            <div className={classes.card}>
                <p className={classes.big}>
                    <span className={`glyph ${classes.gold}`} aria-hidden='true'>{glyph(POINT_GLYPHS.moon)}</span>
                    {' '}{translate('today_moon_in', {sign: sign(moon.sign)})}
                    <span className={classes.muted}>{` · ${formatDegree(moon.degree, moon.minute)}`}</span>
                </p>
                {h ? (
                    <>
                        <p><strong>{translate('moon_day_house', {house: h.name, theme: h.theme})}</strong></p>
                        <p className={classes.text}>{houseText(moon.house)}</p>
                    </>
                ) : <p className={classes.muted}>{translate('moon_day_no_houses')}</p>}
                {mansion ? (
                    <p className={classes.text}>
                        <TermComponent id='moonMansion'>{translate('moon_mansion_label')}</TermComponent>
                        {` ${moon.mansion}/28 · `}<strong>{mansion.name}</strong>
                        {` (${mansion.meaning}): ${mansion.theme}.`}
                    </p>
                ) : null}
            </div>

            <h4 className={classes.sub}>{translate('moon_events_title')}</h4>
            {data.events.length ? (
                <ul className={classes.list}>
                    {data.events.map((e) => (
                        <li key={`${e.type}-${e.at}-${e.point ?? e.sign ?? e.house}`} className={classes.item}>
                            <time dateTime={e.at ?? undefined} className={classes.when}>{when(e.at)}</time>
                            {e.type === 'aspect' ? (
                                <div>
                                    <p>
                                        <span className={`glyph ${classes[aspectTone(e.aspect!)]}`} aria-hidden='true'>{glyph(ASPECT_GLYPHS[e.aspect!])}</span>
                                        {` ${translate('moon_word')} `}
                                        <strong>{content.aspects[e.aspect as keyof typeof content.aspects]?.name.toLowerCase()}</strong>
                                        {` ${translate('natal_word')} `}
                                        <span className={`glyph ${classes.gold}`} aria-hidden='true'>{glyph(POINT_GLYPHS[e.point!])}</span>
                                        {` ${name(e.point)}`}
                                    </p>
                                    {moonAspectKey(e.point, e.aspect) && aspectPairText(locale, 'moon', e.point!) ? <p className={classes.text}>{aspectPairText(locale, 'moon', e.point!)}</p> : null}
                                </div>
                            ) : e.type === 'sign' ? (
                                <p>
                                    <span className={`glyph ${classes.gold}`} aria-hidden='true'>{glyph(SIGN_GLYPHS[e.sign!])}</span>
                                    {` ${translate('moon_event_sign', {sign: sign(e.sign)})}`}
                                </p>
                            ) : (
                                <div>
                                    <p>{translate('moon_event_house', {house: house(e.house)?.name ?? '', theme: house(e.house)?.theme ?? ''})}</p>
                                    <p className={classes.text}>{houseText(e.house)}</p>
                                </div>
                            )}
                        </li>
                    ))}
                </ul>
            ) : <p className={classes.muted}>{translate('moon_events_none')}</p>}
        </div>
    );
};

export default PersonalMoonDayComponent;
