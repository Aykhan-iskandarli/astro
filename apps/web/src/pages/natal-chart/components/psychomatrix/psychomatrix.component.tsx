import classNames from 'classnames';
import useLocalization, {useContent} from 'assets/lang';
import {usePsychomatrixStyles} from './psychomatrix.style';
import {IPsychomatrixProps} from './psychomatrix';

// Grid layout: columns 1-2-3, 4-5-6, 7-8-9 (read top to bottom), as in the classic psychomatrix
const GRID = [1, 4, 7, 2, 5, 8, 3, 6, 9];
const LINES = ['selfEsteem', 'work', 'talent', 'purpose', 'family', 'habits', 'spirit', 'temperament'] as const;
const lineLevel = (n: number) => (n <= 2 ? 'low' : n <= 5 ? 'mid' : 'high');

// Pythagoras square (psychomatrix) from the birth date: cell counts, their meaning and the eight lines.
const PsychomatrixComponent = ({data}: IPsychomatrixProps) => {
    const translate = useLocalization();
    const content = useContent();
    const t = content.numerology.psychomatrix;
    const classes = usePsychomatrixStyles();
    const cell = (n: number) => t.cells[String(n) as keyof typeof t.cells];

    return (
        <section className={classes.section} aria-labelledby='num-psychomatrix'>
            <h3 id='num-psychomatrix'>{translate('psychomatrix_title')}</h3>
            <p className={classes.lead}>{t.intro}</p>
            <p className={classes.work}>
                {t.workNumbers}: {data.workNumbers.map((w, i) => <b key={i}>{w}</b>)}
            </p>
            <div className={classes.layout}>
                <div className={classes.grid} role='table' aria-label={translate('psychomatrix_title')}>
                    {GRID.map((n) => {
                        const count = data.counts[String(n)] ?? 0;
                        return (
                            <div key={n} role='cell' className={classNames(classes.cell, {[classes.cellEmpty]: !count})}>
                                <b>{count ? String(n).repeat(count) : '—'}</b>
                                <small>{cell(n)?.name}</small>
                            </div>
                        );
                    })}
                </div>
                <ul className={classes.list}>
                    {Array.from({length: 9}, (_, i) => i + 1).map((n) => {
                        const count = data.counts[String(n)] ?? 0;
                        return (
                            <li key={n}>
                                <b>{n} · {cell(n)?.name}</b> <span className={classes.count}>({count})</span> — {cell(n)?.levels[String(Math.min(count, 4)) as '0']}
                            </li>
                        );
                    })}
                </ul>
            </div>
            <div className={classes.lines}>
                {LINES.map((id) => {
                    const total = data.lines[id] ?? 0;
                    return (
                        <div key={id} className={classes.line}>
                            <b>{t.lines[id].name}: <span className={classes.count}>{total}</span></b>
                            <span>{t.lines[id][lineLevel(total)]}</span>
                        </div>
                    );
                })}
            </div>
            {data.variant === '2000+' ? <p className={classes.note}>{t.variant2000}</p> : null}
        </section>
    );
};

export default PsychomatrixComponent;
