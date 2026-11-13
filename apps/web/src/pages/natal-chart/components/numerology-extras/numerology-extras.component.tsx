import {useCallback, useMemo, useState} from 'react';
import {DatePicker, Input} from 'antd';
import dayjs, {Dayjs} from 'dayjs';
import classNames from 'classnames';
import {useDebouncedValue} from 'core/helpers/use-debounced-value';
import useLocalization, {useContent} from 'assets/lang';
import {useGetNumerology, useGetNumerologyCompatibility} from '../../actions/natal-chart.query';
import {INumerologyPerson} from '../../actions/natal-chart.service';
import LoShuComponent from '../lo-shu/lo-shu.component';
import PsychomatrixComponent from '../psychomatrix/psychomatrix.component';
import {useNumerologyExtrasStyles} from './numerology-extras.style';
import {INumerologyExtras} from './numerology-extras';

const NAME_KINDS = ['expression', 'soulUrge', 'personality', 'maturity'] as const;
const MIN = dayjs('1800-01-01');
const MAX = dayjs('2999-12-31');

// Pinnacles and challenges, a "what if my name were…" check, and name/date compatibility with another person.
const NumerologyExtrasComponent = ({data, birthDate, fullName}: INumerologyExtras) => {
    const translate = useLocalization();
    const content = useContent();
    const n = content.numerology;
    const classes = useNumerologyExtrasStyles();

    // Name change
    const [altName, setAltName] = useState('');
    const debouncedAlt = useDebouncedValue(altName.trim(), 400);
    const {data: alt} = useGetNumerology(debouncedAlt ? birthDate : null, debouncedAlt);

    // Compatibility
    const [partnerName, setPartnerName] = useState('');
    const [partnerDate, setPartnerDate] = useState<Dayjs | null>(null);
    const debouncedPartner = useDebouncedValue(partnerName.trim(), 400);
    const first: INumerologyPerson | null = useMemo(() => ({date: birthDate, fullName: fullName || null}), [birthDate, fullName]);
    const second: INumerologyPerson | null = useMemo(() => (partnerDate
        ? {date: partnerDate.format('YYYY-MM-DD'), fullName: debouncedPartner || null}
        : null), [partnerDate, debouncedPartner]);
    const {data: compat} = useGetNumerologyCompatibility(second ? first : null, second);

    const handleAlt = useCallback((e: React.ChangeEvent<HTMLInputElement>) => setAltName(e.target.value), []);
    const handlePartnerName = useCallback((e: React.ChangeEvent<HTMLInputElement>) => setPartnerName(e.target.value), []);
    const handlePartnerDate = useCallback((v: Dayjs | null) => setPartnerDate(v), []);
    const disabledDate = useCallback((d: Dayjs) => d.isBefore(MIN) || d.isAfter(MAX), []);

    const numberName = (v: number) => n.numbers[String(v) as keyof typeof n.numbers];
    const kindName = (k: string) => n.kinds[k as keyof typeof n.kinds]?.name ?? k;

    return (
        <>
            {data.psychomatrix ? <PsychomatrixComponent data={data.psychomatrix}/> : null}
            {data.loShu ? <LoShuComponent loShu={data.loShu}/> : null}

            {data.pinnacles.length ? (
                <section className={classes.section} aria-labelledby='num-pinnacles'>
                    <h3 id='num-pinnacles'>{translate('numerology_pinnacles_title')}</h3>
                    <p className={classes.lead}>{translate('numerology_pinnacles_info')}</p>
                    <div className={classes.grid}>
                        {data.pinnacles.map((p) => (
                            <article key={p.index} className={classNames(classes.card, {[classes.cardCurrent]: p.current})}>
                                <p className={classes.period}>
                                    {p.toAge === null
                                        ? translate('numerology_period_open', {from: p.fromAge, year: p.fromYear})
                                        : translate('numerology_period', {from: p.fromAge, to: p.toAge, fromYear: p.fromYear, toYear: p.toYear ?? ''})}
                                    {p.current ? ` · ${translate('numerology_now')}` : ''}
                                </p>
                                <div className={classes.row}>
                                    <span className={classes.big}>{p.value}</span>
                                    <div>
                                        <p className={classes.label}>{n.kinds.pinnacle.name}</p>
                                        <p className={classes.name}>{numberName(p.value)?.name}</p>
                                    </div>
                                </div>
                                <p className={classes.text}>{numberName(p.value)?.meaning}</p>
                                <hr className={classes.divider}/>
                                <div className={classes.row}>
                                    <span className={classes.big}>{p.challenge}</span>
                                    <div>
                                        <p className={classes.label}>{n.kinds.challenge.name}</p>
                                    </div>
                                </div>
                                <p className={classes.text}>{n.challenges[String(p.challenge) as keyof typeof n.challenges]}</p>
                            </article>
                        ))}
                    </div>
                </section>
            ) : null}

            <section className={classes.section} aria-labelledby='num-name-change'>
                <h3 id='num-name-change'>{translate('numerology_name_change_title')}</h3>
                <p className={classes.lead}>{translate('numerology_name_change_info')}</p>
                <div className={classes.inputs}>
                    <label htmlFor='numerology-alt-name'>
                        {translate('numerology_alt_name_label')}
                        <Input id='numerology-alt-name' size='large' value={altName} onChange={handleAlt} maxLength={120}
                               placeholder={translate('numerology_alt_name_placeholder')} autoComplete='off'/>
                    </label>
                </div>
                {debouncedAlt && alt ? (
                    <div className={classes.tableWrap}>
                        <table className={classes.table}>
                            <thead>
                                <tr>
                                    <th>{translate('numerology_col_number')}</th>
                                    <th>{fullName || translate('numerology_current_name')}</th>
                                    <th>{debouncedAlt}</th>
                                    <th/>
                                </tr>
                            </thead>
                            <tbody>
                                {NAME_KINDS.map((k) => {
                                    const a = data.numbers[k]?.value ?? null;
                                    const b = alt.numbers[k]?.value ?? null;
                                    return (
                                        <tr key={k}>
                                            <td>{kindName(k)}</td>
                                            <td>{a !== null ? <><b>{a}</b> {numberName(a)?.name}</> : '—'}</td>
                                            <td>{b !== null ? <><b>{b}</b> {numberName(b)?.name}</> : '—'}</td>
                                            <td className={a === b ? classes.same : classes.changed}>
                                                {a === b ? translate('numerology_unchanged') : translate('numerology_changed')}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                ) : null}
            </section>

            <section className={classes.section} aria-labelledby='num-compat'>
                <h3 id='num-compat'>{translate('numerology_compat_title')}</h3>
                <p className={classes.lead}>{translate('numerology_compat_info')}</p>
                <div className={classes.inputs}>
                    <label htmlFor='numerology-partner-name'>
                        {translate('numerology_partner_name')}
                        <Input id='numerology-partner-name' size='large' value={partnerName} onChange={handlePartnerName} maxLength={120}
                               placeholder={translate('numerology_partner_name_placeholder')} autoComplete='off'/>
                    </label>
                    <label htmlFor='numerology-partner-date'>
                        {translate('numerology_partner_date')}
                        <DatePicker id='numerology-partner-date' size='large' value={partnerDate} onChange={handlePartnerDate}
                                    format='DD.MM.YYYY' disabledDate={disabledDate} placeholder={translate('field_date_placeholder')}/>
                    </label>
                </div>
                {second && compat ? (
                    <>
                        <div className={classes.pairs}>
                            {compat.pairs.map((p) => {
                                const rel = n.relations[p.relation];
                                return (
                                    <article key={p.kind} className={classes.card}>
                                        <p className={classes.label}>{kindName(p.kind)}</p>
                                        <div className={classes.row}>
                                            <span className={classes.big}>{p.first}</span>
                                            <span className={classes.label}>↔</span>
                                            <span className={classes.big}>{p.second}</span>
                                        </div>
                                        <p className={classNames(classes.relation, classes[`rel_${p.relation}` as 'rel_same'])}>{rel.name}</p>
                                        <p className={classes.text}>{rel.meaning}</p>
                                    </article>
                                );
                            })}
                        </div>
                        {compat.pairs.length === 1 ? <p className={classes.note}>{translate('numerology_compat_names_hint')}</p> : null}
                        <p className={classes.note}>{translate('numerology_compat_method')}</p>
                    </>
                ) : null}
            </section>
        </>
    );
};

export default NumerologyExtrasComponent;
