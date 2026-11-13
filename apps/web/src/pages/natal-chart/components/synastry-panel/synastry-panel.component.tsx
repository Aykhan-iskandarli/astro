import {useCallback, useMemo, useState} from 'react';
import {Alert, Button, Segmented} from 'antd';
import {motion} from 'framer-motion';
import classNames from 'classnames';
import {useStore} from 'store/store.config';
import {IBirthInput} from 'store/store';
import {ASPECT_GLYPHS, aspectTone, formatOrb, glyph, POINT_GLYPHS} from 'core/helpers/astro';
import LoaderComponent from 'core/shared/loader/loader.component';
import colors from 'assets/styles/abstracts/color';
import useLocalization, {useContent} from 'assets/lang';
import {ITranslationKey} from 'assets/lang/lang';
import {useCreateSynastry} from '../../actions/natal-chart.mutation';
import {AspectModel, ChartPointModel} from '../../models/natal-chart.model';
import {IOverlay} from '../../models/synastry.model';
import ChartWheelComponent from '../chart-wheel/chart-wheel.component';
import BirthFormComponent from '../birth-form/birth-form.component';
import SavedChartsComponent from '../saved-charts/saved-charts.component';
import CompositeViewComponent from '../composite-view/composite-view.component';
import CompatSummaryComponent from '../compat-summary/compat-summary.component';
import {useSynastryPanelStyles} from './synastry-panel.style';

const ELEMENT_COLORS: Record<string, string> = {fire: colors.fire, earth: colors.earth, air: colors.air, water: colors.water};

