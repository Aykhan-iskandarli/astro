import {useMemo} from 'react';
import {chartThemes, SIGNS, THEME_RULER} from 'core/helpers/themes';
import useLocalization, {useContent} from 'assets/lang';
import {useChartThemesStyles} from './chart-themes.style';
import {IChartThemes} from './chart-themes';

const MAIN = 3;
const MIN = 3;

// The themes that repeat in the chart: each of the twelve is fed by its sign, its house and its ruling planet, and a
// theme that turns up several times is a main line of the chart. Each card lists where the theme comes from.
const ChartThemesComponent = ({chart}: IChartThemes) => {
    const translate = useLocalization();
    const content = useContent();
    const classes = useChartThemesStyles();
    const texts = content.themes as unknown as Record<string, {name: string; text: string}>;

    const themes = useMemo(() => {
        const known = !chart.timeUnknown;
        const asc = known ? chart.angles.find((a) => a.id === 'asc')?.sign ?? null : null;
        const mc = known ? chart.angles.find((a) => a.id === 'mc')?.sign ?? null : null;
        return chartThemes(chart.points.map((p) => ({id: p.id, sign: p.sign, house: known ? p.house : null})), asc, mc);
    }, [chart]);
    const main = themes.filter((t) => t.score >= MIN).slice(0, MAIN);
    const max = Math.max(1, themes[0]?.score ?? 1);

    const name = (id: string) => content.points[id as keyof typeof content.points]?.name ?? id;
    const sign = (i: number) => content.signs[SIGNS[i - 1] as keyof typeof content.signs]?.name ?? '';
    const house = (n: number) => content.houses[String(n) as keyof typeof content.houses]?.name ?? '';
    const source = (theme: number, s: {kind: string; point: string}) => {
        if (s.kind === 'sign') return translate('th_src_sign', {point: name(s.point), sign: sign(theme)});
        if (s.kind === 'house') return translate('th_src_house', {point: name(s.point), house: house(theme)});
        if (s.kind === 'asc') return translate('th_src_asc', {sign: sign(theme)});
        if (s.kind === 'mc') return translate('th_src_mc', {sign: sign(theme)});
        return translate('th_src_ruler', {point: name(s.point)});
    };

    return (
        <section className={classes.wrap} aria-labelledby='sec-themes'>
            <h2 id='sec-themes' className={classes.title}>{translate('th_title')}</h2>
            <p className={classes.muted}>{translate('th_intro')}</p>
            {main.length ? (
                <div className={classes.grid}>
                    {main.map((t, i) => (
                        <article key={t.theme} className={classes.card}>
                            <p className={classes.label}>{translate('th_rank', {n: i + 1})}</p>
                            <h3>{texts[String(t.theme)]?.name}</h3>
                            <p className={classes.fact}>{translate('th_count', {n: t.sources.length, sign: sign(t.theme), house: house(t.theme), ruler: name(THEME_RULER[t.theme - 1])})}</p>
                            <p className={classes.text}>{texts[String(t.theme)]?.text}</p>
                            <div>
                                <h4>{translate('th_from')}</h4>
                                <ul className={classes.list}>
                                    {t.sources.map((s, k) => <li key={`${s.kind}-${s.point}-${k}`}>{source(t.theme, s)}</li>)}
                                </ul>
                            </div>
                        </article>
                    ))}
                </div>
            ) : <p className={classes.text}>{translate('th_none')}</p>}

            <div className={classes.bars} aria-label={translate('th_all')}>
                <p className={classes.label}>{translate('th_all')}</p>
                {themes.slice().sort((a, b) => a.theme - b.theme).map((t) => (
                    <div key={t.theme} className={classes.bar}>
                        <span>{texts[String(t.theme)]?.name}</span>
                        <span><i style={{width: `${(t.score / max) * 100}%`}}/></span>
                        <b>{t.score}</b>
                    </div>
                ))}
            </div>
            <p className={classes.note}>{translate('th_note')}</p>
        </section>
    );
};

export default ChartThemesComponent;
