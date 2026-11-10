import {useCallback, useMemo, useState} from 'react';
import {Alert, Table} from 'antd';
import type {ColumnsType} from 'antd/es/table';
import {AnimatePresence, motion} from 'framer-motion';
import classNames from 'classnames';
import {useStore} from 'store/store.config';
import {formatDegree, glyph, POINT_GLYPHS, SIGN_GLYPHS} from 'core/helpers/astro';
import LoaderComponent from 'core/shared/loader/loader.component';
import useLocalization, {useContent} from 'assets/lang';
import {useGetVedic} from '../../actions/natal-chart.query';
import {IVedicPoint} from '../../models/vedic.model';
import SouthIndianChartComponent from '../south-indian-chart/south-indian-chart.component';
import {useVedicPanelStyles} from './vedic-panel.style';

const VEDIC_GLYPHS: Record<string, string> = {...POINT_GLYPHS, rahu: POINT_GLYPHS.northNode, ketu: POINT_GLYPHS.southNode};
const toDate = (iso: string) => iso.split('-').reverse().join('.');

const VedicPanelComponent = () => {
    const translate = useLocalization();
    const content = useContent();
    const v = content.vedic;
    const classes = useVedicPanelStyles();
    const birthInput = useStore('birthInput');
    const {data: vedic} = useGetVedic(birthInput);
    const [active, setActive] = useState<string | null>(null);
    // undefined = default (the current mahadasha is open); '' = all closed
    const [open, setOpen] = useState<string | undefined>(undefined);

    const graha = useCallback((id: string) => v.grahas[id as keyof typeof v.grahas], [v]);

    const handleActivate = useCallback((e: React.SyntheticEvent<HTMLElement>) => {
        setActive(e.currentTarget.dataset.id ?? null);
    }, []);

    const currentStart = useMemo(() => vedic?.mahadashas.find((m) => m.current)?.start ?? '', [vedic]);

    const handleToggle = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
        const key = e.currentTarget.dataset.key ?? '';
        setOpen((cur) => ((cur ?? currentStart) === key ? '' : key));
    }, [currentStart]);

    const handleRow = useCallback((r: IVedicPoint) => ({
        onMouseEnter: () => setActive(r.id),
        onMouseLeave: () => setActive(null),
    }), []);

    const rowClass = useCallback((r: IVedicPoint) => (r.id === active ? classes.rowActive : ''), [active, classes.rowActive]);

    const d1 = useMemo(() => vedic?.grahas.map((g) => ({id: g.id, sign: g.sign, retrograde: g.retrograde,
        label: `${content.signs[g.sign as keyof typeof content.signs]?.name} ${formatDegree(g.degree, g.minute)}`})) ?? [], [vedic, content]);
    const d9 = useMemo(() => vedic?.grahas.map((g) => ({id: g.id, sign: g.navamsa})) ?? [], [vedic]);

    const columns: ColumnsType<IVedicPoint> = useMemo(() => [
        {
            title: translate('col_point'),
            dataIndex: 'id',
            render: (id: string) => (
                <span className={classes.cell}><span className='glyph' aria-hidden='true'>{glyph(VEDIC_GLYPHS[id])}</span>{graha(id)?.name}</span>
            ),
        },
        {
            title: translate('col_sign'),
            dataIndex: 'sign',
            render: (s: string) => (
                <span className={classes.cell}>
                    <span className='glyph' aria-hidden='true'>{glyph(SIGN_GLYPHS[s])}</span>
                    {v.rashis[s as keyof typeof v.rashis]} <span className={classes.muted}>({content.signs[s as keyof typeof content.signs]?.name})</span>
                </span>
            ),
        },
        {
            title: translate('col_position'),
            key: 'pos',
            render: (_: unknown, g) => <span>{formatDegree(g.degree, g.minute)}{g.retrograde ? <b className={classes.retro}> R</b> : null}</span>,
        },
        {
            title: translate('col_nakshatra'),
            key: 'nak',
            render: (_: unknown, g) => {
                const n = v.nakshatras[g.nakshatra.id as keyof typeof v.nakshatras];
                return <span title={n?.keywords}>{n?.name}</span>;
            },
        },
        {title: translate('col_pada'), key: 'pada', align: 'center', render: (_: unknown, g) => g.nakshatra.pada},
        {title: translate('col_lord'), key: 'lord', render: (_: unknown, g) => graha(g.nakshatra.lord)?.name},
        ...(vedic?.timeUnknown ? [] : [{title: translate('col_house'), dataIndex: 'house', align: 'center' as const}]),
        {title: translate('col_d9'), dataIndex: 'navamsa', render: (s: string) => v.rashis[s as keyof typeof v.rashis]},
        {
            title: translate('col_dignity'),
            dataIndex: 'dignity',
            render: (d: string | null) => (d ? <span className={classes.dignity}>{v.dignities[d as keyof typeof v.dignities]}</span> : '—'),
        },
    ], [translate, content, v, classes, graha, vedic?.timeUnknown]);

    if (!vedic) return <LoaderComponent/>;

    const rows = vedic.lagna ? [vedic.lagna, ...vedic.grahas] : vedic.grahas;

    return (
        <div className={classes.wrapper}>
            <header className={classes.head}>
                <h2>{translate('vedic_title')}</h2>
                <p>{translate('vedic_subtitle')}</p>
                <p className={classes.note}>
                    {translate('vedic_ayanamsa', {value: formatDegree(Math.floor(vedic.ayanamsa ?? 0), Math.floor(((vedic.ayanamsa ?? 0) % 1) * 60))})}
                    {' · '}{translate('vedic_note')}
                </p>
            </header>

            {vedic.timeUnknown ? <Alert type='info' showIcon message={translate('vedic_time_unknown')}/> : null}

            <div className={classes.charts}>
                <SouthIndianChartComponent title={translate('vedic_d1')} placements={d1} lagnaSign={vedic.lagna?.sign ?? null}
                                           activeId={active} onActivate={handleActivate}/>
                <SouthIndianChartComponent title={translate('vedic_d9')} placements={d9} lagnaSign={vedic.lagna?.navamsa ?? null}
                                           activeId={active} onActivate={handleActivate}/>
            </div>

            <section className={classes.section} aria-labelledby='vd-grahas'>
                <h3 id='vd-grahas'>{translate('vedic_grahas')}</h3>
                <Table<IVedicPoint> rowKey='id' size='small' columns={columns} dataSource={rows} pagination={false}
                                    scroll={{x: true}} onRow={handleRow} rowClassName={rowClass}/>
            </section>

            <section className={classes.section} aria-labelledby='vd-dasha'>
                <h3 id='vd-dasha'>{translate('vedic_dasha')}</h3>
                <p className={classes.muted}>
                    {translate('vedic_dasha_note', {lord: graha(vedic.dashaStartLord ?? '')?.name ?? '', years: (vedic.dashaBalanceYears ?? 0).toFixed(2)})}
                </p>
                <ol className={classes.dashas}>
                    {vedic.mahadashas.map((m) => {
                        const isOpen = (open ?? currentStart) === m.start;
                        return (
                            <li key={m.start} className={classNames(classes.dasha, {[classes.dashaCurrent]: m.current})}>
                                <button type='button' data-key={m.start}
                                        className={classes.dashaHead} aria-expanded={isOpen} onClick={handleToggle}>
                                    <span className='glyph' aria-hidden='true'>{glyph(VEDIC_GLYPHS[m.lord])}</span>
                                    <strong>{graha(m.lord)?.name}</strong>
                                    <span className={classes.muted}>{toDate(m.start)} – {toDate(m.end)} · {m.years}</span>
                                    {m.current ? <span className={classes.badge}>{translate('dasha_current')}</span> : null}
                                </button>
                                <AnimatePresence initial={false}>
                                    {isOpen ? (
                                        <motion.div initial={{height: 0, opacity: 0}} animate={{height: 'auto', opacity: 1}}
                                                    exit={{height: 0, opacity: 0}} transition={{duration: 0.3}} className={classes.dashaBody}>
                                            <p className={classes.muted}>{graha(m.lord)?.dasha}</p>
                                            <ul className={classes.antar}>
                                                {m.antardashas?.map((a) => (
                                                    <li key={a.start} className={classNames({[classes.antarCurrent]: a.current})}>
                                                        <span>{graha(m.lord)?.name.split(' ')[0]} / {graha(a.lord)?.name.split(' ')[0]}</span>
                                                        <span className={classes.muted}>{toDate(a.start)} – {toDate(a.end)}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </motion.div>
                                    ) : null}
                                </AnimatePresence>
                            </li>
                        );
                    })}
                </ol>
            </section>
        </div>
    );
};

export default VedicPanelComponent;
