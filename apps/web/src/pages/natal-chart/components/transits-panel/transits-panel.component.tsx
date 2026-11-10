import {useCallback, useMemo, useState} from 'react';
import {Button, DatePicker, Table} from 'antd';
import type {ColumnsType} from 'antd/es/table';
import dayjs, {Dayjs} from 'dayjs';
import classNames from 'classnames';
import {useStore} from 'store/store.config';
import {ASPECT_GLYPHS, aspectTone, formatDegree, formatOrb, glyph, POINT_GLYPHS, SIGN_GLYPHS} from 'core/helpers/astro';
import LoaderComponent from 'core/shared/loader/loader.component';
import useLocalization, {useContent} from 'assets/lang';
import {useGetTransits} from '../../actions/natal-chart.query';
import {ChartPointModel} from '../../models/natal-chart.model';
import ChartWheelComponent from '../chart-wheel/chart-wheel.component';
import {useTransitsPanelStyles} from './transits-panel.style';
import {ITransitsPanel} from './transits-panel';

const MIN = dayjs('1800-01-01');
const MAX = dayjs('2999-12-31');

const TransitsPanelComponent = ({chart}: ITransitsPanel) => {
    const translate = useLocalization();
    const content = useContent();
    const classes = useTransitsPanelStyles();
    const birthInput = useStore('birthInput');
    const [moment, setMoment] = useState<Dayjs>(() => dayjs().second(0).millisecond(0));
    const [hovered, setHovered] = useState<string | null>(null);

    const {data: transits, isFetching} = useGetTransits(birthInput, moment.toISOString());

    const name = useCallback((id: string) => content.points[id as keyof typeof content.points]?.name ?? id, [content]);

    const handleDate = useCallback((value: Dayjs | null) => {
        if (value) setMoment(value.second(0).millisecond(0));
    }, []);

    const handleNow = useCallback(() => {
        setMoment(dayjs().second(0).millisecond(0));
    }, []);

    const handleActivate = useCallback((id: string | null) => {
        setHovered(id);
    }, []);

    const handleSelect = useCallback((id: string) => {
        setHovered(id);
    }, []);

    const handleItemEnter = useCallback((e: React.SyntheticEvent<HTMLElement>) => {
        setHovered(e.currentTarget.dataset.id ?? null);
    }, []);

    const handleItemLeave = useCallback(() => {
        setHovered(null);
    }, []);

    const disabledDate = useCallback((d: Dayjs) => d.isBefore(MIN) || d.isAfter(MAX), []);

    const outer = useMemo(() => (transits
        ? {label: translate('transit_label'), points: transits.points, aspects: transits.aspects}
        : undefined), [transits, translate]);

    const columns: ColumnsType<ChartPointModel> = useMemo(() => [
        {
            title: translate('col_point'),
            dataIndex: 'id',
            render: (id: string) => (
                <span className={classes.cell}><span className='glyph' aria-hidden='true'>{glyph(POINT_GLYPHS[id])}</span>{name(id)}</span>
            ),
        },
        {
            title: translate('col_sign'),
            dataIndex: 'sign',
            render: (sign: string) => (
                <span className={classes.cell}>
                    <span className='glyph' aria-hidden='true'>{glyph(SIGN_GLYPHS[sign])}</span>
                    {content.signs[sign as keyof typeof content.signs]?.name}
                </span>
            ),
        },
        {
            title: translate('col_position'),
            key: 'pos',
            render: (_: unknown, p) => (
                <span>{formatDegree(p.degree, p.minute)}{p.retrograde ? <abbr className={classes.retro} title={translate('retrograde')}> {translate('retrograde_short')}</abbr> : null}</span>
            ),
        },
        ...(chart.timeUnknown ? [] : [{title: translate('col_natal_house'), dataIndex: 'house', align: 'center' as const}]),
    ], [translate, content, classes, name, chart.timeUnknown]);

    return (
        <div className={classes.wrapper}>
            <header className={classes.head}>
                <div>
                    <h2>{translate('transits_title')}</h2>
                    <p>{translate('transits_subtitle')}</p>
                </div>
                <div className={classes.controls}>
                    <label className={classes.label} htmlFor='transit-date'>{translate('transits_date')}</label>
                    <div className={classes.controlRow}>
                        <DatePicker id='transit-date' showTime={{format: 'HH:mm'}} format='DD.MM.YYYY HH:mm' value={moment}
                                    onChange={handleDate} disabledDate={disabledDate} allowClear={false} size='large'
                                    needConfirm={false}/>
                        <Button size='large' onClick={handleNow}>{translate('transits_now')}</Button>
                    </div>
                </div>
            </header>

            {!transits ? <LoaderComponent/> : (
                <>
                    <div className={classNames(classes.stage, {[classes.busy]: isFetching})}>
                        <ChartWheelComponent chart={chart} outer={outer} activeId={hovered} selectedId={null}
                                             onActivate={handleActivate} onSelect={handleSelect}/>
                        <aside className={classes.side} aria-label={translate('transit_aspects')}>
                            <h3>{translate('transit_aspects')}</h3>
                            {transits.aspects.length ? (
                                <ul className={classes.list}>
                                    {transits.aspects.map((a) => {
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
                                                    <strong>{translate('transit_aspect_line', {transit: name(a.p1!), natal: name(a.p2!)})}</strong>
                                                    <br/>
                                                    <span className={classes.meta}>
                                                        {info?.name} · {translate('col_orb')} {formatOrb(a.orb!)}
                                                        {a.applying !== null ? ` · ${translate(a.applying ? 'applying' : 'separating')}` : ''}
                                                    </span>
                                                    <br/>
                                                    <span className={classes.muted}>{info?.meaning}</span>
                                                </span>
                                            </li>
                                        );
                                    })}
                                </ul>
                            ) : <p className={classes.muted}>{translate('no_transit_aspects')}</p>}
                            <p className={classes.note}>{translate('transits_orb_note')}</p>
                        </aside>
                    </div>

                    <section className={classes.section} aria-labelledby='tr-positions'>
                        <h3 id='tr-positions'>{translate('transit_positions')}</h3>
                        <Table<ChartPointModel> rowKey='id' size='small' columns={columns} dataSource={transits.points}
                                                pagination={false} scroll={{x: true}}/>
                    </section>
                </>
            )}
        </div>
    );
};

export default TransitsPanelComponent;
