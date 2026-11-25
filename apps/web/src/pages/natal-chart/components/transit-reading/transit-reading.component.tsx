import useLocalization, {useContent} from 'assets/lang';
import TransitAdviceComponent from 'core/shared/transit-advice/transit-advice.component';
import {useTransitReadingStyles} from './transit-reading.style';
import {ITransitReading} from './transit-reading';

// The long version of a transit: the life cycle when a planet meets itself, then the transiting planet, the aspect and
// the natal point it touches. Collapsed; extra material (exact dates, ...) can be passed as children.
const TransitReadingComponent = ({transit, natal, aspect, children}: ITransitReading) => {
    const translate = useLocalization();
    const content = useContent();
    const classes = useTransitReadingStyles();
    const tr = content.transformations as {
        planet: Record<string, string>; aspect: Record<string, string>; target: Record<string, string>;
        cycle: Record<string, {name: string; text: string}>;
    };
    const name = (id: string) => content.points[id as keyof typeof content.points]?.name
        ?? (id === 'asc' ? content.houses['1']?.name : id === 'mc' ? 'MC' : id);
    const cycle = transit === natal ? tr.cycle[`${transit}-${aspect}`] : undefined;
    const planet = tr.planet[transit];
    const aspectText = tr.aspect[aspect];
    const target = tr.target[natal];

    if (!cycle && !planet && !aspectText && !target) return <TransitAdviceComponent transit={transit} aspect={aspect}/>;
    return (
        <>
        <TransitAdviceComponent transit={transit} aspect={aspect}/>
        <details className={classes.full}>
            <summary>{translate('tr_read_full')}</summary>
            {cycle ? <section><h5>{translate('tr_part_cycle')}: {cycle.name}</h5><p>{cycle.text}</p></section> : null}
            {planet ? <section><h5>{translate('tr_part_planet')}: {name(transit)}</h5><p>{planet}</p></section> : null}
            {aspectText ? <section><h5>{translate('tr_part_aspect')}: {content.aspects[aspect as keyof typeof content.aspects]?.name}</h5><p>{aspectText}</p></section> : null}
            {target ? <section><h5>{translate('tr_part_target')}: {name(natal)}</h5><p>{target}</p></section> : null}
            {children}
        </details>
        </>
    );
};

export default TransitReadingComponent;