const SynastryPanelComponent = () => {
    const translate = useLocalization();
    const content = useContent();
    const classes = useSynastryPanelStyles();
    const birthInput = useStore('birthInput');
    const [partner, setPartner] = useState<IBirthInput | null>(null);
    const [hovered, setHovered] = useState<string | null>(null);
    const [view, setView] = useState<'synastry' | 'composite' | 'davison'>('synastry');

    const handleView = useCallback((v: string | number) => {
        setView(v as 'synastry' | 'composite' | 'davison');
    }, []);
    const {mutate: createSynastry, data: result, isPending, reset} = useCreateSynastry();

    const name = useCallback((id: string) => content.points[id as keyof typeof content.points]?.name ?? id, [content]);
    const firstName = birthInput?.name || translate('you_default');
    const secondName = partner?.name || translate('partner_default');

    const handlePartner = useCallback((input: IBirthInput) => {
        if (!birthInput) return;
        setPartner(input);
        createSynastry({first: birthInput, second: input});
    }, [birthInput, createSynastry]);

    const handleChange = useCallback(() => {
        reset();
        setPartner(null);
        setHovered(null);
    }, [reset]);

    const handleActivate = useCallback((id: string | null) => {
        setHovered(id);
    }, []);

    const handleItemEnter = useCallback((e: React.SyntheticEvent<HTMLElement>) => {
        setHovered(e.currentTarget.dataset.id ?? null);
    }, []);

    const handleItemLeave = useCallback(() => {
        setHovered(null);
    }, []);

    // Bi-wheel convention: outer ring = partner, aspects as (outer p1, inner p2)
    const outer = useMemo(() => (result?.second ? {
        label: secondName,
        // Partner ASC/MC are drawn too: aspects to them appear in the list and must light up on the wheel
        points: [...result.second.points, ...result.second.angles
            .filter((a) => a.id === 'asc' || a.id === 'mc')
            .map((a) => new ChartPointModel({...a, kind: 'angle'}))],
        aspects: result.aspects.map((a) => new AspectModel({p1: a.p2, p2: a.p1, type: a.type, orb: a.orb, major: a.major})),
    } : undefined), [result, secondName]);

    const overlay = (rows: IOverlay[] | null, who: string, whose: string) => (
        <div className={classes.overlay}>
            <h4>{translate('synastry_overlay', {who, whose})}</h4>
            {rows ? (
                <ul>
                    {rows.map((o) => (
                        <li key={o.id}>
                            <span className='glyph' aria-hidden='true'>{glyph(POINT_GLYPHS[o.id])}</span>
                            <span>{name(o.id)}</span>
                            <span className={classes.muted}>{content.houses[String(o.house) as keyof typeof content.houses]?.name}</span>
                        </li>
                    ))}
                </ul>
            ) : <p className={classes.muted}>{translate('no_houses')}</p>}
        </div>
    );

    return (
        <div className={classes.wrapper}>
            <header className={classes.head}>
                <div>
                    <h2>{translate('synastry_title')}</h2>
                    <p>{translate('synastry_subtitle')}</p>
                </div>
                {result ? <Button size='large' onClick={handleChange}>{translate('synastry_change_partner')}</Button> : null}
            </header>

            {!result ? (
                <div className={classes.formCard}>
                    <h3>{translate('partner_form_title')}</h3>
                    {isPending ? <LoaderComponent/> : (
                        <BirthFormComponent initialValue={null} loading={isPending} onSubmit={handlePartner}
                                            submitLabel={translate('synastry_submit')}/>
                    )}
                    <SavedChartsComponent onOpen={handlePartner}/>
                </div>
            ) : (
                <>
                    <Segmented className={classes.viewSwitch} size='large' value={view} onChange={handleView} options={[
                        {value: 'synastry', label: translate('synastry_view')},
                        {value: 'composite', label: translate('composite_view')},
                        {value: 'davison', label: translate('davison_view')},
                    ]}/>
                    {view !== 'synastry' ? <CompositeViewComponent first={birthInput} second={partner} kind={view}/> : (
                    <>
                    <section className={classes.score} aria-labelledby='syn-score'>
                        <motion.div className={classes.scoreValue} initial={{scale: 0.6, opacity: 0}} animate={{scale: 1, opacity: 1}}
                                    transition={{duration: 0.6, ease: [0.22, 1, 0.36, 1]}}>
                            {result.scoreValue}
                        </motion.div>
                        <div>
                            <h3 id='syn-score'>{translate('synastry_score')}: {translate(`score_${result.scoreLevel}` as ITranslationKey)}</h3>
                            <p className={classes.muted}>{firstName} · {secondName}</p>
                            <ul className={classes.rules}>
                                {result.scoreBreakdown.map((r, i) => (
                                    <li key={`${r.rule}-${i}`} title={r.details}>
                                        <span>{translate(`rule_${r.rule}` as ITranslationKey)}</span>
                                        <b>+{r.points}</b>
                                    </li>
                                ))}
                            </ul>
                            {result.scoreExcluded.length ? <Alert type='info' showIcon title={translate('synastry_time_note')}/> : null}
                            <p className={classes.note}>{translate('synastry_score_method')}</p>
                        </div>
                    </section>

                    <div className={classes.stage}>
                        <ChartWheelComponent chart={result.first!} outer={outer} activeId={hovered} selectedId={null}
                                             onActivate={handleActivate} onSelect={handleActivate}/>
                        <aside className={classes.side} aria-label={translate('synastry_aspects')}>
                            <h3>{translate('synastry_aspects')}</h3>
                            <ul className={classes.list}>
                                {result.aspects.map((a) => {
                                    const info = content.aspects[a.type as keyof typeof content.aspects];
                                    return (
                                        <li key={`${a.p1}-${a.p2}`} data-id={`o:${a.p2}`} tabIndex={0}
                                            className={classNames({[classes.itemActive]: hovered === `o:${a.p2}` || hovered === a.p1})}
                                            onMouseEnter={handleItemEnter} onMouseLeave={handleItemLeave}
                                            onFocus={handleItemEnter} onBlur={handleItemLeave}>
                                            <span className={classNames('glyph', classes.aspectGlyph, classes[aspectTone(a.type!)])} aria-hidden='true'>
                                                {glyph(ASPECT_GLYPHS[a.type!])}
                                            </span>
                                            <span>
                                                <strong>{`${firstName}: ${name(a.p1!)} — ${secondName}: ${name(a.p2!)}`}</strong>
                                                <br/>
                                                <span className={classes.meta}>{info?.name} · {translate('col_orb')} {formatOrb(a.orb!)}</span>
                                                <br/>
                                                <span className={classes.muted}>{info?.meaning}</span>
                                            </span>
                                        </li>
                                    );
                                })}
                            </ul>
                        </aside>
                    </div>

                    <section className={classes.section}>
                        <div className={classes.overlays}>
                            {overlay(result.firstInSecond, firstName, secondName)}
                            {overlay(result.secondInFirst, secondName, firstName)}
                        </div>
                    </section>

                    <section className={classes.section} aria-labelledby='syn-elements'>
                        <h3 id='syn-elements'>{translate('synastry_elements')}</h3>
                        <div className={classes.elements}>
                            {Object.entries(result.elements).map(([el, v]) => (
                                <div key={el} className={classes.elementRow}>
                                    <span>{content.elements[el as keyof typeof content.elements]?.name}</span>
                                    {[['first', firstName], ['second', secondName]].map(([k, who]) => {
                                        const n = v[k as 'first' | 'second'];
                                        return (
                                            <span key={k} className={classes.bar} title={`${who}: ${n}`}>
                                                <span style={{width: `${n * 10}%`, background: ELEMENT_COLORS[el], opacity: k === 'first' ? 1 : 0.55}}/>
                                                <small>{who} {n}</small>
                                            </span>
                                        );
                                    })}
                                </div>
                            ))}
                        </div>
                    </section>
                    </>
                    )}
                    {birthInput && partner ? (
                        <CompatSummaryComponent first={birthInput} second={partner} firstName={firstName} secondName={secondName}/>
                    ) : null}
                </>
            )}
        </div>
    );
};

export default SynastryPanelComponent;
