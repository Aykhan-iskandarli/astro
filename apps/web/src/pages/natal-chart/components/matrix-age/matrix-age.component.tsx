import {useMemo} from 'react';
import useLocalization, {useContent} from 'assets/lang';
import {useMatrixLinesStyles} from '../matrix-lines/matrix-lines.style';
import {IMatrixAge} from './matrix-age';

// How to read the age line, and the period the person is in now with the next one: each point of the ring is a stretch
// of about a year and a quarter, the corners are the decades (0, 10, 20, ...). The ages and arcana come from the engine.
const MatrixAgeComponent = ({matrix, currentAge}: IMatrixAge) => {
    const translate = useLocalization();
    const content = useContent();
    const classes = useMatrixLinesStyles();
    const arcana = (content.destiny as unknown as {arcana: Record<string, {name: string; keywords: string; plus: string; minus: string}>}).arcana;

    const {now, next} = useMemo(() => {
        if (currentAge === null) return {now: null, next: null};
        const steps = [...matrix.ageTimeline].sort((a, b) => a.age - b.age);
        const i = steps.reduce((found, s, k) => (s.age <= currentAge ? k : found), -1);
        return {now: i >= 0 ? steps[i] : null, next: steps[i + 1] ?? null};
    }, [matrix, currentAge]);

    const age = (a: number) => {
        const y = Math.floor(a);
        const m = Math.round((a - y) * 12);
        return m ? translate('age_ym', {y, m}) : translate('age_years', {age: y});
    };

    const period = (label: string, s: {age: number; arcana: number}, until: number | null) => {
        const a = arcana[String(s.arcana)];
        return (
            <div className={classes.card}>
                <span className={classes.role}>{label}</span>
                <h4>{s.arcana} · {a?.name}</h4>
                <p>{age(s.age)} – {age(until ?? s.age + 1.25)}</p>
                <p><em>{a?.keywords}</em></p>
                <p>{translate('lines_plus')} {a?.plus}</p>
                <p>{translate('lines_minus')} {a?.minus}</p>
            </div>
        );
    };

    return (
        <div className={classes.wrap}>
            <p className={classes.muted}>{translate('age_how')}</p>
            {now ? period(translate('age_now'), now, next?.age ?? null) : null}
            {next ? period(translate('age_next'), next, null) : null}
        </div>
    );
};

export default MatrixAgeComponent;
