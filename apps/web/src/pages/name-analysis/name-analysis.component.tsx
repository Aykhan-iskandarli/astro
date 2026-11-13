import {useCallback, useState} from 'react';
import {Link} from 'react-router-dom';
import {Alert, Button, DatePicker, Input} from 'antd';
import dayjs, {Dayjs} from 'dayjs';
import classNames from 'classnames';
import {Routes} from 'router/routes';
import {useDebouncedValue} from 'core/helpers/use-debounced-value';
import SeoComponent from 'core/shared/seo/seo.component';
import LoaderComponent from 'core/shared/loader/loader.component';
import CosmicBackgroundComponent from 'core/shared/cosmic-background/cosmic-background.component';
import useLocalization, {useContent} from 'assets/lang';
import {INumerologyNumber} from 'pages/natal-chart/models/numerology.model';
import PsychomatrixComponent from 'pages/natal-chart/components/psychomatrix/psychomatrix.component';
import {useGetNameAnalysis} from './actions/name-analysis.query';
import {INameLetter} from './models/name-analysis.model';
import {useNameAnalysisStyles} from './name-analysis.style';

const MIN = dayjs('1800-01-01');
const MAX = dayjs('2999-12-31');
const PLANES = ['physical', 'mental', 'emotional', 'intuitive'] as const;

