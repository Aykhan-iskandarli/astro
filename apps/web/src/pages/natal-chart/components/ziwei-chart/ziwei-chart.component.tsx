import {useMemo} from 'react';
import {motion, useReducedMotion} from 'framer-motion';
import classNames from 'classnames';
import useLocalization, {useContent} from 'assets/lang';
import {BRANCH_CELL, buildAstrolabe} from './ziwei.helpers';
import {useZiweiChartStyles} from './ziwei-chart.style';
import {IZiweiChart} from './ziwei-chart';

const ZiweiChartComponent = ({date, time, gender, age}: IZiweiChart) => {
    const translate = useLocalization();
    const content = useContent();
    const c = content.chinese;
    const reduce = useReducedMotion();
    const classes = useZiweiChartStyles();
    const astrolabe = useMemo(() => buildAstrolabe(date, time, gender), [date, time, gender]);

    const starName = (name: string) => c.stars[name as keyof typeof c.stars]?.name ?? name;

    return (
        <div className={classes.grid} role='group' aria-label={translate('ziwei_title')}>
            {astrolabe.palaces.map((p, i) => {
                const [row, col] = BRANCH_CELL[p.earthlyBranch];
                const info = c.palaces[p.name as keyof typeof c.palaces];
                const [from, to] = p.decadal.range;
                const currentDecade = age !== null && age >= from && age <= to;
                return (
                    <motion.section
                        key={p.name}
                        className={classNames(classes.palace, {
                            [classes.soul]: p.name === 'soul',
                            [classes.current]: currentDecade,
                        })}
                        style={{gridRow: row, gridColumn: col}}
                        initial={reduce ? false : {opacity: 0, y: 8}}
                        animate={{opacity: 1, y: 0}}
                        transition={{delay: i * 0.04, duration: 0.4}}
                        aria-label={info?.name ?? p.name}
                        title={info?.meaning}
                    >
                        <header className={classes.palaceHead}>
                            <strong>{info?.name ?? p.name}</strong>
                            {p.isBodyPalace ? <span className={classes.bodyMark} title={translate('ziwei_body_palace')}>{translate('ziwei_body_short')}</span> : null}
                        </header>
                        <ul className={classes.major}>
                            {p.majorStars.map((s) => (
                                <li key={s.name} title={c.stars[s.name as keyof typeof c.stars]?.keywords}>
                                    <span>{starName(s.name)}</span>
                                    {s.brightness ? <small>{s.brightness}</small> : null}
                                    {s.mutagen ? (
                                        <b className={classes[`mut${s.mutagen}` as keyof typeof classes]}
                                           title={c.mutagens[s.mutagen as keyof typeof c.mutagens]}>{s.mutagen}</b>
                                    ) : null}
                                </li>
                            ))}
                        </ul>
                        {p.minorStars.length ? (
                            <p className={classes.minor}>{p.minorStars.map((s) => s.name).join(' · ')}</p>
                        ) : null}
                        <footer className={classes.palaceFoot}>
                            <span>{p.heavenlyStem} {p.earthlyBranch}</span>
                            <span>{from}–{to}</span>
                        </footer>
                    </motion.section>
                );
            })}
            <div className={classes.center}>
                <h4>{translate('ziwei_title')}</h4>
                <dl>
                    <dt>{translate('ziwei_five')}</dt><dd>{astrolabe.fiveElementsClass}</dd>
                    <dt>{translate('ziwei_soul_star')}</dt><dd>{astrolabe.soul}</dd>
                    <dt>{translate('ziwei_body_star')}</dt><dd>{astrolabe.body}</dd>
                    <dt>{translate('ziwei_lunar')}</dt><dd>{astrolabe.lunarDate}</dd>
                    <dt>{translate('ziwei_bazi')}</dt><dd>{astrolabe.chineseDate}</dd>
                </dl>
            </div>
        </div>
    );
};

export default ZiweiChartComponent;
