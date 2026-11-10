import {useCallback, useMemo, useState} from 'react';
import {AutoComplete, Checkbox, DatePicker, InputNumber, Segmented} from 'antd';
import type {CheckboxChangeEvent} from 'antd/es/checkbox';
import dayjs, {Dayjs} from 'dayjs';
import classNames from 'classnames';
import {useStore} from 'store/store.config';
import {ASPECT_GLYPHS, aspectTone, formatOrb, glyph} from 'core/helpers/astro';
import {useDebouncedValue} from 'core/helpers/use-debounced-value';
import LoaderComponent from 'core/shared/loader/loader.component';
import useLocalization, {useContent} from 'assets/lang';
import {useGetPlaces, useGetProgressions, useGetReturn} from '../../actions/natal-chart.query';
import {IReturnParams} from '../../actions/natal-chart.service';
import ChartWheelComponent from '../chart-wheel/chart-wheel.component';
import InterpretationPanelComponent from '../interpretation-panel/interpretation-panel.component';
import PointsTableComponent from '../points-table/points-table.component';
import {useForecastPanelStyles} from './forecast-panel.style';
import {IForecastPanel} from './forecast-panel';

type Mode = 'solar' | 'lunar' | 'progressions';
const MIN = dayjs('1800-01-01');
const MAX = dayjs('2999-12-31');