// Name analysis from the full name alone (birth date optional): Pythagorean numbers, letter positions,
// karmic lessons, hidden passion, planes of expression and the Chaldean total.
function NameAnalysisComponent() {
    const translate = useLocalization();
    const content = useContent();
    const n = content.numerology;
    const t = n.name;
    const classes = useNameAnalysisStyles();
    const [name, setName] = useState('');
    const [date, setDate] = useState<Dayjs | null>(null);
    const debounced = useDebouncedValue(name.trim(), 400);
    const {data, isFetching} = useGetNameAnalysis(debounced, date ? date.format('YYYY-MM-DD') : null);

    const handleName = useCallback((e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value), []);
    const handleDate = useCallback((v: Dayjs | null) => setDate(v), []);
    const disabledDate = useCallback((d: Dayjs) => d.isBefore(MIN) || d.isAfter(MAX), []);

    const meaning = (v: number) => n.numbers[String(v) as keyof typeof n.numbers];
    const numberCard = (kind: string, num: INumerologyNumber | null) => {
        if (!num) return null;
        const info = n.kinds[kind as keyof typeof n.kinds];
        return (
            <article key={kind} className={classes.card}>
                <header className={classes.cardHead}>
                    <span className={classes.number}>{num.value}</span>
                    <div>
                        <h3>{info?.name}</h3>
                        <p className={classes.small}>{info?.meaning}</p>
                    </div>
                </header>
                <p className={classes.strong}>{meaning(num.value)?.name} <span className={classes.small}>· {meaning(num.value)?.keywords}</span></p>
                <p className={classes.text}>{meaning(num.value)?.meaning}</p>
                {num.compound !== num.value ? <p className={classes.small}>{num.compound} → {num.value}</p> : null}
            </article>
        );
    };
    const letterCard = (kind: 'cornerstone' | 'capstone' | 'firstVowel', l: INameLetter | null) => (l ? (
        <article key={kind} className={classes.card}>
            <header className={classes.cardHead}>
                <span className={classes.letterBadge}>{l.letter.toUpperCase()}</span>
                <div>
                    <h3>{t.kinds[kind].name}</h3>
                    <p className={classes.small}>{t.kinds[kind].meaning}</p>
                </div>
            </header>
            <p className={classes.text}>{t.letters[l.base as keyof typeof t.letters]}</p>
            <p className={classes.small}>{translate('name_letter_value', {letter: l.letter.toUpperCase(), value: l.value})}</p>
        </article>
    ) : null);

    const maxPlane = data ? Math.max(1, ...Object.values(data.planes)) : 1;

    return (
        <div className={classes.stage}>
            <div className={classes.backdrop} aria-hidden='true'><CosmicBackgroundComponent intensity={0.6}/></div>
            <div className={`container ${classes.page}`}>
                <SeoComponent titleKey='seo_name_title' descriptionKey='seo_name_description' path={Routes.nameAnalysis}/>
                <header className={classes.head}>
                    <p className={classes.eyebrow}>{translate('name_eyebrow')}</p>
                    <h1>{translate('name_title')}</h1>
                    <p className={classes.muted}>{t.intro}</p>
                </header>

                <div className={classes.form}>
                    <label className={classes.nameField} htmlFor='name-full'>
                        {translate('name_field')}
                        <Input id='name-full' size='large' value={name} onChange={handleName} maxLength={120} autoComplete='off'
                               placeholder={translate('numerology_alt_name_placeholder')}/>
                    </label>
                    <label className={classes.dateField} htmlFor='name-date'>
                        {translate('name_date_field')}
                        <DatePicker id='name-date' size='large' value={date} onChange={handleDate} format='DD.MM.YYYY'
                                    disabledDate={disabledDate} placeholder={translate('field_date_placeholder')}/>
                    </label>
                </div>

                {!debounced ? <p className={classes.muted}>{translate('name_empty')}</p> : !data ? <LoaderComponent/> : (
                    <div className={classNames(classes.body, {[classes.busy]: isFetching})}>
                        {data.ignored.length ? <Alert type='warning' showIcon title={translate('numerology_ignored', {chars: data.ignored.join(' ')})}/> : null}

                        <section className={classes.section} aria-labelledby='name-core'>
                            <h2 id='name-core'>{translate('name_core_title')}</h2>
                            <div className={classes.grid}>
                                {numberCard('expression', data.expression)}
                                {numberCard('soulUrge', data.soulUrge)}
                                {numberCard('personality', data.personality)}
                                {numberCard('lifePath', data.lifePath)}
                                {numberCard('maturity', data.maturity)}
                            </div>
                            {!date ? <p className={classes.small}>{translate('name_date_hint')}</p> : null}
                        </section>

                        <section className={classes.section} aria-labelledby='name-letters'>
                            <h2 id='name-letters'>{translate('name_letters_title')}</h2>
                            <ol className={classes.letters}>
                                {data.letters.map((l, i) => (
                                    <li key={`${l.letter}-${i}`}><span>{l.letter.toUpperCase()}</span><b>{l.value}</b></li>
                                ))}
                            </ol>
                            <div className={classes.grid}>
                                {letterCard('cornerstone', data.cornerstone)}
                                {letterCard('capstone', data.capstone)}
                                {letterCard('firstVowel', data.firstVowel)}
                            </div>
                        </section>

                        <section className={classes.section} aria-labelledby='name-inclusion'>
                            <h2 id='name-inclusion'>{t.kinds.inclusion.name}</h2>
                            <p className={classes.text}>{t.kinds.inclusion.meaning}</p>
                            <div className={classes.inclusion}>
                                {Array.from({length: 9}, (_, i) => String(i + 1)).map((k) => (
                                    <div key={k} className={data.inclusion[k] ? undefined : classes.zero}>
                                        <b>{k}</b><small>× {data.inclusion[k] ?? 0}</small>
                                    </div>
                                ))}
                            </div>
                            <div className={classes.grid}>
                                {data.hiddenPassion.length ? (
                                    <article className={classes.card}>
                                        <h3>{t.kinds.hiddenPassion.name}: {data.hiddenPassion.join(', ')}</h3>
                                        <p className={classes.small}>{t.kinds.hiddenPassion.meaning}</p>
                                        {data.hiddenPassion.map((v) => <p key={v} className={classes.text}><b>{meaning(v)?.name}</b> — {meaning(v)?.meaning}</p>)}
                                    </article>
                                ) : null}
                                {data.subconsciousSelf !== null ? (
                                    <article className={classes.card}>
                                        <h3>{t.kinds.subconsciousSelf.name}: {data.subconsciousSelf}</h3>
                                        <p className={classes.small}>{t.kinds.subconsciousSelf.meaning}</p>
                                        <p className={classes.text}>{t.subconscious[String(data.subconsciousSelf) as keyof typeof t.subconscious]}</p>
                                    </article>
                                ) : null}
                                {data.balance ? (
                                    <article className={classes.card}>
                                        <h3>{t.kinds.balance.name}: {data.balance.value}</h3>
                                        <p className={classes.small}>{t.kinds.balance.meaning}</p>
                                        <p className={classes.text}>{t.balance[String(data.balance.value > 9 ? data.balance.value % 9 : data.balance.value) as keyof typeof t.balance]}</p>
                                    </article>
                                ) : null}
                            </div>
                        </section>

                        <section className={classes.section} aria-labelledby='name-lessons'>
                            <h2 id='name-lessons'>{t.kinds.karmicLessons.name}</h2>
                            <p className={classes.text}>{t.kinds.karmicLessons.meaning}</p>
                            {data.karmicLessons.length ? (
                                <ul className={classes.list}>
                                    {data.karmicLessons.map((v) => <li key={v}><b>{v}</b> — {t.karmicLessons[String(v) as keyof typeof t.karmicLessons]}</li>)}
                                </ul>
                            ) : <p className={classes.text}>{translate('name_no_lessons')}</p>}
                        </section>

                        <section className={classes.section} aria-labelledby='name-planes'>
                            <h2 id='name-planes'>{t.kinds.planes.name}</h2>
                            <p className={classes.text}>{t.kinds.planes.meaning}</p>
                            <div className={classes.planes}>
                                {PLANES.map((p) => (
                                    <div key={p} className={classes.plane}>
                                        <span>{t.planes[p].name}</span>
                                        <span className={classes.bar} aria-hidden='true'><span style={{width: `${(data.planes[p] ?? 0) / maxPlane * 100}%`}}/></span>
                                        <b>{data.planes[p] ?? 0}</b>
                                    </div>
                                ))}
                            </div>
                            {data.dominantPlane ? (
                                <p className={classes.text}>
                                    <b>{translate('name_dominant_plane', {plane: t.planes[data.dominantPlane as keyof typeof t.planes].name})}</b>{' '}
                                    {t.planes[data.dominantPlane as keyof typeof t.planes].meaning}
                                </p>
                            ) : null}
                        </section>

                        {data.psychomatrix ? <PsychomatrixComponent data={data.psychomatrix}/> : null}

                        {data.chaldean ? (
                            <section className={classes.section} aria-labelledby='name-chaldean'>
                                <h2 id='name-chaldean'>{t.kinds.chaldean.name}: {data.chaldean.value}</h2>
                                <p className={classes.text}>{t.kinds.chaldean.meaning}</p>
                                <p className={classes.text}>
                                    {data.chaldean.compound} → {data.chaldean.value} · <b>{meaning(data.chaldean.value)?.name}</b> — {meaning(data.chaldean.value)?.meaning}
                                </p>
                            </section>
                        ) : null}

                        <aside className={classes.cta}>
                            <p className={classes.text}>{translate('name_cta')}</p>
                            <Link to={Routes.natalChart}><Button type='primary' size='large'>{translate('name_cta_button')}</Button></Link>
                        </aside>
                        <p className={classes.small}>{translate('numerology_method')}</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default NameAnalysisComponent;
