import {useMemo, useState} from 'react';
import {Segmented} from 'antd';
import classNames from 'classnames';
import {IBirthInput} from 'store/store';
import useLocalization, {useContent} from 'assets/lang';
import {useGetChineseCompatibility, useGetGunaMilan, useGetNumerologyCompatibility} from '../../actions/natal-chart.query';
import {useExtrasStyles} from '../extras-ui/extras.style';
import {ICompatSummaryProps} from './compat-summary';

const PERSON_FIELDS = ['varna', 'vashya', 'yoni', 'gana', 'nadi'];

// Compatibility in the other systems for the same two people: Vedic Guna Milan + Manglik, numerology, Chinese zodiac.
const CompatSummaryComponent = ({first, second, firstName, secondName}: ICompatSummaryProps) => {
    const translate = useLocalization();
    const content = useContent();
    const m = content.vedic.match;
    const classes = useExtrasStyles();
    const [groomIs, setGroomIs] = useState<'first' | 'second'>('first');

    const groom: IBirthInput = groomIs === 'first' ? first : second;
    const bride: IBirthInput = groomIs === 'first' ? second : first;
    const {data: guna} = useGetGunaMilan(groom, bride);
    const numA = useMemo(() => ({date: first.date, fullName: first.name || null}), [first]);
    const numB = useMemo(() => ({date: second.date, fullName: second.name || null}), [second]);
    const {data: num} = useGetNumerologyCompatibility(numA, numB);
    const {data: cn} = useGetChineseCompatibility(first.date, second.date);

    const options = useMemo(() => [
        {value: 'first', label: translate('compat_groom_is', {name: firstName})},
        {value: 'second', label: translate('compat_groom_is', {name: secondName})},
    ], [translate, firstName, secondName]);
    const v = (key: string) => m.values[key as keyof typeof m.values] ?? key;

    return (
        <section className={classes.wrapper} aria-labelledby='compat-summary'>
            <h3 id='compat-summary' style={{fontSize: 28}}>{translate('compat_summary_title')}</h3>

            <section className={classes.section} aria-labelledby='compat-guna'>
                <h3 id='compat-guna'>{translate('compat_guna_title')}</h3>
                <p className={classes.lead}>{m.intro}</p>
                <Segmented options={options} value={groomIs} onChange={(x) => setGroomIs(x as 'first' | 'second')}/>
                {guna ? (
                    <>
                        <p className={classNames(classes.big, guna.verdict === 'weak' ? classes.bad : guna.verdict === 'excellent' ? classes.good : undefined)}>
                            {guna.total} / {guna.max}
                        </p>
                        <p className={classes.text}>{m.verdicts[guna.verdict]}</p>
                        <div className={classes.tableWrap}>
                            <table className={classes.table}>
                                <thead><tr><th>Koota</th><th>{translate('compat_groom')}</th><th>{translate('compat_bride')}</th><th>{translate('compat_points')}</th></tr></thead>
                                <tbody>
                                    {guna.kootas.map((k) => {
                                        // Kootas with a per-person category (the others are relations only)
                                        const shown = PERSON_FIELDS.includes(k.id);
                                        const of = (p: typeof guna.groom) => (shown && p ? v(String((p as unknown as Record<string, string>)[k.id])) : '—');
                                        return (
                                            <tr key={k.id} data-hot={k.score === k.max}>
                                                <td title={m.kootas[k.id as keyof typeof m.kootas]?.meaning}>{m.kootas[k.id as keyof typeof m.kootas]?.name}</td>
                                                <td>{of(guna.groom)}</td>
                                                <td>{of(guna.bride)}</td>
                                                <td className={k.score === 0 ? classes.bad : undefined}>{k.score} / {k.max}</td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                        <ul className={classes.list}>
                            {guna.kootas.map((k) => <li key={k.id}><b>{m.kootas[k.id as keyof typeof m.kootas]?.name}:</b> {m.kootas[k.id as keyof typeof m.kootas]?.meaning}</li>)}
                        </ul>
                        {guna.manglik ? (
                            <article className={classes.card}>
                                <p className={classes.title}>Manglik</p>
                                <p className={classes.text}>
                                    {translate('compat_groom')}: {translate(guna.manglik.groom ? 'compat_yes' : 'compat_no')} ·{' '}
                                    {translate('compat_bride')}: {translate(guna.manglik.bride ? 'compat_yes' : 'compat_no')}
                                    {guna.manglik.cancelled ? ` · ${translate('compat_manglik_cancelled')}` : ''}
                                    {guna.manglik.mismatch ? ` · ${translate('compat_manglik_mismatch')}` : ''}
                                </p>
                                <p className={classes.small}>{m.manglik}</p>
                            </article>
                        ) : null}
                        <p className={classes.small}>{translate('compat_guna_note')}</p>
                    </>
                ) : null}
            </section>

            <div className={classes.grid}>
                {num ? (
                    <article className={classes.card}>
                        <p className={classes.title}>{translate('numerology_compat_title')}</p>
                        <ul className={classes.list}>
                            {num.pairs.map((p) => (
                                <li key={p.kind}>
                                    {content.numerology.kinds[p.kind]?.name}: <b>{p.first} ↔ {p.second}</b> · {content.numerology.relations[p.relation].name}
                                </li>
                            ))}
                        </ul>
                    </article>
                ) : null}
                {cn?.first && cn.second ? (
                    <article className={classes.card}>
                        <p className={classes.title}>{translate('cn_compat_title')}</p>
                        <p className={classes.text}>
                            {content.chinese.animals[cn.first.animal as keyof typeof content.chinese.animals]} ↔{' '}
                            {content.chinese.animals[cn.second.animal as keyof typeof content.chinese.animals]}
                        </p>
                        <p className={classes.gold}>{content.chinese.relations[cn.relation].name}</p>
                        <p className={classes.small}>{content.chinese.relations[cn.relation].meaning}</p>
                    </article>
                ) : null}
            </div>
        </section>
    );
};

export default CompatSummaryComponent;
