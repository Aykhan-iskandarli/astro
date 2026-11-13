import {useCallback, useMemo, useState} from 'react';
import {AutoComplete} from 'antd';
import {useStore} from 'store/store.config';
import {glyph, POINT_GLYPHS} from 'core/helpers/astro';
import {useDebouncedValue} from 'core/helpers/use-debounced-value';
import LoaderComponent from 'core/shared/loader/loader.component';
import useLocalization, {useContent} from 'assets/lang';
import {useGetPlaces} from 'pages/natal-chart/actions/natal-chart.query';
import {useExtrasStyles} from 'pages/natal-chart/components/extras-ui/extras.style';
import {useGetSkyDay} from '../../actions/sky.query';
import {IMoonPlace} from '../../actions/sky.service';

const BAKU: IMoonPlace = {name: 'Bakı', latitude: 40.37767, longitude: 49.89201, timezone: 'Asia/Baku'};

// Today at a city: Vedic Panchang (at sunrise) and the 24 planetary hours.
const DayPanelComponent = () => {
    const translate = useLocalization();
    const content = useContent();
    const classes = useExtrasStyles();
    const birthInput = useStore('birthInput');
    const [place, setPlace] = useState<IMoonPlace>(() => (birthInput
        ? {name: birthInput.place, latitude: birthInput.latitude, longitude: birthInput.longitude, timezone: birthInput.timezone}
        : BAKU));
    const [query, setQuery] = useState('');
    const debounced = useDebouncedValue(query, 250);
    const {data: places} = useGetPlaces(debounced);
    const today = new Intl.DateTimeFormat('en-CA', {timeZone: place.timezone}).format(new Date());
    const {data, isError} = useGetSkyDay(today, place);

    const handleSelect = useCallback((value: string) => {
        const p = places?.find((x) => String(x.id) === value);
        if (!p) return;
        setPlace({name: [p.name, p.country].filter(Boolean).join(', '), latitude: p.latitude!, longitude: p.longitude!, timezone: p.timezone!});
        setQuery('');
    }, [places]);
    const options = useMemo(() => (places ?? []).map((p) => ({value: String(p.id), label: [p.name, p.admin1, p.country].filter(Boolean).join(', ')})), [places]);
    const time = (iso: string) => new Intl.DateTimeFormat('en-GB', {hour: '2-digit', minute: '2-digit', timeZone: place.timezone}).format(new Date(iso));
    const name = (id: string) => content.points[id as keyof typeof content.points]?.name ?? id;
    const nowIso = new Date().toISOString();
    const nakId = data?.panchang?.nakshatra?.id;
    const nakName = nakId ? content.vedic.nakshatras[nakId as keyof typeof content.vedic.nakshatras]?.name ?? nakId : '—';

    return (
        <section className={classes.wrapper} aria-labelledby='sec-day'>
            <h2 id='sec-day'>{translate('day_title')}</h2>
            <div className={classes.controls}>
                <label htmlFor='day-city' style={{minWidth: 260}}>
                    {translate('moon_city', {city: place.name})}
                    <AutoComplete id='day-city' options={options} value={query} onSearch={setQuery} onSelect={handleSelect}
                                  placeholder={translate('field_place_placeholder')} size='large'/>
                </label>
            </div>
            {isError ? <p className={classes.text}>{translate('today_error')}</p> : !data ? <LoaderComponent/> : (
                <div className={classes.grid}>
                    {data.panchang ? (
                        <article className={classes.card}>
                            <p className={classes.title}>{translate('day_panchang')}</p>
                            <ul className={classes.list}>
                                <li><b>Vara:</b> {data.panchang.vara}</li>
                                <li><b>Tithi:</b> {data.panchang.tithi.number}. {data.panchang.tithi.name} ({data.panchang.tithi.paksha === 'shukla' ? 'Shukla' : 'Krishna'} paksha)</li>
                                <li><b>Nakshatra:</b> {nakName}{data.panchang.nakshatra?.pada ? ` · pada ${data.panchang.nakshatra.pada}` : ''}</li>
                                <li><b>Yoga:</b> {data.panchang.yoga.number}. {data.panchang.yoga.name}</li>
                                <li><b>Karana:</b> {data.panchang.karana.name}</li>
                            </ul>
                            <p className={classes.small}>{translate('day_panchang_note', {sunrise: time(data.sunrise)})}</p>
                        </article>
                    ) : null}
                    <article className={classes.card}>
                        <p className={classes.title}>{translate('day_hours')}</p>
                        <p className={classes.small}>
                            {translate('day_ruler')}: <span className='glyph' aria-hidden='true'>{glyph(POINT_GLYPHS[data.dayRuler ?? ''])}</span> {name(data.dayRuler ?? '')}
                            {' · '}{translate('day_sun', {rise: time(data.sunrise), set: time(data.sunset)})}
                        </p>
                        <div className={classes.tableWrap}>
                            <table className={classes.table}>
                                <tbody>
                                    {data.hours.map((h) => (
                                        <tr key={h.index} data-hot={h.start <= nowIso && nowIso < h.end}>
                                            <td>{h.index}</td>
                                            <td>{time(h.start)} – {time(h.end)}</td>
                                            <td><span className='glyph' aria-hidden='true'>{glyph(POINT_GLYPHS[h.ruler])}</span> {name(h.ruler)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <p className={classes.small}>{translate('day_hours_note')}</p>
                    </article>
                </div>
            )}
        </section>
    );
};

export default DayPanelComponent;
