import {useCallback, useMemo} from 'react';
import {motion, useReducedMotion} from 'framer-motion';
import classNames from 'classnames';
import useLocalization, {useContent} from 'assets/lang';
import {AGE_CORNERS, buildNodes, C} from './matrix-diagram.geometry';
import {useMatrixDiagramStyles} from './matrix-diagram.style';
import {IMatrixDiagram} from './matrix-diagram';

const EASE = [0.22, 1, 0.36, 1] as const;

// Lines drawn first (in this order), then the nodes group by group
const LINES: [string, string][] = [
    ['A', 'B'], ['B', 'C'], ['C', 'D'], ['D', 'A'],      // personal square
    ['F', 'G'], ['G', 'H'], ['H', 'I'], ['I', 'F'],      // ancestral square
    ['A', 'C'], ['B', 'D'], ['F', 'H'], ['G', 'I'],      // axes and diagonals
    ['L', 'R2'], ['R2', 'R'], ['R', 'R1'], ['R1', 'M'],  // money and love line
];
const GROUP_ORDER = ['anchor', 'center', 'ancestral', 'personal', 'love', 'money'];

const MatrixDiagramComponent = ({points, activeKey, onSelect}: IMatrixDiagram) => {
    const translate = useLocalization();
    const content = useContent();
    const reduce = useReducedMotion();
    const classes = useMatrixDiagramStyles();
    const nodes = useMemo(() => buildNodes(), []);
    const byKey = useMemo(() => Object.fromEntries(nodes.map((n) => [n.key, n])), [nodes]);

    const handleSelect = useCallback((e: React.SyntheticEvent<SVGGElement>) => {
        const key = e.currentTarget.dataset.key;
        if (key) onSelect(key);
    }, [onSelect]);

    const handleKey = useCallback((e: React.KeyboardEvent<SVGGElement>) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            const key = e.currentTarget.dataset.key;
            if (key) onSelect(key);
        }
    }, [onSelect]);

    const draw = (i: number) => (reduce ? {initial: false as const} : {
        initial: {pathLength: 0, opacity: 0},
        animate: {pathLength: 1, opacity: 1},
        transition: {delay: 0.1 + i * 0.06, duration: 0.9, ease: EASE},
    });

    return (
        <svg className={classes.svg} viewBox='-50 -50 700 700' role='group' aria-label={translate('destiny_diagram_label')}>
            <motion.circle cx={C} cy={C} r={236 * 1.12} className={classes.ring} {...draw(0)}/>
            {AGE_CORNERS.map((a, i) => (
                <motion.text key={a.key} x={a.x} y={a.y} className={classes.age} textAnchor='middle' dominantBaseline='central'
                             initial={reduce ? false : {opacity: 0}} animate={{opacity: 1}}
                             transition={{delay: 1.2 + i * 0.05, duration: 0.6}}>
                    {a.age}
                </motion.text>
            ))}

            {LINES.map(([a, b], i) => (
                <motion.line key={`${a}-${b}`} x1={byKey[a].x} y1={byKey[a].y} x2={byKey[b].x} y2={byKey[b].y}
                             className={classNames(classes.line, {
                                 [classes.lineLove]: ['R', 'R1', 'M'].includes(a) && ['R', 'R1', 'M'].includes(b),
                                 [classes.lineMoney]: ['L', 'R2'].includes(a) || ['L', 'R2'].includes(b),
                             })}
                             {...draw(i)}/>
            ))}

            {nodes.map((n) => {
                const value = points[n.key];
                const order = GROUP_ORDER.indexOf(n.group);
                const isActive = activeKey === n.key;
                const name = content.destiny.positions[n.key as keyof typeof content.destiny.positions]?.name ?? n.key;
                const arcana = content.destiny.arcana[String(value) as keyof typeof content.destiny.arcana]?.name ?? '';
                return (
                    <motion.g
                        key={n.key}
                        data-key={n.key}
                        role='button'
                        tabIndex={0}
                        aria-pressed={isActive}
                        aria-label={`${name}: ${value} — ${arcana}`}
                        className={classNames(classes.node, classes[n.group], {[classes.active]: isActive})}
                        onClick={handleSelect}
                        onKeyDown={handleKey}
                        style={{transformOrigin: `${n.x}px ${n.y}px`, transformBox: 'view-box'}}
                        {...(reduce ? {initial: false as const} : {
                            initial: {opacity: 0, scale: 0.3},
                            animate: {opacity: 1, scale: 1},
                            transition: {delay: 1.0 + order * 0.25 + (n.r % 5) * 0.03, duration: 0.5, ease: EASE},
                        })}
                    >
                        <title>{`${name}: ${value} — ${arcana}`}</title>
                        <circle cx={n.x} cy={n.y} r={n.r}/>
                        <text x={n.x} y={n.y} textAnchor='middle' dominantBaseline='central'
                              style={{fontSize: Math.max(11, n.r * 0.72)}} aria-hidden='true'>
                            {value}
                        </text>
                    </motion.g>
                );
            })}
        </svg>
    );
};

export default MatrixDiagramComponent;
