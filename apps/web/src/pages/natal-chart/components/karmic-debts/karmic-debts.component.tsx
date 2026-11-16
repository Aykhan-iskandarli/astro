import {useMemo} from 'react';
import {karmicDebts} from 'core/helpers/karmic-debts';
import useLocalization, {useContent} from 'assets/lang';
import {useKarmicDebtsStyles} from './karmic-debts.style';
import {IKarmicDebts} from './karmic-debts';

const ORDER = ['lifePath', 'birthday', 'birthYear', 'expression', 'soulUrge', 'personality', 'maturity'] as const;

// All the karmic debts (13, 14, 16, 19) found in the person's numbers, in one place: where each comes from (the number
// and its reduction chain) and a longer reading. The numbers come from the engine; the readings are the traditional ones.
const KarmicDebtsComponent = ({numbers}: IKarmicDebts) => {
    const translate = useLocalization();
    const content = useContent();
    const classes = useKarmicDebtsStyles();
    const n = content.numerology as unknown as {
        kinds: Record<string, {name: string}>;
        karmicDebtReading: Record<string, {origin: string; shows: string; lesson: string}>;
    };
    const groups = useMemo(() => karmicDebts(numbers, ORDER), [numbers]);

    return (
        <section className={classes.wrap} aria-labelledby='num-debts'>
            <h3 id='num-debts' className={classes.title}>{translate('kd_title')}</h3>
            <p className={classes.muted}>{translate('kd_intro')}</p>
            {groups.length ? (
                <div className={classes.grid}>
                    {groups.map((g) => {
                        const r = n.karmicDebtReading[String(g.debt)];
                        return (
                            <article key={g.debt} className={classes.card}>
                                <p className={classes.label}>{translate('kd_debt')}</p>
                                <h4>{g.debt}/{g.sources[0].value}</h4>
                                <p className={classes.fact}>
                                    {g.sources.map((s) => `${n.kinds[s.kind]?.name}${s.derived ? ` (${translate('kd_derived')})` : ''}: ${s.chain.join(' → ')}`).join(' · ')}
                                </p>
                                <p className={classes.text}>{r.origin}</p>
                                <div>
                                    <h5>{translate('kd_shows')}</h5>
                                    <p className={classes.text}>{r.shows}</p>
                                </div>
                                <div>
                                    <h5>{translate('kd_lesson')}</h5>
                                    <p className={classes.text}>{r.lesson}</p>
                                </div>
                            </article>
                        );
                    })}
                </div>
            ) : <p className={classes.text}>{translate('kd_none')}</p>}
            <p className={classes.note}>{translate('kd_note')}</p>
        </section>
    );
};

export default KarmicDebtsComponent;
