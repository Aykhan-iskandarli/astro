import {useCallback, useMemo} from 'react';
import {motion, useReducedMotion} from 'framer-motion';
import classNames from 'classnames';
import {aspectTone, ELEMENT_OF_SIGN, formatDegree, glyph, POINT_GLYPHS, SIGN_GLYPHS, SIGNS} from 'core/helpers/astro';
import useLocalization, {useContent} from 'assets/lang';
import colors from 'assets/styles/abstracts/color';
import {polar, screenAngle, sectorPath, spreadLongitudes} from './chart-wheel.geometry';
import {useChartWheelStyles} from './chart-wheel.style';
import {IChartWheel} from './chart-wheel';

const C = 300;
const R_OUT = 292;
const R_SIGN_IN = 252;
const R_TICK_IN = 244;
const R_PLANET = 220;
const R_DEGREE = 196;
const R_HOUSE_NUM = 142;
const R_INNER = 128;
const R_ASPECT = 124;
// Bi-wheel: outer ring outside the sign band
const R_OUT2 = 358;
const R_OUTER_PLANET = 318;
const R_OUTER_DEGREE = 343;
const EASE = [0.22, 1, 0.36, 1] as const;

// Draw-in timeline (seconds): rings → signs → houses → planets → aspects
const T = {rings: 0, signs: 0.5, houses: 1.1, planets: 1.8, aspects: 2.7};

