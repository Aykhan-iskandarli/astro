import {useCallback, useMemo, useState} from 'react';
import classNames from 'classnames';
import colors from 'assets/styles/abstracts/color';
import LoaderComponent from 'core/shared/loader/loader.component';
import {useStore} from 'store/store.config';
import useLocalization, {useContent} from 'assets/lang';
import {ITranslationKey} from 'assets/lang/lang';
import {useGetBaziYears} from '../../actions/natal-chart.query';
import {useChineseAnnualStyles} from './chinese-annual.style';
import {IChineseAnnualProps} from './chinese-annual';

const ELEMENT_COLORS: Record<string, string> = {wood: colors.earth, fire: colors.fire, earth: colors.gold, metal: colors.text, water: colors.water};
const SPAN = 10;
const PILLARS = ['year', 'month', 'day', 'hour'] as const;

// Annual pillars (Liu Nian): each year's stem and branch read against the day master and the four natal branches.
const ChineseAnnualComponent = ({gender}: IChineseAnnualProps) => {
    const translate = useLocalization();
    const content = useContent();
    const c = content.chinese;
    const classes = useChineseAnnualStyles();
    const birthInput = useStore('birthInput');
    const thisYear = new Date().getFullYear();
    const [picked, setPicked] = useState<number>(thisYear);
    const {data, isFetching, isError} = useGetBaziYears(birthInput, gender, thisYear - 1, SPAN);

    const handlePick = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
        setPicked(Number(e.currentTarget.dataset.year));
    }, []);

    const annual = c.annual as {tenGod: Record<string, string>; relation: Record<string, Record<string, string>>};
    const current = useMemo(() => data?.years.find((y) => y.year === picked) ?? data?.years[1] ?? null, [data, picked]);
    const relationName = (id: string) => c.relations[id as keyof typeof c.relations]?.name ?? id;

    if (isError) return <p className={classes.muted}>{translate('cn_annual_error')}</p>;
    if (!data) return <LoaderComponent/>;

    return (
        <div className={classNames(classes.wrap, {[classes.busy]: isFetching})}>
            <p className={classes.muted}>{translate('cn_annual_intro')}</p>
            <ul className={classes.strip}>
                {data.years.map((y) => (
                    <li key={y.year}>
                        <button type='button' data-year={y.year} onClick={handlePick} aria-pressed={current?.year === y.year}
                                className={classNames(classes.year, {[classes.yearOn]: current?.year === y.year})}>
                            <span className={classes.yearNum}>{y.year}</span>
                            <b style={{color: ELEMENT_COLORS[y.stem.element]}}>{y.stem.char}</b>
                            <b style={{color: ELEMENT_COLORS[y.branch.element]}}>{y.branch.char}</b>
                            <small>{c.animals[y.branch.animal as keyof typeof c.animals]}</small>
                            {y.ownAnimal ? <span className={classes.own}>★ {translate('cn_annual_own')}</span> : null}
                        </button>
                    </li>
                ))}
            </ul>

            {current ? (
                <section className={classes.card} aria-live='polite'>
                    <h4>
                        {current.year} · {c.stems[current.stem.id as keyof typeof c.stems]} {c.elements[current.stem.element as keyof typeof c.elements]?.name}
                        {' '}{c.animals[current.branch.animal as keyof typeof c.animals]}
                    </h4>
                    <p><strong className={classes.god}>{c.tenGods[current.tenGod as keyof typeof c.tenGods]?.name}</strong>{' · '}{annual.tenGod[current.tenGod]}</p>
                    {current.luck ? (
                        <p className={classes.muted}>
                            {translate('cn_annual_luck', {
                                pillar: `${current.luck.stem.char}${current.luck.branch.char}`,
                                god: c.tenGods[current.luck.tenGod as keyof typeof c.tenGods]?.name ?? '',
                                from: current.luck.startYear,
                                to: current.luck.endYear,
                            })}
                        </p>
                    ) : null}
                    {Object.keys(current.relations).length ? (
                        <ul className={classes.relations}>
                            {PILLARS.filter((k) => current.relations[k]).map((k) => (
                                <li key={k} className={classes.relation}>
                                    <strong>{translate(`pillar_${k}` as ITranslationKey)} · {relationName(current.relations[k]!)}</strong>
                                    <span>{annual.relation[k]?.[current.relations[k]!]}</span>
                                </li>
                            ))}
                        </ul>
                    ) : <p className={classes.muted}>{translate('cn_annual_quiet')}</p>}
                </section>
            ) : null}
            <p className={classes.note}>{translate('cn_annual_note')}</p>
        </div>
    );
};

export default ChineseAnnualComponent;
