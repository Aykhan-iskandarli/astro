import {lazy, Suspense, useCallback, useMemo, useState} from 'react';
import {Alert, Segmented} from 'antd';
import {motion} from 'framer-motion';
import classNames from 'classnames';
import {useStore} from 'store/store.config';
import LoaderComponent from 'core/shared/loader/loader.component';
import colors from 'assets/styles/abstracts/color';
import useLocalization, {useContent} from 'assets/lang';
import {ITranslationKey} from 'assets/lang/lang';
import {useGetBazi} from '../../actions/natal-chart.query';
import {IPillar} from '../../models/bazi.model';
import {useChinesePanelStyles} from './chinese-panel.style';

// iztro (~200 kB) is only loaded when this tab is opened
const ZiweiChartComponent = lazy(() => import('../ziwei-chart/ziwei-chart.component'));

const ELEMENT_COLORS: Record<string, string> = {wood: colors.earth, fire: colors.fire, earth: colors.gold, metal: colors.text, water: colors.water};
const PILLARS = ['year', 'month', 'day', 'hour'] as const;

const ChinesePanelComponent = () => {
    const translate = useLocalization();
    const content = useContent();
    const c = content.chinese;
    const classes = useChinesePanelStyles();
    const birthInput = useStore('birthInput');
    const [gender, setGender] = useState<'male' | 'female'>('male');
    const {data: bazi, isFetching} = useGetBazi(birthInput, gender);

    const handleGender = useCallback((value: string | number) => {
        setGender(value as 'male' | 'female');
    }, []);

    const age = useMemo(() => {
        if (!birthInput) return null;
        const b = new Date(`${birthInput.date}T00:00:00`);
        // Zi Wei decades count in nominal (Chinese) years: age + 1
        return new Date().getFullYear() - b.getFullYear() + 1;
    }, [birthInput]);
    const thisYear = new Date().getFullYear();

    const genderOptions = useMemo(() => [
        {value: 'male', label: translate('gender_male')},
        {value: 'female', label: translate('gender_female')},
    ], [translate]);

    const pillar = (key: typeof PILLARS[number], p: IPillar | null) => (
        <div key={key} className={classNames(classes.pillar, {[classes.dayPillar]: key === 'day'})}>
            <span className={classes.pillarLabel}>{translate(`pillar_${key}` as ITranslationKey)}</span>
            {p ? (
                <>
                    <span className={classes.tenGod}>{c.tenGods[p.tenGod as keyof typeof c.tenGods]?.name ?? '—'}</span>
                    <span className={classes.char} style={{color: ELEMENT_COLORS[p.stem.element]}}
                          title={`${c.stems[p.stem.id as keyof typeof c.stems]} · ${c.elements[p.stem.element as keyof typeof c.elements]?.name} · ${p.stem.yang ? translate('yang') : translate('yin')}`}>
                        {p.stem.char}
                    </span>
                    <span className={classes.sub}>{c.stems[p.stem.id as keyof typeof c.stems]} · {c.elements[p.stem.element as keyof typeof c.elements]?.name}</span>
                    <span className={classes.char} style={{color: ELEMENT_COLORS[p.branch.element]}}
                          title={`${c.branches[p.branch.id as keyof typeof c.branches]} · ${c.animals[p.branch.animal as keyof typeof c.animals]}`}>
                        {p.branch.char}
                    </span>
                    <span className={classes.sub}>{c.branches[p.branch.id as keyof typeof c.branches]} · {c.animals[p.branch.animal as keyof typeof c.animals]}</span>
                    <span className={classes.hidden} title={translate('bazi_hidden')}>
                        {p.hidden.map((h) => (
                            <span key={h.id} style={{color: ELEMENT_COLORS[h.element]}}
                                  title={c.tenGods[h.tenGod as keyof typeof c.tenGods]?.name}>{h.char}</span>
                        ))}
                    </span>
                </>
            ) : <span className={classes.sub}>{translate('bazi_hour_unknown')}</span>}
        </div>
    );

    if (!birthInput) return null;
    const total = bazi ? Object.values(bazi.elements).reduce((a, b) => a + b, 0) || 1 : 1;

    return (
        <div className={classes.wrapper}>
            <header className={classes.head}>
                <div>
                    <h2>{translate('chinese_title')}</h2>
                    <p>{translate('chinese_subtitle')}</p>
                </div>
                <div className={classes.gender}>
                    <span>{translate('gender_label')}</span>
                    <Segmented options={genderOptions} value={gender} onChange={handleGender} size='large'/>
                    <small>{translate('gender_note')}</small>
                </div>
            </header>

            <section className={classes.section} aria-labelledby='cn-bazi'>
                <h3 id='cn-bazi'>{translate('bazi_title')}</h3>
                {!bazi ? <LoaderComponent/> : (
                    <div className={classNames(classes.bazi, {[classes.busy]: isFetching})}>
                        <div className={classes.pillars}>{PILLARS.map((k) => pillar(k, bazi.pillars[k]))}</div>
                        <div className={classes.side}>
                            {bazi.dayMaster ? (
                                <motion.div className={classes.dayMaster} initial={{opacity: 0, y: 8}} animate={{opacity: 1, y: 0}}>
                                    <span className={classes.dmChar} style={{color: ELEMENT_COLORS[bazi.dayMaster.element]}}>{bazi.dayMaster.char}</span>
                                    <div>
                                        <strong>{translate('bazi_day_master', {
                                            stem: c.stems[bazi.dayMaster.id as keyof typeof c.stems],
                                            element: c.elements[bazi.dayMaster.element as keyof typeof c.elements]?.name,
                                            polarity: bazi.dayMaster.yang ? translate('yang') : translate('yin'),
                                        })}</strong>
                                        <p>{c.elements[bazi.dayMaster.element as keyof typeof c.elements]?.keywords}</p>
                                        <p className={classes.muted}>{c.animals[bazi.animal as keyof typeof c.animals]} · {bazi.lunarDate}</p>
                                    </div>
                                </motion.div>
                            ) : null}
                            <h4>{translate('bazi_elements')}</h4>
                            {Object.entries(bazi.elements).map(([el, n]) => (
                                <div key={el} className={classes.elRow}>
                                    <span>{c.elements[el as keyof typeof c.elements]?.name}</span>
                                    <span className={classes.track}>
                                        <motion.span style={{background: ELEMENT_COLORS[el], originX: 0}} initial={{scaleX: 0}}
                                                     animate={{scaleX: n / total}} transition={{duration: 0.8}}/>
                                    </span>
                                    <b>{n}</b>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                {bazi ? (
                    <>
                        <h4 className={classes.luckTitle}>{translate('bazi_luck')}</h4>
                        {bazi.luckStart ? <p className={classes.muted}>{translate('bazi_luck_start', {years: bazi.luckStart.years, months: bazi.luckStart.months})}</p> : null}
                        <ol className={classes.luck}>
                            {bazi.luck.map((l) => (
                                <li key={l.startYear} className={classNames({[classes.luckNow]: thisYear >= l.startYear && thisYear <= l.endYear})}
                                    title={c.tenGods[l.tenGod as keyof typeof c.tenGods]?.meaning}>
                                    <span className={classes.muted}>{l.startYear}</span>
                                    <b style={{color: ELEMENT_COLORS[l.stem.element]}}>{l.stem.char}</b>
                                    <b style={{color: ELEMENT_COLORS[l.branch.element]}}>{l.branch.char}</b>
                                    <small>{translate('age_from', {age: l.startAge})}</small>
                                </li>
                            ))}
                        </ol>
                        <p className={classes.note}>{translate('bazi_note')}</p>
                    </>
                ) : null}
            </section>

            <section className={classes.section} aria-labelledby='cn-ziwei'>
                <h3 id='cn-ziwei'>{translate('ziwei_title')}</h3>
                <p className={classes.muted}>{translate('ziwei_subtitle')}</p>
                {birthInput.time ? (
                    <Suspense fallback={<LoaderComponent/>}>
                        <ZiweiChartComponent date={birthInput.date} time={birthInput.time} gender={gender} age={age}/>
                    </Suspense>
                ) : <Alert type='info' showIcon message={translate('ziwei_time_required')}/>}
                <p className={classes.note}>{translate('ziwei_note')}</p>
            </section>
        </div>
    );
};

export default ChinesePanelComponent;
