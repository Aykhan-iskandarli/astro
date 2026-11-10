import {useCallback, useRef, useState} from 'react';
import {Alert, Button, Tabs} from 'antd';
import {motion} from 'framer-motion';
import {formatDegree} from 'core/helpers/astro';
import LoaderComponent from 'core/shared/loader/loader.component';
import useLocalization, {useContent} from 'assets/lang';
import ChartWheelComponent from '../chart-wheel/chart-wheel.component';
import InterpretationPanelComponent from '../interpretation-panel/interpretation-panel.component';
import PointsTableComponent from '../points-table/points-table.component';
import HousesTableComponent from '../houses-table/houses-table.component';
import AspectGridComponent from '../aspect-grid/aspect-grid.component';
import PatternsListComponent from '../patterns-list/patterns-list.component';
import BalancePanelComponent from '../balance-panel/balance-panel.component';
import DestinyMatrixComponent from '../destiny-matrix/destiny-matrix.component';
import TransitsPanelComponent from '../transits-panel/transits-panel.component';
import SynastryPanelComponent from '../synastry-panel/synastry-panel.component';
import VedicPanelComponent from '../vedic-panel/vedic-panel.component';
import {useChartResultStyles} from './chart-result.style';
import {IChartResult} from './chart-result';

const ChartResultComponent = ({chart, matrix, matrixFailed, onEdit, onSave, saved}: IChartResult) => {
    const translate = useLocalization();
    const content = useContent();
    const classes = useChartResultStyles();
    const [hovered, setHovered] = useState<string | null>(null);
    const [selected, setSelected] = useState<string>('sun');
    const [tab, setTab] = useState<string>('natal');

    const handleTab = useCallback((key: string) => {
        setTab(key);
        // Keep the chosen tab fully visible in the swipeable strip on phones
        requestAnimationFrame(() => {
            document.querySelector('.ant-tabs-tab-active')?.scrollIntoView({block: 'nearest', inline: 'nearest'});
        });
    }, []);

    const handleActivate = useCallback((id: string | null) => {
        setHovered(id);
    }, []);

    const stageRef = useRef<HTMLDivElement>(null);

    // Selecting in a table far below the wheel: bring the wheel + interpretation into view
    const handleSelectFromTable = useCallback((id: string) => {
        setSelected(id);
        setHovered(null);
        const el = stageRef.current;
        if (el && el.getBoundingClientRect().bottom < 120) {
            el.scrollIntoView({behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start'});
        }
    }, []);

    const handleSelect = useCallback((id: string) => {
        setSelected(id);
    }, []);

    const activeId = hovered ?? selected;
    const localTime = chart.localDatetime ? chart.localDatetime.slice(11, 16) : null;
    const dateText = chart.date ? chart.date.split('-').reverse().join('.') : '';
    const utcText = chart.utcDatetime ? chart.utcDatetime.slice(11, 16) : null;
    const systemName = (s: string | null) => (s ? content.houseSystems[s as keyof typeof content.houseSystems] ?? s : '');

    return (
        <div className={classes.result}>
            <header className={classes.head}>
                <motion.p className={classes.eyebrow} initial={{opacity: 0}} animate={{opacity: 1}}>{translate('result_for')}</motion.p>
                <motion.h1 initial={{opacity: 0, y: 10}} animate={{opacity: 1, y: 0}} transition={{duration: 0.6}}>
                    {chart.name || translate('unnamed_chart')}
                </motion.h1>
                <p className={classes.meta}>
                    {dateText}
                    {localTime ? ` · ${localTime} (UTC${chart.utcOffset})` : ''}
                    {chart.place ? ` · ${chart.place}` : ''}
                    {utcText ? ` · ${translate('utc_label')} ${utcText}` : ''}
                </p>
                <p className={classes.meta}>
                    {chart.timeUnknown ? null : <>{systemName(chart.houseSystem)} · </>}
                    {translate('lunar_phase')}: {chart.lunarPhase ? content.lunarPhases[chart.lunarPhase as keyof typeof content.lunarPhases] : '—'}
                    {chart.sect ? ` · ${translate(chart.sect === 'day' ? 'sect_day' : 'sect_night')}` : ''}
                </p>
                <div className={classes.actions}>
                    <Button onClick={onEdit}>{translate('edit_data')}</Button>
                    <Button type='default' onClick={onSave} disabled={saved}>
                        {saved ? translate('saved_chart') : translate('save_chart')}
                    </Button>
                </div>
            </header>

            <div className={classes.notices}>
                {chart.timeUnknown ? (
                    <Alert type='info' showIcon message={translate('time_unknown_notice')}
                           description={chart.moonRange ? translate('moon_range', {
                               start: `${content.signs[chart.moonRange.start.sign as keyof typeof content.signs]?.name} ${formatDegree(chart.moonRange.start.degree, chart.moonRange.start.minute)}`,
                               end: `${content.signs[chart.moonRange.end.sign as keyof typeof content.signs]?.name} ${formatDegree(chart.moonRange.end.degree, chart.moonRange.end.minute)}`,
                           }) : undefined}/>
                ) : null}
                {chart.dstNote ? (
                    <Alert type='warning' showIcon message={translate(chart.dstNote === 'ambiguous' ? 'dst_ambiguous' : 'dst_nonexistent')}/>
                ) : null}
                {!chart.timeUnknown && chart.houseSystem !== chart.houseSystemRequested ? (
                    <Alert type='warning' showIcon message={translate('house_system_fallback', {
                        requested: systemName(chart.houseSystemRequested),
                        used: systemName(chart.houseSystem),
                    })}/>
                ) : null}
            </div>

            <Tabs
                className={classes.tabs}
                activeKey={tab}
                onChange={handleTab}
                size='large'
                items={[
                    {key: 'natal', label: translate('tab_natal'), children: (
                        <div className={classes.tabBody}>
                            <div ref={stageRef} className={classes.stage}>
                                <div className={classes.wheelWrap}>
                                    <ChartWheelComponent chart={chart} activeId={hovered} selectedId={selected} onActivate={handleActivate} onSelect={handleSelect}/>
                                </div>
                                <aside className={classes.side} aria-label={translate('section_interpretation')}>
                                    <InterpretationPanelComponent chart={chart} pointId={activeId}/>
                                </aside>
                            </div>

                            <section className={classes.section} aria-labelledby='sec-points'>
                                <h2 id='sec-points'>{translate('section_planets')}</h2>
                                <PointsTableComponent chart={chart} activeId={activeId} onActivate={handleActivate} onSelect={handleSelectFromTable}/>
                            </section>

                            {chart.timeUnknown ? null : (
                                <section className={classes.section} aria-labelledby='sec-houses'>
                                    <h2 id='sec-houses'>{translate('section_houses')}</h2>
                                    <HousesTableComponent chart={chart}/>
                                </section>
                            )}

                            <section className={classes.section} aria-labelledby='sec-aspects'>
                                <h2 id='sec-aspects'>{translate('section_aspects')}</h2>
                                <AspectGridComponent chart={chart} activeId={activeId} onActivate={handleActivate}/>
                            </section>

                            <section className={classes.section} aria-labelledby='sec-patterns'>
                                <h2 id='sec-patterns'>{translate('section_patterns')}</h2>
                                <PatternsListComponent patterns={chart.patterns}/>
                            </section>

                            {chart.balance ? (
                                <section className={classes.section} aria-labelledby='sec-balance'>
                                    <h2 id='sec-balance'>{translate('section_balance')}</h2>
                                    <BalancePanelComponent balance={chart.balance}/>
                                </section>
                            ) : null}
                        </div>
                    )},
                    {key: 'destiny', label: translate('tab_destiny'), children: matrix
                        ? <DestinyMatrixComponent matrix={matrix}/>
                        : matrixFailed ? <Alert type='warning' showIcon message={translate('destiny_error')}/> : <LoaderComponent/>},
                    {key: 'transits', label: translate('tab_transits'), children: <TransitsPanelComponent chart={chart}/>},
                    {key: 'vedic', label: translate('tab_vedic'), children: <VedicPanelComponent/>},
                    {key: 'synastry', label: translate('tab_synastry'), children: <SynastryPanelComponent/>},
                ]}
            />
        </div>
    );
};

export default ChartResultComponent;
