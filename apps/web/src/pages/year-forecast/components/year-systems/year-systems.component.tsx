import {useCallback, useMemo, useState} from 'react';
import {Segmented} from 'antd';
import {formatLocal} from 'core/helpers/astro';
import LoaderComponent from 'core/shared/loader/loader.component';
import useLocalization, {useContent} from 'assets/lang';
import {ITranslationKey} from 'assets/lang/lang';
import {useGetBaziYears, useGetLifetime} from 'pages/natal-chart/actions/natal-chart.query';
import {useYearPartsStyles} from '../year-parts.style';
import {IYearSystems} from './year-systems';

const PILLARS = ['year', 'month', 'day', 'hour'] as const;

// The same year in the other systems the site calculates: the numerology personal year, the Vedic (Vimshottari) dasha
// running in the year, and the Chinese annual pillar against the birth pillars (which needs a gender).
const YearSystemsComponent = ({input, year, data}: IYearSystems) => {
    const translate = useLocalization();
    const content = useContent();
    const classes = useYearPartsStyles();
    const [gender, setGender] = useState<'male' | 'female'>('male');
    const handleGender = useCallback((v: string | number) => {
        setGender(v as 'male' | 'female');
    }, []);
    const genders = useMemo(() => [
        {value: 'male', label: translate('gender_male')},
        {value: 'female', label: translate('gender_female')},
    ], [translate]);

    const life = useGetLifetime(input, gender);
    const bazi = useGetBaziYears(input, gender, year, 1);

    const numerology = content.numerology as unknown as {personalYearReading: Record<string, string>; kinds: {personalYear: {name: string; meaning: string}}};
    const grahas = content.vedic.grahas as Record<string, {name: string}>;
    const lifeText = content.lifetime as {dasha: Record<string, string>};
    const c = content.chinese;
    const annual = c.annual as {tenGod: Record<string, string>; relation: Record<string, Record<string, string>>};

    const dasha = useMemo(() => {
        const lo = Date.UTC(year, 0, 1);
        const hi = Date.UTC(year + 1, 0, 1);
        return (life.data?.dasha ?? []).filter((p) => Date.parse(p.start) < hi && Date.parse(p.end) >= lo);
    }, [life.data, year]);
    const pillar = bazi.data?.years.find((y) => y.year === year) ?? null;

    return (
        <section className={classes.wrap} aria-labelledby='sec-systems'>
            <h2 id='sec-systems' className={classes.title}>{translate('ysy_title')}</h2>
            <p className={classes.muted}>{translate('ysy_intro')}</p>
            <div className={classes.nav}><Segmented value={gender} onChange={handleGender} options={genders} size='large'/></div>
            <p className={classes.muted}>{translate('lt_gender_note')}</p>
            <ul className={classes.list}>
                {data.personalYear ? (
                    <li className={classes.card}>
                        <p className={classes.label}>{translate('ysy_numerology')}</p>
                        <h3>{numerology.kinds.personalYear.name}: {data.personalYear}</h3>
                        <p className={classes.text}>{numerology.personalYearReading[String(data.personalYear)]}</p>
                        <p className={classes.soft}>{numerology.kinds.personalYear.meaning}</p>
                    </li>
                ) : null}

                <li className={classes.card}>
                    <p className={classes.label}>{translate('ysy_dasha')}</p>
                    {life.isFetching && !life.data ? <LoaderComponent/> : null}
                    {dasha.map((p) => (
                        <div key={p.start}>
                            <h3>{grahas[p.lord]?.name ?? p.lord}</h3>
                            <p className={classes.fact}>{formatLocal(p.start, false)} – {formatLocal(p.end, false)}</p>
                            <p className={classes.text}>{lifeText.dasha[p.lord]}</p>
                        </div>
                    ))}
                    {life.data && !dasha.length ? <p className={classes.muted}>{translate('ysy_none')}</p> : null}
                </li>

                <li className={classes.card}>
                    <p className={classes.label}>{translate('ysy_chinese')}</p>
                    {bazi.isFetching && !bazi.data ? <LoaderComponent/> : null}
                    {pillar ? (
                        <>
                            <h3>
                                {pillar.year} · {c.stems[pillar.stem.id as keyof typeof c.stems]} {c.elements[pillar.stem.element as keyof typeof c.elements]?.name}
                                {' '}{c.animals[pillar.branch.animal as keyof typeof c.animals]}
                            </h3>
                            <p className={classes.text}><strong>{c.tenGods[pillar.tenGod as keyof typeof c.tenGods]?.name}</strong>{' · '}{annual.tenGod[pillar.tenGod]}</p>
                            {Object.keys(pillar.relations).length ? (
                                PILLARS.filter((k) => pillar.relations[k]).map((k) => (
                                    <div key={k}>
                                        <p className={classes.label}>{translate(`pillar_${k}` as ITranslationKey)} · {c.relations[pillar.relations[k]! as keyof typeof c.relations]?.name}</p>
                                        <p className={classes.text}>{annual.relation[k]?.[pillar.relations[k]!]}</p>
                                    </div>
                                ))
                            ) : <p className={classes.muted}>{translate('cn_annual_quiet')}</p>}
                        </>
                    ) : null}
                </li>
            </ul>
            <p className={classes.note}>{translate('ysy_note')}</p>
        </section>
    );
};

export default YearSystemsComponent;
