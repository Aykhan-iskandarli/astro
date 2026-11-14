import {useCallback, useMemo, useState} from 'react';
import {Link} from 'react-router-dom';
import {Alert, Button, Segmented} from 'antd';
import classNames from 'classnames';
import {Routes} from 'router/routes';
import {formatLocal, glyph, POINT_GLYPHS} from 'core/helpers/astro';
import {ageAt, CYCLE_ROWS, LIFE_YEARS, luckSpans, pct, span} from 'core/helpers/lifetime';
import {useBirthSource} from 'core/helpers/use-birth-source';
import BirthSourceComponent from 'core/shared/birth-source/birth-source.component';
import SeoComponent from 'core/shared/seo/seo.component';
import LoaderComponent from 'core/shared/loader/loader.component';
import CosmicBackgroundComponent from 'core/shared/cosmic-background/cosmic-background.component';
import useLocalization, {useContent} from 'assets/lang';
import {useGetLifetime} from 'pages/natal-chart/actions/natal-chart.query';
import {useLifeTimelineStyles} from './life-timeline.style';

type Kind = 'firdaria' | 'dasha' | 'luck' | 'cycle';
interface ISelected {
    kind: Kind;
    index: number;
}

const ELEMENT_COLORS: Record<string, string> = {wood: 'earth', fire: 'fire', earth: 'gold', metal: 'text', water: 'water'};
const TICKS = Array.from({length: LIFE_YEARS / 10 + 1}, (_, i) => i * 10);

