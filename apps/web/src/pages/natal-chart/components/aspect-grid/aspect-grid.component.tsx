import {useCallback, useMemo} from 'react';
import classNames from 'classnames';
import {ASPECT_GLYPHS, aspectTone, formatOrb, glyph, POINT_GLYPHS} from 'core/helpers/astro';
import useLocalization, {useContent} from 'assets/lang';
import {AspectModel} from '../../models/natal-chart.model';
import {useAspectGridStyles} from './aspect-grid.style';
import {IAspectGrid} from './aspect-grid';

const ORDER = ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'pluto',
    'northNode', 'lilith', 'chiron', 'asc', 'mc'];

// Triangular aspect grid (astro-seek style), as an accessible HTML table.
const AspectGridComponent = ({chart, activeId, onActivate}: IAspectGrid) => {
    const translate = useLocalization();
    const content = useContent();
    const classes = useAspectGridStyles();

    const rows = useMemo(() => {
        const present = new Set([...chart.points.map((p) => p.id), ...chart.angles.map((a) => a.id)]);
        return ORDER.filter((id) => present.has(id));
    }, [chart]);

    const lookup = useMemo(() => {
        const map = new Map<string, AspectModel>();
        chart.aspects.forEach((a) => {
            map.set(`${a.p1}|${a.p2}`, a);
            map.set(`${a.p2}|${a.p1}`, a);
        });
        return map;
    }, [chart.aspects]);

    const name = useCallback((id: string) => content.points[id as keyof typeof content.points]?.name ?? id, [content]);
    const symbol = useCallback((id: string) => (id === 'asc' || id === 'mc' ? POINT_GLYPHS[id] : glyph(POINT_GLYPHS[id])), []);

    const handleEnter = useCallback((e: React.SyntheticEvent<HTMLElement>) => {
        onActivate(e.currentTarget.dataset.id ?? null);
    }, [onActivate]);

    const handleLeave = useCallback(() => {
        onActivate(null);
    }, [onActivate]);

    return (
        <div className={classes.scroller}>
            <table className={classes.grid}>
                <caption className='sr-only'>{translate('section_aspects')}</caption>
                <tbody>
                    {rows.map((row, i) => (
                        <tr key={row}>
                            {rows.slice(0, i).map((col) => {
                                const a = lookup.get(`${row}|${col}`);
                                const involved = activeId !== null && (row === activeId || col === activeId);
                                return (
                                    <td key={col} className={classNames(classes.cell, {[classes.cellActive]: involved})}>
                                        {a ? (
                                            <span className={classNames(classes.aspect, classes[aspectTone(a.type!)])}
                                                  title={`${name(row)} ${content.aspects[a.type as keyof typeof content.aspects]?.name} ${name(col)} · ${translate('col_orb')} ${formatOrb(a.orb!)}`}>
                                                <span className='glyph' aria-hidden='true'>{glyph(ASPECT_GLYPHS[a.type!])}</span>
                                                <span className={classes.orb}>{formatOrb(a.orb!)}</span>
                                                <span className='sr-only'>
                                                    {`${name(row)} – ${name(col)}: ${content.aspects[a.type as keyof typeof content.aspects]?.name}`}
                                                </span>
                                            </span>
                                        ) : null}
                                    </td>
                                );
                            })}
                            <th scope='row' data-id={row} className={classNames(classes.head, {[classes.headActive]: row === activeId})}
                                onMouseEnter={handleEnter} onMouseLeave={handleLeave} title={name(row)}>
                                <span className={row === 'asc' || row === 'mc' ? classes.abbr : 'glyph'} aria-hidden='true'>{symbol(row)}</span>
                                <span className='sr-only'>{name(row)}</span>
                            </th>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default AspectGridComponent;
