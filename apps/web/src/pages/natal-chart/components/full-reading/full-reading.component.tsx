import {fullReading} from '@astra/content';
import {useStore} from 'store/store.config';
import useLocalization, {useContent} from 'assets/lang';
import {useFullReadingStyles} from './full-reading.style';
import {IFullReading} from './full-reading';

// The long version of a placement: what the planet is, how its sign colours it, what its house is about and, for the
// aspect types it makes, how those work. Collapsed by default; the short text stays on top.
const FullReadingComponent = ({pointId, sign, house, aspectTypes}: IFullReading) => {
    const translate = useLocalization();
    const content = useContent();
    const locale = useStore('locale');
    const classes = useFullReadingStyles();
    const reading = fullReading(locale, pointId, sign, house, aspectTypes);
    const point = content.points[pointId as keyof typeof content.points]?.name ?? pointId;
    const signName = content.signs[sign as keyof typeof content.signs]?.name ?? sign;
    const houseName = house ? content.houses[String(house) as keyof typeof content.houses]?.name : null;

    if (!reading.specific && !reading.planet && !reading.sign && !reading.house) return null;
    return (
        <details className={classes.full}>
            <summary>{translate('read_full')}</summary>
            {reading.specific ? <section><h4>{translate('read_specific', {point, sign: signName})}</h4><p>{reading.specific}</p></section> : null}
            {reading.planet ? <section><h4>{translate('read_planet', {name: point})}</h4><p>{reading.planet}</p></section> : null}
            {reading.sign ? <section><h4>{translate('read_sign', {name: signName})}</h4><p>{reading.sign}</p></section> : null}
            {reading.house && houseName ? <section><h4>{translate('read_house', {name: houseName})}</h4><p>{reading.house}</p></section> : null}
            {reading.aspects.length ? (
                <section>
                    <h4>{translate('read_aspects')}</h4>
                    {reading.aspects.map((a) => (
                        <p key={a.type}>
                            <strong>{content.aspects[a.type as keyof typeof content.aspects]?.name}.</strong>{' '}{a.text}
                        </p>
                    ))}
                </section>
            ) : null}
        </details>
    );
};

export default FullReadingComponent;
