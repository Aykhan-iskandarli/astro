import {useCallback, useMemo, useState} from 'react';
import {Table} from 'antd';
import type {ColumnsType} from 'antd/es/table';
import {AnimatePresence, motion} from 'framer-motion';
import classNames from 'classnames';
import useLocalization, {useContent} from 'assets/lang';
import MatrixDiagramComponent from '../matrix-diagram/matrix-diagram.component';
import {IChakraRow} from '../../models/destiny-matrix.model';
import {useDestinyMatrixStyles} from './destiny-matrix.style';
import {IDestinyMatrix} from './destiny-matrix';

const PURPOSE_GROUPS = [['sky', 'earth', 'personal'], ['male', 'female', 'social'], ['spiritual']];
const AGE_STEP = 1.25;

const yearsSince = (iso: string) => {
    const birth = new Date(`${iso}T00:00:00`);
    return (Date.now() - birth.getTime()) / (365.2425 * 24 * 3600 * 1000);
};

const DestinyMatrixComponent = ({matrix}: IDestinyMatrix) => {
    const translate = useLocalization();
    const content = useContent();
    const d = content.destiny;
    const classes = useDestinyMatrixStyles();
    const [selected, setSelected] = useState<string>('E');

    const handleSelect = useCallback((key: string) => {
        setSelected(key);
    }, []);

    const arcana = useCallback((n: number) => d.arcana[String(n) as keyof typeof d.arcana], [d]);

    const value = matrix.points[selected];
    const position = d.positions[selected as keyof typeof d.positions];
    const card = arcana(value);

    const currentAge = matrix.date ? yearsSince(matrix.date) : null;

    const chakraColumns: ColumnsType<IChakraRow & {name: string}> = useMemo(() => [
        {title: translate('col_chakra'), dataIndex: 'name'},
        {title: translate('col_physical'), dataIndex: 'physical', align: 'center'},
        {title: translate('col_energy'), dataIndex: 'energy', align: 'center'},
        {title: translate('col_emotion'), dataIndex: 'emotion', align: 'center'},
    ], [translate]);

    const chakraRows = useMemo(() => {
        const rows = matrix.chakras.map((c) => ({...c, name: d.chakras[c.id as keyof typeof d.chakras] ?? c.id}));
        if (matrix.chakraTotal) rows.push({id: 'total', name: translate('total'), ...matrix.chakraTotal});
        return rows;
    }, [matrix, d, translate]);

    const lineRows = useMemo(() => {
        const lines = matrix.lines as Record<string, number[] | number[][]>;
        return (['love', 'money', 'financeProgram', 'karmicTail', 'maleLine', 'femaleLine'] as const).map((k) => ({
            key: k,
            name: d.lines[k],
            values: (Array.isArray(lines[k]?.[0]) ? (lines[k] as number[][]) : [lines[k] as number[]]).filter(Boolean),
        }));
    }, [matrix, d]);

    const totalRowClass = useCallback((r: {id: string}) => (r.id === 'total' ? classes.totalRow : ''), [classes.totalRow]);

    const sectors = useMemo(() => Array.from({length: 8}, (_, i) => matrix.ageTimeline.slice(i * 8, i * 8 + 8)), [matrix]);

    return (
        <div className={classes.wrapper}>
            <header className={classes.head}>
                <h2>{translate('destiny_title')}</h2>
                <p>{translate('destiny_subtitle')}</p>
                <p className={classes.note}>{translate('destiny_method_note')}</p>
            </header>

            <div className={classes.stage}>
                <MatrixDiagramComponent points={matrix.points} activeKey={selected} onSelect={handleSelect}/>
                <aside className={classes.panel} aria-live='polite'>
                    <AnimatePresence mode='wait'>
                        {card ? (
                            <motion.article key={selected} initial={{opacity: 0, y: 8}} animate={{opacity: 1, y: 0}}
                                            exit={{opacity: 0, y: -6}} transition={{duration: 0.3}}>
                                <p className={classes.eyebrow}>{position?.name}</p>
                                <div className={classes.cardHead}>
                                    <span className={classes.number}>{value}</span>
                                    <div>
                                        <h3>{card.name}</h3>
                                        <p className={classes.keywords}>{card.keywords}</p>
                                    </div>
                                </div>
                                {position?.meaning ? <p className={classes.meaning}>{position.meaning}</p> : null}
                                <dl className={classes.sides}>
                                    <dt>{translate('destiny_plus')}</dt>
                                    <dd>{card.plus}</dd>
                                    <dt>{translate('destiny_minus')}</dt>
                                    <dd>{card.minus}</dd>
                                </dl>
                            </motion.article>
                        ) : <p className={classes.meaning}>{translate('destiny_hint')}</p>}
                    </AnimatePresence>
                </aside>
            </div>

            <section className={classes.section} aria-labelledby='dm-purposes'>
                <h3 id='dm-purposes'>{translate('section_purposes')}</h3>
                <div className={classes.purposes}>
                    {PURPOSE_GROUPS.map((group) => (
                        <div key={group.join('-')} className={classes.purposeGroup}>
                            {group.map((k) => {
                                const v = matrix.purposes[k];
                                const info = d.purposes[k as keyof typeof d.purposes];
                                return (
                                    <div key={k} className={classNames(classes.purpose, {[classes.purposeMain]: group[group.length - 1] === k})}>
                                        <span className={classes.purposeNumber}>{v}</span>
                                        <div>
                                            <strong>{info?.name}</strong>
                                            <span>{arcana(v)?.name}</span>
                                            <small>{info?.meaning}</small>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ))}
                </div>
            </section>

            <section className={classes.section} aria-labelledby='dm-health'>
                <h3 id='dm-health'>{translate('section_health')}</h3>
                <Table rowKey='id' size='small' columns={chakraColumns} dataSource={chakraRows} pagination={false}
                       scroll={{x: true}} rowClassName={totalRowClass}/>
            </section>

            <section className={classes.section} aria-labelledby='dm-lines'>
                <h3 id='dm-lines'>{translate('section_lines')}</h3>
                <ul className={classes.lines}>
                    {lineRows.map((l) => (
                        <li key={l.key}>
                            <strong>{l.name}</strong>
                            <span>
                                {l.values.map((seq) => (
                                    <span key={seq.join('-')} className={classes.sequence}
                                          title={seq.map((n) => `${n} — ${arcana(n)?.name}`).join(' · ')}>
                                        {seq.join(' – ')}
                                    </span>
                                ))}
                            </span>
                        </li>
                    ))}
                </ul>
            </section>

            <section className={classes.section} aria-labelledby='dm-age'>
                <h3 id='dm-age'>{translate('section_age')}</h3>
                <div className={classes.ages}>
                    {sectors.map((steps) => (
                        <ol key={steps[0]?.age} className={classes.sector}>
                            {steps.map((s) => {
                                const now = currentAge !== null && currentAge >= s.age && currentAge < s.age + AGE_STEP;
                                return (
                                    <li key={s.age} className={classNames(classes.step, {[classes.stepCorner]: s.corner, [classes.stepNow]: now})}
                                        title={`${translate('age_years', {age: s.age})}: ${s.arcana} — ${arcana(s.arcana)?.name}${now ? ` (${translate('current_age')})` : ''}`}>
                                        <span>{String(s.age)}</span>
                                        <b>{s.arcana}</b>
                                    </li>
                                );
                            })}
                        </ol>
                    ))}
                </div>
            </section>
        </div>
    );
};

export default DestinyMatrixComponent;