// A whole life on one page: the periods that run through it (firdaria, Vimshottari dasha, Chinese luck pillars) and
// the planetary life cycles (returns, squares, oppositions), laid out on a 0-90 age axis. Select a block for its text.
function LifeTimelineComponent() {
    const translate = useLocalization();
    const content = useContent();
    const classes = useLifeTimelineStyles();
    const source = useBirthSource();
    const {input, chartInput} = source;
    const [gender, setGender] = useState<'male' | 'female'>('male');
    const [selected, setSelected] = useState<ISelected | null>(null);
    const {data, isFetching, isError} = useGetLifetime(input, gender);

    const handleGender = useCallback((v: string | number) => {
        setGender(v as 'male' | 'female');
    }, []);
    const handleSelect = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
        setSelected({kind: e.currentTarget.dataset.kind as Kind, index: Number(e.currentTarget.dataset.index)});
    }, []);

    const name = (id: string) => content.points[id as keyof typeof content.points]?.name
        ?? (content.vedic.grahas as Record<string, {name: string}>)[id]?.name.split(' (')[0] ?? id;
    const label = (id: string) => glyph(POINT_GLYPHS[id]) || name(id).slice(0, 2);
    const life = content.lifetime as {firdaria: Record<string, string>; dasha: Record<string, string>};
    const cycleText = content.transformations.cycle as Record<string, {name: string; text: string}>;

    const birthYear = data ? Number(data.birth.slice(0, 4)) : null;
    const nowAge = data ? ageAt(data.birth, new Date().toISOString()) : null;
    const luck = useMemo(() => (data ? luckSpans(data.luck) : []), [data]);
    const cycleRows = useMemo(() => CYCLE_ROWS.map((id) => ({id, items: (data?.cycles ?? []).filter((c) => c.transit === id)})).filter((r) => r.items.length), [data]);

    const detail = useMemo(() => {
        if (!data || !selected) return null;
        const i = selected.index;
        if (selected.kind === 'firdaria' && data.firdaria?.[i]) {
            const p = data.firdaria[i];
            return {title: `${translate('lt_firdaria')}: ${name(p.lord)}`, from: ageAt(data.birth, p.start), to: ageAt(data.birth, p.end), start: p.start, end: p.end, text: life.firdaria[p.lord]};
        }
        if (selected.kind === 'dasha' && data.dasha[i]) {
            const p = data.dasha[i];
            return {title: `${translate('lt_dasha')}: ${name(p.lord)}`, from: ageAt(data.birth, p.start), to: ageAt(data.birth, p.end), start: p.start, end: p.end, text: life.dasha[p.lord]};
        }
        if (selected.kind === 'luck' && data.luck[i]) {
            const p = data.luck[i];
            const god = content.chinese.tenGods[p.tenGod as keyof typeof content.chinese.tenGods];
            return {
                title: `${translate('lt_luck')}: ${p.stem.char}${p.branch.char} · ${god?.name ?? ''}`,
                from: luck[i].from, to: luck[i].to, start: null, end: null, text: god?.meaning ?? '',
            };
        }
        if (selected.kind === 'cycle' && data.cycles[i]) {
            const c = data.cycles[i];
            const t = cycleText[`${c.transit}-${c.aspect}`];
            return {title: t?.name ?? `${name(c.transit)}`, from: c.ageAtStart, to: c.ageAtEnd, start: c.start, end: c.end, text: t?.text ?? ''};
        }
        return null;
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [data, selected, luck, content]);

    const block = (kind: Kind, index: number, from: number, to: number, text: string, key: string, extra?: string) => {
        const {left, width} = span(from, to);
        const on = selected?.kind === kind && selected.index === index;
        return (
            <button key={key} type='button' data-kind={kind} data-index={index} onClick={handleSelect} aria-pressed={on}
                    title={extra} className={classNames(classes.block, classes[`k_${kind}`], {[classes.blockOn]: on})}
                    style={{left: `${left}%`, width: `${width}%`}}>
                <span className={classes.blockText}>{text}</span>
            </button>
        );
    };

    return (
        <div className={classes.stage}>
            <div className={classes.backdrop} aria-hidden='true'><CosmicBackgroundComponent intensity={0.6}/></div>
            <div className={`container ${classes.page}`}>
                <SeoComponent titleKey='seo_life_title' descriptionKey='seo_life_description' path={Routes.lifeTimeline}/>
                <header className={classes.head}>
                    <p className={classes.eyebrow}>{translate('lt_eyebrow')}</p>
                    <h1>{translate('lt_title')}</h1>
                    <p className={classes.muted}>{translate('lt_intro')}</p>
                </header>

                <div className={classes.toolbar}>
                    <BirthSourceComponent chartInput={chartInput} mode={source.mode} onMode={source.onMode} birth={source.birth}
                                          onBirth={source.onBirth} showDate={source.showDate}/>
                    <div className={classes.gender}>
                        <span>{translate('gender_label')}</span>
                        <Segmented value={gender} onChange={handleGender} size='large'
                                   options={[{value: 'male', label: translate('gender_male')}, {value: 'female', label: translate('gender_female')}]}/>
                        <small>{translate('lt_gender_note')}</small>
                    </div>
                </div>

                {!input ? (
                    <div className={classes.empty}>
                        <p className={classes.muted}>{translate('tr_need_date')}</p>
                        {chartInput ? null : <Link to={Routes.natalChart}><Button>{translate('hero_cta')}</Button></Link>}
                    </div>
                ) : null}
                {isError ? <Alert type='error' showIcon title={translate('lt_error')}/> : null}
                {input && !data && isFetching ? <LoaderComponent/> : null}

                {data ? (
                    <div className={classNames(classes.body, {[classes.busy]: isFetching})}>
                        {data.timeUnknown ? <Alert type='info' showIcon title={translate('lt_time_unknown')}/> : null}
                        <div className={classes.scroll} role='group' aria-label={translate('lt_title')}>
                            <div className={classes.chart}>
                                <div className={classes.axis} aria-hidden='true'>
                                    {TICKS.map((t) => (
                                        <span key={t} style={{left: `${pct(t)}%`}}>
                                            <b>{t}</b>
                                            <i>{birthYear! + t}</i>
                                        </span>
                                    ))}
                                </div>
                                {nowAge !== null && nowAge >= 0 && nowAge <= LIFE_YEARS ? (
                                    <div className={classes.now} style={{left: `${pct(nowAge)}%`}} aria-hidden='true'><span>{translate('lt_now')}</span></div>
                                ) : null}

                                {data.firdaria ? (
                                    <section className={classes.row} aria-label={translate('lt_firdaria')}>
                                        <h2>{translate('lt_firdaria')}</h2>
                                        <div className={classes.track}>
                                            {data.firdaria.map((p, i) => block('firdaria', i, ageAt(data.birth, p.start), ageAt(data.birth, p.end),
                                                `${label(p.lord)} ${name(p.lord)}`, `f${i}`))}
                                        </div>
                                    </section>
                                ) : null}
                                <section className={classes.row} aria-label={translate('lt_dasha')}>
                                    <h2>{translate('lt_dasha')}</h2>
                                    <div className={classes.track}>
                                        {data.dasha.map((p, i) => block('dasha', i, ageAt(data.birth, p.start), ageAt(data.birth, p.end),
                                            name(p.lord), `d${i}`))}
                                    </div>
                                </section>
                                <section className={classes.row} aria-label={translate('lt_luck')}>
                                    <h2>{translate('lt_luck')}</h2>
                                    <div className={classes.track}>
                                        {data.luck.map((p, i) => block('luck', i, luck[i].from, luck[i].to, `${p.stem.char}${p.branch.char}`, `l${i}`,
                                            ELEMENT_COLORS[p.stem.element]))}
                                    </div>
                                </section>
                                <section className={classes.cycles} aria-label={translate('lt_cycles')}>
                                    <h2>{translate('lt_cycles')}</h2>
                                    {cycleRows.map((row) => (
                                        <div key={row.id} className={classes.cycleRow}>
                                            <span className={classes.cycleWho}>{label(row.id)}</span>
                                            <div className={classes.track}>
                                                {row.items.map((c) => {
                                                    const i = data.cycles.indexOf(c);
                                                    return block('cycle', i, c.ageAtStart, c.ageAtEnd, '◆', `c${i}`, cycleText[`${c.transit}-${c.aspect}`]?.name);
                                                })}
                                            </div>
                                        </div>
                                    ))}
                                </section>
                            </div>
                        </div>

                        <section className={classes.detail} aria-live='polite'>
                            {detail ? (
                                <>
                                    <h3>{detail.title}</h3>
                                    <p className={classes.when}>
                                        {translate('lt_ages', {from: Math.floor(detail.from), to: Math.ceil(detail.to)})}
                                        {detail.start && detail.end ? ` · ${formatLocal(detail.start, false)} – ${formatLocal(detail.end, false)}` : ''}
                                    </p>
                                    <p>{detail.text}</p>
                                </>
                            ) : <p className={classes.muted}>{translate('lt_pick')}</p>}
                        </section>
                        <p className={classes.note}>{translate('lt_note')}</p>
                    </div>
                ) : null}
            </div>
        </div>
    );
}

export default LifeTimelineComponent;
