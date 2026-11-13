import {useCallback, useMemo, useState} from 'react';
import {AutoComplete, Button} from 'antd';
import classNames from 'classnames';
import {useStore} from 'store/store.config';
import {glyph, SIGN_GLYPHS} from 'core/helpers/astro';
import {useDebouncedValue} from 'core/helpers/use-debounced-value';
import LoaderComponent from 'core/shared/loader/loader.component';
import useLocalization, {useContent} from 'assets/lang';
import {ITranslationKey} from 'assets/lang/lang';
import {useGetPlaces} from 'pages/natal-chart/actions/natal-chart.query';
import {useGetMoonCalendar} from 'pages/sky/actions/sky.query';
import {IMoonPlace} from 'pages/sky/actions/sky.service';
import {IMoonDay} from 'pages/sky/models/moon-calendar.model';
import {useMoonCalendarStyles} from './moon-calendar.style';

const BAKU: IMoonPlace = {name: 'Bakı', latitude: 40.37767, longitude: 49.89201, timezone: 'Asia/Baku'};
const PHASE_ICONS: Record<string, string> = {
    newMoon: '🌑', waxingCrescent: '🌒', firstQuarter: '🌓', waxingGibbous: '🌔',
    fullMoon: '🌕', disseminating: '🌖', lastQuarter: '🌗', balsamic: '🌘',
};
const pad = (n: number) => String(n).padStart(2, '0');

