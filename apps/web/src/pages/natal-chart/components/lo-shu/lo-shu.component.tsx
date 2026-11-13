import classNames from 'classnames';
import useLocalization, {useContent} from 'assets/lang';
import {useLoShuStyles} from './lo-shu.style';
import {ILoShuProps} from './lo-shu';

// Lo Shu magic square from the birth date: digit counts, complete and empty lines, missing numbers.
const LoShuComponent = ({loShu}: ILoShuProps) => {
    const translate = useLocalization();
    const content = useContent();
    const t = content.numerology.loShu;
    const classes = useLoShuStyles();

    const complete = loShu.lines.filter((l) => l.complete);
    const empty = loShu.lines.filter((l) => l.empty);
    const lineName = (id: string) => t.lines[id as keyof typeof t.lines];

    return (
        <section className={classes.section} aria-labelledby='num-lo-shu'>
            <h3 id='num-lo-shu'>{translate('lo_shu_title')}</h3>
            <p className={classes.lead}>{t.intro}</p>
            <div className={classes.layout}>
                <div className={classes.grid} role='table' aria-label={translate('lo_shu_title')}>
                    {loShu.grid.flat().map((n) => {
                        const count = loShu.counts[String(n)] ?? 0;
                        return (
                            <div key={n} role='cell' className={classNames(classes.cell, {[classes.cellEmpty]: !count})}
                                 aria-label={translate('lo_shu_cell', {n, count})}>
                                <b>{count ? String(n).repeat(count) : n}</b>
                                <small>{count ? `× ${count}` : '—'}</small>
                            </div>
                        );
                    })}
                </div>
                <div className={classes.side}>
                    {complete.length ? (
                        <div>
                            <p className={classes.subhead}>{translate('lo_shu_complete')}</p>
                            <ul className={classes.list}>
                                {complete.map((l) => (
                                    <li key={l.id}><b className={classes.complete}>{lineName(l.id)?.name}</b> — {lineName(l.id)?.meaning}</li>
                                ))}
                            </ul>
                        </div>
                    ) : null}
                    {empty.length ? (
                        <div>
                            <p className={classes.subhead}>{translate('lo_shu_empty')}</p>
                            <ul className={classes.list}>
                                {empty.map((l) => <li key={l.id}><b>{lineName(l.id)?.name}</b> — {t.emptyLine}</li>)}
                            </ul>
                        </div>
                    ) : null}
                    {loShu.missing.length ? (
                        <div>
                            <p className={classes.subhead}>{translate('lo_shu_missing')}</p>
                            <ul className={classes.list}>
                                {loShu.missing.map((n) => <li key={n}><b>{n}</b> — {t.missing[String(n) as keyof typeof t.missing]}</li>)}
                            </ul>
                        </div>
                    ) : null}
                </div>
            </div>
            <p className={classes.note}>{translate('lo_shu_note')}</p>
        </section>
    );
};

export default LoShuComponent;