const ChartWheelComponent = ({chart, outer, activeId, selectedId, onActivate, onSelect}: IChartWheel) => {
    const translate = useLocalization();
    const content = useContent();
    const reduce = useReducedMotion();
    const classes = useChartWheelStyles();
    const anim = !reduce;

    const asc = chart.angles.find((a) => a.id === 'asc')?.longitude ?? 0;
    const angle = useCallback((lon: number) => screenAngle(lon, asc), [asc]);

    const points = useMemo(() => chart.points.filter((p) => p.longitude !== null), [chart.points]);
    const display = useMemo(() => spreadLongitudes(points.map((p) => p.longitude!), 7.5), [points]);
    const pointLon = useMemo(() => {
        const map: Record<string, number> = {};
        points.forEach((p) => (map[p.id!] = p.longitude!));
        chart.angles.forEach((a) => (map[a.id!] = a.longitude!));
        return map;
    }, [points, chart.angles]);

    const aspects = useMemo(() => chart.aspects.filter((a) => pointLon[a.p1!] !== undefined && pointLon[a.p2!] !== undefined), [chart.aspects, pointLon]);

    const outerPoints = useMemo(() => outer?.points.filter((p) => p.longitude !== null) ?? [], [outer]);
    const outerDisplay = useMemo(() => spreadLongitudes(outerPoints.map((p) => p.longitude!), 7.5), [outerPoints]);
    const outerLon = useMemo(() => Object.fromEntries(outerPoints.map((p) => [p.id!, p.longitude!])), [outerPoints]);

    // Lines drawn in the centre: the chart's own aspects, or (bi-wheel) the cross aspects outer -> inner.
    // Outer ids are prefixed with "o:" so the same planet inside and outside stay distinct.
    const lines = useMemo(() => (outer
        ? outer.aspects.filter((a) => outerLon[a.p1!] !== undefined && pointLon[a.p2!] !== undefined).map((a) => ({
            key: `o:${a.p1}-${a.p2}`, idA: `o:${a.p1}`, idB: a.p2!, lonA: outerLon[a.p1!], lonB: pointLon[a.p2!],
            type: a.type!, major: a.major,
        }))
        : aspects.map((a) => ({
            key: `${a.p1}-${a.p2}`, idA: a.p1!, idB: a.p2!, lonA: pointLon[a.p1!], lonB: pointLon[a.p2!],
            type: a.type!, major: a.major,
        }))), [outer, outerLon, aspects, pointLon]);

    const linkedTo = useCallback((id: string) => lines.some((l) => (l.idA === activeId && l.idB === id) || (l.idB === activeId && l.idA === id)), [lines, activeId]);

    const handleEnter = useCallback((e: React.SyntheticEvent<SVGGElement>) => {
        onActivate(e.currentTarget.dataset.id ?? null);
    }, [onActivate]);

    const handleLeave = useCallback(() => {
        onActivate(null);
    }, [onActivate]);

    const handleClick = useCallback((e: React.SyntheticEvent<SVGGElement>) => {
        const id = e.currentTarget.dataset.id;
        if (id) onSelect(id);
    }, [onSelect]);

    const handleKey = useCallback((e: React.KeyboardEvent<SVGGElement>) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            const id = e.currentTarget.dataset.id;
            if (id) onSelect(id);
        }
    }, [onSelect]);

    const draw = (delay: number, duration = 1) => (anim
        ? {initial: {pathLength: 0, opacity: 0}, animate: {pathLength: 1, opacity: 1}, transition: {delay, duration, ease: EASE}}
        : {initial: false as const});
    const fade = (delay: number, duration = 0.6) => (anim
        ? {initial: {opacity: 0}, animate: {opacity: 1}, transition: {delay, duration, ease: EASE}}
        : {initial: false as const});

    const pointLabel = (id: string) => content.points[id as keyof typeof content.points]?.name ?? id;

    return (
        <svg
            className={classes.wheel}
            viewBox={outer ? '-92 -92 784 784' : '-28 -28 656 656'}
            role='group'
            aria-label={translate('chart_wheel_label')}
        >
            {/* Rings */}
            {[...(outer ? [R_OUT2] : []), R_OUT, R_SIGN_IN, R_TICK_IN, R_INNER].map((r, i) => (
                <motion.circle key={r} cx={C} cy={C} r={r} className={classes.ring} {...draw(T.rings + i * 0.12, 1.2)}/>
            ))}

            {/* Signs */}
            {SIGNS.map((sign, i) => {
                const a0 = angle(i * 30);
                const a1 = angle(i * 30 + 30);
                const mid = polar(C, C, (R_OUT + R_SIGN_IN) / 2, angle(i * 30 + 15));
                const element = ELEMENT_OF_SIGN[sign];
                return (
                    <motion.g key={sign} {...fade(T.signs + i * 0.05)}>
                        <path d={sectorPath(C, C, R_SIGN_IN, R_OUT, a0, a1)} fill={colors[element]} fillOpacity={0.07}
                              stroke={colors.border} strokeWidth={1}/>
                        <text x={mid.x} y={mid.y} className={classNames('glyph', classes.signGlyph)} fill={colors[element]}
                              textAnchor='middle' dominantBaseline='central'>
                            <title>{content.signs[sign].name}</title>
                            {glyph(SIGN_GLYPHS[sign])}
                        </text>
                    </motion.g>
                );
            })}

            {/* Degree ticks every 5° (longer every 10°) */}
            <motion.g {...fade(T.signs + 0.4)} aria-hidden='true'>
                {Array.from({length: 72}, (_, k) => {
                    const a = angle(k * 5);
                    const inner = k % 2 === 0 ? R_TICK_IN - 4 : R_TICK_IN;
                    const p1 = polar(C, C, inner, a);
                    const p2 = polar(C, C, R_SIGN_IN, a);
                    return <line key={k} x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} className={classes.tick}/>;
                })}
            </motion.g>

            {/* Houses */}
            {chart.houses.map((h, i) => {
                const a = angle(h.longitude!);
                const isAngle = [1, 4, 7, 10].includes(h.number!);
                const p1 = polar(C, C, R_INNER, a);
                const p2 = polar(C, C, isAngle ? (outer ? R_OUT2 + 10 : R_OUT + 14) : R_SIGN_IN, a);
                const next = chart.houses[(i + 1) % 12].longitude!;
                const midLon = h.longitude! + (((next - h.longitude!) % 360) + 360) % 360 / 2;
                const num = polar(C, C, R_HOUSE_NUM, angle(midLon));
                return (
                    <g key={h.id!}>
                        <motion.line x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y}
                                     className={classNames(classes.cusp, {[classes.axis]: isAngle})}
                                     {...draw(T.houses + i * 0.05, 0.8)}/>
                        <motion.text x={num.x} y={num.y} className={classes.houseNum} textAnchor='middle'
                                     dominantBaseline='central' {...fade(T.houses + 0.3 + i * 0.05)}>
                            {h.number}
                        </motion.text>
                    </g>
                );
            })}

            {/* Angle labels */}
            {chart.angles.filter((a) => a.id === 'asc' || a.id === 'mc').map((a) => {
                const p = polar(C, C, outer ? R_OUT2 + 26 : R_OUT + 24, angle(a.longitude!));
                return (
                    <motion.text key={a.id!} x={p.x} y={p.y} className={classes.angleLabel} textAnchor='middle'
                                 dominantBaseline='central' {...fade(T.houses + 0.6)}>
                        {POINT_GLYPHS[a.id!]}
                    </motion.text>
                );
            })}

            {/* Aspect lines */}
            <g className={classes.aspects}>
                {lines.map((asp, i) => {
                    const p1 = polar(C, C, R_ASPECT, angle(asp.lonA));
                    const p2 = polar(C, C, R_ASPECT, angle(asp.lonB));
                    const involved = activeId !== null && (asp.idA === activeId || asp.idB === activeId);
                    const tone = aspectTone(asp.type);
                    // Dimming lives on a wrapper <g>: framer-motion writes opacity inline on the animated line
                    return (
                        <g key={asp.key} className={classNames(classes.fader, {[classes.dimmed]: activeId !== null && !involved})}>
                            <motion.line
                                x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y}
                                className={classNames(classes.aspect, classes[tone], {
                                    [classes.minorAspect]: !asp.major,
                                    [classes.highlighted]: involved,
                                })}
                                {...draw(T.aspects + i * 0.025, 0.9)}
                            />
                        </g>
                    );
                })}
            </g>

            {/* Planets and points */}
            {points.map((p, i) => {
                const trueA = angle(p.longitude!);
                const shownA = angle(display[i]);
                const g = polar(C, C, R_PLANET, shownA);
                const deg = polar(C, C, R_DEGREE, shownA);
                const tick1 = polar(C, C, R_TICK_IN, trueA);
                const tick2 = polar(C, C, R_TICK_IN - 10, trueA);
                const conn = polar(C, C, R_PLANET + 13, shownA);
                const isActive = (activeId ?? selectedId) === p.id;
                const label = `${pointLabel(p.id!)}, ${content.signs[p.sign as keyof typeof content.signs]?.name ?? ''} ${formatDegree(p.degree, p.minute)}${p.house ? `, ${content.houses[String(p.house) as keyof typeof content.houses].name}` : ''}${p.retrograde ? `, ${translate('retrograde')}` : ''}`;
                const linked = linkedTo(p.id!);
                return (
                    <g key={p.id!} className={classNames(classes.fader, {[classes.dimmed]: activeId !== null && activeId !== p.id && !linked})}>
                    <motion.g
                        data-id={p.id!}
                        role='button'
                        tabIndex={0}
                        aria-label={label}
                        aria-pressed={isActive}
                        className={classNames(classes.point, {[classes.pointActive]: isActive})}
                        onMouseEnter={handleEnter}
                        onMouseLeave={handleLeave}
                        onFocus={handleEnter}
                        onBlur={handleLeave}
                        onClick={handleClick}
                        onKeyDown={handleKey}
                        {...(anim
                            ? {initial: {opacity: 0, scale: 0.4}, animate: {opacity: 1, scale: 1},
                                transition: {delay: T.planets + i * 0.06, duration: 0.6, ease: EASE}}
                            : {initial: false as const})}
                        style={{transformOrigin: `${g.x}px ${g.y}px`, transformBox: 'view-box'}}
                    >
                        <title>{label}</title>
                        <line x1={tick1.x} y1={tick1.y} x2={tick2.x} y2={tick2.y} className={classes.pointTick}/>
                        <line x1={tick2.x} y1={tick2.y} x2={conn.x} y2={conn.y} className={classes.connector}/>
                        <circle cx={g.x} cy={g.y} r={15} className={classes.hit}/>
                        {p.id === 'partOfFortune' ? (
                            <g className={classes.pofGlyph} aria-hidden='true'>
                                <circle cx={g.x} cy={g.y} r={7}/>
                                <line x1={g.x - 5} y1={g.y - 5} x2={g.x + 5} y2={g.y + 5}/>
                                <line x1={g.x + 5} y1={g.y - 5} x2={g.x - 5} y2={g.y + 5}/>
                            </g>
                        ) : (
                            <text x={g.x} y={g.y} className={classNames('glyph', classes.pointGlyph)} textAnchor='middle'
                                  dominantBaseline='central' aria-hidden='true'>
                                {glyph(POINT_GLYPHS[p.id!])}
                            </text>
                        )}
                        <text x={deg.x} y={deg.y} className={classes.degree} textAnchor='middle' dominantBaseline='central'
                              aria-hidden='true'>
                            {p.degree}°{p.retrograde ? translate('retrograde_short') : ''}
                        </text>
                    </motion.g>
                    </g>
                );
            })}

            {/* Bi-wheel: outer ring points (transits / partner) */}
            {outerPoints.map((p, i) => {
                const oid = `o:${p.id}`;
                const trueA = angle(p.longitude!);
                const shownA = angle(outerDisplay[i]);
                const g = polar(C, C, R_OUTER_PLANET, shownA);
                const deg = polar(C, C, R_OUTER_DEGREE, shownA);
                const tick1 = polar(C, C, R_OUT, trueA);
                const tick2 = polar(C, C, R_OUT + 9, trueA);
                const isActive = activeId === oid;
                const label = `${outer!.label}: ${pointLabel(p.id!)}, ${content.signs[p.sign as keyof typeof content.signs]?.name ?? ''} ${formatDegree(p.degree, p.minute)}${p.retrograde ? `, ${translate('retrograde')}` : ''}`;
                return (
                    <g key={oid} className={classNames(classes.fader, {[classes.dimmed]: activeId !== null && !isActive && !linkedTo(oid)})}>
                        <motion.g
                            data-id={oid}
                            role='button'
                            tabIndex={0}
                            aria-label={label}
                            aria-pressed={isActive}
                            className={classNames(classes.point, classes.outerPoint, {[classes.pointActive]: isActive})}
                            onMouseEnter={handleEnter}
                            onMouseLeave={handleLeave}
                            onFocus={handleEnter}
                            onBlur={handleLeave}
                            onClick={handleClick}
                            onKeyDown={handleKey}
                            {...fade(T.planets + 0.4 + i * 0.05)}
                        >
                            <title>{label}</title>
                            <line x1={tick1.x} y1={tick1.y} x2={tick2.x} y2={tick2.y} className={classes.outerTick}/>
                            <circle cx={g.x} cy={g.y} r={14} className={classes.hit}/>
                            <text x={g.x} y={g.y} className={classNames('glyph', classes.pointGlyph)} textAnchor='middle'
                                  dominantBaseline='central' aria-hidden='true'>
                                {glyph(POINT_GLYPHS[p.id!])}
                            </text>
                            <text x={deg.x} y={deg.y} className={classes.degree} textAnchor='middle' dominantBaseline='central'
                                  aria-hidden='true'>
                                {p.degree}°{p.retrograde ? translate('retrograde_short') : ''}
                            </text>
                        </motion.g>
                    </g>
                );
            })}
        </svg>
    );
};

export default ChartWheelComponent;