// Moon calendar for a month and a city: lunar days (from moonrise), Moon sign, phase and void-of-course Moon.
const MoonCalendarComponent = () => {
    const translate = useLocalization();
    const content = useContent();
    const classes = useMoonCalendarStyles();
    const birthInput = useStore('birthInput');

    const now = new Date();
    const [ym, setYm] = useState({y: now.getFullYear(), m: now.getMonth()});
    const [place, setPlace] = useState<IMoonPlace>(() => (birthInput
        ? {name: birthInput.place, latitude: birthInput.latitude, longitude: birthInput.longitude, timezone: birthInput.timezone}
        : BAKU));
    const [query, setQuery] = useState('');
    const debounced = useDebouncedValue(query, 250);
    const {data: places} = useGetPlaces(debounced);

    const start = `${ym.y}-${pad(ym.m + 1)}-01`;
    const next = ym.m === 11 ? {y: ym.y + 1, m: 0} : {y: ym.y, m: ym.m + 1};
    const end = `${next.y}-${pad(next.m + 1)}-01`;
    const {data, isError} = useGetMoonCalendar(start, end, place);

    const handlePrev = useCallback(() => setYm(({y, m}) => (m === 0 ? {y: y - 1, m: 11} : {y, m: m - 1})), []);
    const handleNext = useCallback(() => setYm(({y, m}) => (m === 11 ? {y: y + 1, m: 0} : {y, m: m + 1})), []);
    const handleSelect = useCallback((value: string) => {
        const p = places?.find((x) => String(x.id) === value);
        if (!p) return;
        setPlace({name: [p.name, p.country].filter(Boolean).join(', '), latitude: p.latitude!, longitude: p.longitude!, timezone: p.timezone!});
        setQuery('');
    }, [places]);
    const options = useMemo(() => (places ?? []).map((p) => ({
        value: String(p.id), label: [p.name, p.admin1, p.country].filter(Boolean).join(', '),
    })), [places]);

    const tz = data?.timezone ?? place.timezone;
    const time = (iso: string) => new Intl.DateTimeFormat('en-GB', {hour: '2-digit', minute: '2-digit', timeZone: tz}).format(new Date(iso));
    const dayOf = (iso: string) => new Intl.DateTimeFormat('en-CA', {timeZone: tz}).format(new Date(iso)); // YYYY-MM-DD
    const when = (iso: string, day: string) => (dayOf(iso) === day ? time(iso) : `${time(iso)} (${dayOf(iso).slice(8)}.${dayOf(iso).slice(5, 7)})`);
    // Own weekday names: some browsers ship no Azerbaijani ICU data and fall back to English abbreviations
    const weekday = (d: string) => translate(`weekday_${new Date(`${d}T12:00:00Z`).getUTCDay()}` as ITranslationKey);
    const signName = (s: string) => content.signs[s as keyof typeof content.signs]?.name ?? s;
    const todayKey = new Intl.DateTimeFormat('en-CA', {timeZone: tz}).format(now);

    // Void-of-course periods touching a given local day
    const vocFor = (day: IMoonDay) => (data?.voidOfCourse ?? []).filter((v) => dayOf(v.start) <= day.date && dayOf(v.end) >= day.date);
    // The sign the Moon is in at local noon decides the "good for" text
    const noonSign = (day: IMoonDay) => {
        const noon = `${day.date}T12:00`;
        const after = day.signs.filter((s) => s.from && `${dayOf(s.from)}T${time(s.from)}` <= noon);
        return (after.length ? after[after.length - 1] : day.signs[0]).sign;
    };

    return (
        <div className={classes.wrapper}>
            <div className={classes.toolbar}>
                <div className={classes.monthSwitch}>
                    <Button onClick={handlePrev} aria-label={translate('calendar_prev')} disabled={ym.y <= 1800 && ym.m === 0}>‹</Button>
                    <strong aria-live='polite'>{translate(`month_${ym.m + 1}` as ITranslationKey)} {ym.y}</strong>
                    <Button onClick={handleNext} aria-label={translate('calendar_next')} disabled={ym.y >= 2998 && ym.m === 11}>›</Button>
                </div>
                <label className={classes.city} htmlFor='moon-city'>
                    {translate('moon_city', {city: place.name})}
                    <AutoComplete id='moon-city' options={options} value={query} onSearch={setQuery} onSelect={handleSelect}
                                  placeholder={translate('field_place_placeholder')} size='large'/>
                </label>
            </div>

            <p className={classes.info}>{content.moonCalendar.lunarDay}</p>
            <p className={classes.info}>{content.moonCalendar.voc}</p>

            {isError ? <p className={classes.muted}>{translate('today_error')}</p> : null}
            {!data ? <LoaderComponent/> : (
                <ol className={classes.days}>
                    {data.days.map((d) => {
                        const voc = vocFor(d);
                        const lastDay = d.lunarDays[d.lunarDays.length - 1];
                        const sign = noonSign(d);
                        return (
                            <li key={d.date} className={classNames(classes.day, {[classes.today]: d.date === todayKey})}>
                                <header className={classes.dayHead}>
                                    <span className={classes.date}>{Number(d.date.slice(8))}</span>
                                    <span className={classes.weekday}>{weekday(d.date)}</span>
                                    <span className={classes.phase}>
                                        <span className={classes.moonIcon} aria-hidden='true'>{PHASE_ICONS[d.phase]}</span>
                                        {content.moonCalendar.phases[d.phase as keyof typeof content.moonCalendar.phases]} · {Math.round(d.illumination * 100)}%
                                    </span>
                                </header>
                                <p className={classes.line}>
                                    <b>{translate('moon_lunar_day')}:</b>{' '}
                                    {d.lunarDays.map((l, i) => (
                                        <span key={`${l.number}-${i}`}>
                                            {i ? ' → ' : ''}{l.number}{l.start ? ` (${translate('moon_from', {time: time(l.start)})})` : ''}
                                        </span>
                                    ))}
                                </p>
                                {lastDay ? <p className={classes.muted}>{content.moonCalendar.days[String(lastDay.number) as keyof typeof content.moonCalendar.days]}</p> : null}
                                <p className={classes.line}>
                                    <b>{translate('moon_sign')}:</b>{' '}
                                    {d.signs.map((s, i) => (
                                        <span key={`${s.sign}-${i}`}>
                                            {i ? ' → ' : ''}<span className='glyph' aria-hidden='true'>{glyph(SIGN_GLYPHS[s.sign])}</span> {signName(s.sign)}
                                            {s.from ? ` (${time(s.from)})` : ''}
                                        </span>
                                    ))}
                                </p>
                                <p className={classes.muted}>{content.moonCalendar.moonSigns[sign as keyof typeof content.moonCalendar.moonSigns]}</p>
                                {voc.map((v) => (
                                    <p key={v.start} className={classes.voc}>
                                        {translate('moon_voc', {from: when(v.start, d.date), to: when(v.end, d.date)})}
                                    </p>
                                ))}
                            </li>
                        );
                    })}
                </ol>
            )}
            <p className={classes.note}>{translate('moon_note', {tz})}</p>
        </div>
    );
};

export default MoonCalendarComponent;
