import {useMemo} from 'react';
import useLocalization, {useContent} from 'assets/lang';
import {useMatrixLinesStyles} from './matrix-lines.style';
import {IMatrixLines} from './matrix-lines';

type LineKey = 'love' | 'money' | 'financeProgram' | 'karmicTail' | 'maleLine' | 'femaleLine';

// The matrix points each line passes through, in the order the engine lists them (see destiny/matrix.py).
const LINE_POINTS: Record<LineKey, string[][]> = {
    love: [['M', 'R1', 'R']],
    money: [['L', 'R2', 'R']],
    financeProgram: [['C', 'Q', 'L']],
    karmicTail: [['M', 'N', 'D']],
    maleLine: [['F', 'F1', 'F2'], ['H2', 'H1', 'H']],
    femaleLine: [['I', 'I1', 'I2'], ['G2', 'G1', 'G']],
};
const ORDER: LineKey[] = ['love', 'money', 'financeProgram', 'karmicTail', 'maleLine', 'femaleLine'];
const ROLES = ['lines_step_1', 'lines_step_2', 'lines_step_3'] as const;

// The six lines of the Destiny Matrix: for each, what it describes, the three steps (number, arcana and the matrix point
// it comes from) and, collapsed, the light and shadow side of each arcana. The numbers come from the engine.
const MatrixLinesComponent = ({matrix}: IMatrixLines) => {
    const translate = useLocalization();
    const content = useContent();
    const classes = useMatrixLinesStyles();
    const d = content.destiny as unknown as {
        lines: Record<string, string>; lineInfo: Record<string, string>;
        positions: Record<string, {name: string; meaning: string}>;
        arcana: Record<string, {name: string; keywords: string; plus: string; minus: string}>;
    };

    const rows = useMemo(() => ORDER.map((key) => ({
        key,
        branches: LINE_POINTS[key].map((keys) => keys.map((p) => ({point: p, value: matrix.points[p]}))),
    })), [matrix.points]);

    return (
        <div className={classes.wrap}>
            <p className={classes.muted}>{translate('lines_how')}</p>
            {rows.map((row) => (
                <article key={row.key} className={classes.card}>
                    <h4>{d.lines[row.key]}</h4>
                    <p>{d.lineInfo[row.key]}</p>
                    {row.branches.map((steps, bi) => (
                        <div key={bi} className={classes.branch}>
                            <ol className={classes.steps}>
                                {steps.map((s, i) => (
                                    <li key={s.point} className={classes.step}>
                                        <span className={classes.role}>{translate(ROLES[i])}</span>
                                        <b>{s.value}</b>
                                        <strong>{d.arcana[String(s.value)]?.name}</strong>
                                        <em>{d.arcana[String(s.value)]?.keywords}</em>
                                        <span>{d.positions[s.point]?.name}</span>
                                    </li>
                                ))}
                            </ol>
                            <details className={classes.more}>
                                <summary>{translate('lines_read_more')}</summary>
                                {steps.map((s) => (
                                    <p key={s.point}>
                                        <strong>{s.value} · {d.arcana[String(s.value)]?.name} ({d.positions[s.point]?.name}).</strong>{' '}
                                        {translate('lines_plus')} {d.arcana[String(s.value)]?.plus} {translate('lines_minus')} {d.arcana[String(s.value)]?.minus}
                                    </p>
                                ))}
                            </details>
                        </div>
                    ))}
                </article>
            ))}
        </div>
    );
};

export default MatrixLinesComponent;