const ForecastPanelComponent = ({chart}: IForecastPanel) => {
    const translate = useLocalization();
    const content = useContent();
    const classes = useForecastPanelStyles();
    const birthInput = useStore('birthInput');
    const [mode, setMode] = useState<Mode>('solar');
    const [year, setYear] = useState<number>(dayjs().year());
    const [after, setAfter] = useState<Dayjs>(() => dayjs().startOf('day'));
    const [target, setTarget] = useState<Dayjs>(() => dayjs().startOf('day'));
    const [relocate, setRelocate] = useState(false);
    const [placeQuery, setPlaceQuery] = useState('');
    const [place, setPlace] = useState<IReturnParams['relocate']>(null);
    const [hovered, setHovered] = useState<string | null>(null);
    const [selected, setSelected] = useState<string>('sun');

    const debouncedQuery = useDebouncedValue(placeQuery, 250);
    const {data: places} = useGetPlaces(debouncedQuery);

    const params: IReturnParams = useMemo(() => (mode === 'solar'
        ? {kind: 'solar', year, relocate: relocate ? place : null}
        : {kind: 'lunar', after: after.format('YYYY-MM-DD'), relocate: relocate ? place : null}), [mode, year, after, relocate, place]);
    const {data: ret, isFetching: retBusy} = useGetReturn(birthInput, params, mode !== 'progressions');
    const {data: prog, isFetching: progBusy} = useGetProgressions(birthInput, target.endOf('day').toISOString(), mode === 'progressions');

    const name = useCallback((id: string) => content.points[id as keyof typeof content.points]?.name ?? id, [content]);

    const handleMode = useCallback((v: string | number) => {
        setMode(v as Mode);
        setHovered(null);
    }, []);
    const handleYear = useCallback((v: number | null) => {
        if (v) setYear(v);
    }, []);
    const handleAfter = useCallback((v: Dayjs | null) => {
        if (v) setAfter(v);
    }, []);
    const handleTarget = useCallback((v: Dayjs | null) => {
        if (v) setTarget(v);
    }, []);
    const handleRelocate = useCallback((e: CheckboxChangeEvent) => {
        setRelocate(e.target.checked);
    }, []);
    const handlePlaceSearch = useCallback((v: string) => {
        setPlaceQuery(v);
    }, []);
    const handlePlaceSelect = useCallback((v: string) => {
        const p = places?.find((x) => String(x.id) === v);
        if (p) {
            setPlace({latitude: p.latitude!, longitude: p.longitude!, timezone: p.timezone!, name: p.name ?? ''});
            setPlaceQuery(p.name ?? '');
        }
    }, [places]);
    const handleActivate = useCallback((id: string | null) => {
        setHovered(id);
    }, []);
    const handleSelect = useCallback((id: string) => {
        setSelected(id);
    }, []);
    const handleItemEnter = useCallback((e: React.SyntheticEvent<HTMLElement>) => {
        setHovered(e.currentTarget.dataset.id ?? null);
    }, []);
    const handleItemLeave = useCallback(() => {
        setHovered(null);
    }, []);
    const disabledDate = useCallback((d: Dayjs) => d.isBefore(MIN) || d.isAfter(MAX), []);

    const placeOptions = useMemo(() => (places ?? []).map((p) => ({
        value: String(p.id), label: [p.name, p.admin1, p.country].filter(Boolean).join(', '),
    })), [places]);

    const modes = useMemo(() => [
        {value: 'solar', label: translate('forecast_solar')},
        {value: 'lunar', label: translate('forecast_lunar')},
        {value: 'progressions', label: translate('forecast_progressions')},
    ], [translate]);

    const outer = useMemo(() => (prog?.chart ? {
        label: translate('forecast_progressed_label'),
        points: prog.chart.points,
        aspects: prog.aspectsToNatal,
    } : undefined), [prog, translate]);

    const fmtLocal = (iso: string | null) => (iso ? dayjs(iso.slice(0, 19)).format('DD.MM.YYYY HH:mm') : '');
    const arc = prog?.solarArc ?? 0;

    return (
        <div className={classes.wrapper}>
            <header className={classes.head}>
                <div>
                    <h2>{translate('forecast_title')}</h2>
                    <p>{translate('forecast_subtitle')}</p>
                </div>
                <Segmented options={modes} value={mode} onChange={handleMode} size='large'/>
            </header>

            <div className={classes.controls}>
                {mode === 'solar' ? (
                    <label className={classes.control}>
                        <span>{translate('forecast_year')}</span>
                        <InputNumber min={1800} max={2998} value={year} onChange={handleYear} size='large'/>
                    </label>
                ) : null}
                {mode === 'lunar' ? (
                    <label className={classes.control}>
                        <span>{translate('forecast_after')}</span>
                        <DatePicker value={after} onChange={handleAfter} format='DD.MM.YYYY' allowClear={false}
                                    disabledDate={disabledDate} size='large'/>
                    </label>
                ) : null}
                {mode === 'progressions' ? (
                    <label className={classes.control}>
                        <span>{translate('forecast_target')}</span>
                        <DatePicker value={target} onChange={handleTarget} format='DD.MM.YYYY' allowClear={false}
                                    disabledDate={disabledDate} size='large'/>
                    </label>
                ) : (
                    <div className={classes.control}>
                        <Checkbox checked={relocate} onChange={handleRelocate}>{translate('forecast_relocate')}</Checkbox>
                        {relocate ? (
                            <AutoComplete options={placeOptions} value={placeQuery} onSearch={handlePlaceSearch}
                                          onSelect={handlePlaceSelect} placeholder={translate('field_place_placeholder')}
                                          size='large' className={classes.place}/>
                        ) : null}
                    </div>
                )}
            </div>

            {mode !== 'progressions' ? (
                !ret?.chart ? <LoaderComponent/> : (
                    <div className={classNames(classes.body, {[classes.busy]: retBusy})}>
                        <p className={classes.info}>{translate(mode === 'solar' ? 'forecast_solar_info' : 'forecast_lunar_info')}</p>
                        <p className={classes.moment}>{translate('forecast_moment', {
                            local: fmtLocal(ret.local),
                            place: ret.placeName ?? '',
                        })}</p>
                        <div className={classes.stage}>
                            <ChartWheelComponent chart={ret.chart} activeId={hovered} selectedId={selected}
                                                 onActivate={handleActivate} onSelect={handleSelect}/>
                            <aside className={classes.sidePlain}>
                                <InterpretationPanelComponent chart={ret.chart} pointId={hovered ?? selected}/>
                            </aside>
                        </div>
                        <PointsTableComponent chart={ret.chart} activeId={hovered ?? selected} onActivate={handleActivate}
                                              onSelect={handleSelect}/>
                    </div>
                )
            ) : (
                !prog?.chart ? <LoaderComponent/> : (
                    <div className={classNames(classes.body, {[classes.busy]: progBusy})}>
                        <p className={classes.info}>{translate('forecast_progression_info')}</p>
                        <p className={classes.moment}>{translate('forecast_progressed_age', {
                            age: (prog.ageYears ?? 0).toFixed(2),
                            arc: `${Math.floor(arc)}°${String(Math.floor((arc % 1) * 60)).padStart(2, '0')}′`,
                        })}</p>
                        <div className={classes.stage}>
                            <ChartWheelComponent chart={chart} outer={outer} activeId={hovered} selectedId={null}
                                                 onActivate={handleActivate} onSelect={handleActivate}/>
                            <aside className={classes.side}>
                                <h3>{translate('forecast_progressed_aspects')}</h3>
                                {prog.aspectsToNatal.length ? (
                                    <ul className={classes.list}>
                                        {prog.aspectsToNatal.map((a) => {
                                            const info = content.aspects[a.type as keyof typeof content.aspects];
                                            const id = `o:${a.p1}`;
                                            return (
                                                <li key={`${a.p1}-${a.p2}`} data-id={id} tabIndex={0}
                                                    className={classNames({[classes.itemActive]: hovered === id || hovered === a.p2})}
                                                    onMouseEnter={handleItemEnter} onMouseLeave={handleItemLeave}
                                                    onFocus={handleItemEnter} onBlur={handleItemLeave}>
                                                    <span className={classNames('glyph', classes.aspectGlyph, classes[aspectTone(a.type!)])} aria-hidden='true'>
                                                        {glyph(ASPECT_GLYPHS[a.type!])}
                                                    </span>
                                                    <span>
                                                        <strong>{translate('progressed_line', {progressed: name(a.p1!), natal: name(a.p2!)})}</strong>
                                                        <br/>
                                                        <span className={classes.meta}>{info?.name} · {translate('col_orb')} {formatOrb(a.orb!)}
                                                            {a.applying !== null ? ` · ${translate(a.applying ? 'applying' : 'separating')}` : ''}</span>
                                                        <br/>
                                                        <span className={classes.muted}>{info?.meaning}</span>
                                                    </span>
                                                </li>
                                            );
                                        })}
                                    </ul>
                                ) : <p className={classes.muted}>{translate('forecast_no_aspects')}</p>}
                            </aside>
                        </div>
                        <h3 className={classes.subhead}>{translate('forecast_positions')}</h3>
                        <PointsTableComponent chart={prog.chart} activeId={hovered} onActivate={handleActivate} onSelect={handleActivate}/>
                    </div>
                )
            )}
        </div>
    );
};

export default ForecastPanelComponent;
