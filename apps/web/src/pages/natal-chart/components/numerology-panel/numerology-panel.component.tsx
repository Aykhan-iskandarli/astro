import {useCallback, useState} from 'react';
import {Alert, Input} from 'antd';
import {motion} from 'framer-motion';
import classNames from 'classnames';
import {useStore} from 'store/store.config';
import {useDebouncedValue} from 'core/helpers/use-debounced-value';
import LoaderComponent from 'core/shared/loader/loader.component';
import useLocalization, {useContent} from 'assets/lang';
import {useGetNumerology} from '../../actions/natal-chart.query';
import {INumerologyNumber} from '../../models/numerology.model';
import {useNumerologyPanelStyles} from './numerology-panel.style';

const ORDER = ['lifePath', 'expression', 'soulUrge', 'personality', 'birthday', 'maturity'] as const;

const NumerologyPanelComponent = () => {
    const translate = useLocalization();
    const content = useContent();
    const n = content.numerology;
    const classes = useNumerologyPanelStyles();
    const birthInput = useStore('birthInput');
    const [fullName, setFullName] = useState<string>(birthInput?.name ?? '');
    const debouncedName = useDebouncedValue(fullName.trim(), 400);
    const {data, isFetching} = useGetNumerology(birthInput?.date ?? null, debouncedName);

    const handleName = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setFullName(e.target.value);
    }, []);

    const card = (kind: string, num: INumerologyNumber | {value: number; compound?: number; master?: boolean; karmicDebt?: number | null} | null,
                  i: number, extra?: string) => {
        const info = n.kinds[kind as keyof typeof n.kinds];
        const meaning = num ? n.numbers[String(num.value) as keyof typeof n.numbers] : null;
        return (
            <motion.article key={kind} className={classNames(classes.card, {[classes.cardEmpty]: !num, [classes.cardMain]: kind === 'lifePath'})}
                            initial={{opacity: 0, y: 16}} animate={{opacity: 1, y: 0}} transition={{delay: i * 0.06, duration: 0.5}}>
                <header className={classes.cardHead}>
                    <span className={classes.number}>{num ? num.value : '—'}</span>
                    <div>
                        <h3>{info?.name}</h3>
                        <p className={classes.muted}>{extra ?? info?.meaning}</p>
                    </div>
                </header>
                {num && meaning ? (
                    <>
                        <p className={classes.title}>{meaning.name} <span className={classes.muted}>· {meaning.keywords}</span></p>
                        <p>{meaning.meaning}</p>
                        <div className={classes.tags}>
                            {num.compound && num.compound !== num.value ? <span className={classes.tag}>{num.compound} → {num.value}</span> : null}
                            {num.master ? <span className={classNames(classes.tag, classes.tagGold)}>{translate('master_label')}</span> : null}
                            {num.karmicDebt ? (
                                <span className={classNames(classes.tag, classes.tagDebt)} title={n.karmicDebt[String(num.karmicDebt) as keyof typeof n.karmicDebt]}>
                                    {translate('karmic_debt_label', {n: num.karmicDebt})}
                                </span>
                            ) : null}
                        </div>
                        {num.karmicDebt ? <p className={classes.muted}>{n.karmicDebt[String(num.karmicDebt) as keyof typeof n.karmicDebt]}</p> : null}
                    </>
                ) : null}
            </motion.article>
        );
    };

    return (
        <div className={classes.wrapper}>
            <header className={classes.head}>
                <h2>{translate('numerology_title')}</h2>
                <p>{translate('numerology_subtitle')}</p>
            </header>

            <div className={classes.nameRow}>
                <label htmlFor='numerology-name'>{translate('numerology_name_label')}</label>
                <Input id='numerology-name' size='large' value={fullName} onChange={handleName} maxLength={120}
                       placeholder={translate('numerology_name_placeholder')} autoComplete='off'/>
                {!debouncedName ? <p className={classes.muted}>{translate('numerology_no_name')}</p> : null}
            </div>

            {!data ? <LoaderComponent/> : (
                <div className={classNames(classes.body, {[classes.busy]: isFetching})}>
                    {data.ignored.length ? (
                        <Alert type='warning' showIcon message={translate('numerology_ignored', {chars: data.ignored.join(' ')})}/>
                    ) : null}
                    <div className={classes.grid}>
                        {ORDER.map((k, i) => card(k, data.numbers[k], i))}
                        {card('personalYear', data.personalYear !== null ? {value: data.personalYear} : null, ORDER.length,
                            data.personalYearOf ? `${n.kinds.personalYear.meaning} ${translate('personal_year_of', {year: data.personalYearOf})}` : undefined)}
                        {card('personalMonth', data.personalMonth !== null ? {value: data.personalMonth} : null, ORDER.length + 1)}
                    </div>

                    {data.letters.length ? (
                        <section className={classes.section} aria-labelledby='num-letters'>
                            <h3 id='num-letters'>{translate('numerology_letters')}</h3>
                            <ol className={classes.letters}>
                                {data.letters.map((l, i) => (
                                    <li key={`${l.letter}-${i}`} className={classNames({[classes.vowel]: l.vowel})}
                                        title={l.letter !== l.base ? `${l.letter} = ${l.base}` : undefined}>
                                        <span>{l.letter.toUpperCase()}</span>
                                        <b>{l.value}</b>
                                    </li>
                                ))}
                            </ol>
                        </section>
                    ) : null}

                    <p className={classes.note}>{translate('numerology_method')}</p>
                </div>
            )}
        </div>
    );
};

export default NumerologyPanelComponent;
