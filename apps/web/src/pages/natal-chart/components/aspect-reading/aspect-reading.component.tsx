import {aspectReading} from '@astra/content';
import {useStore} from 'store/store.config';
import useLocalization, {useContent} from 'assets/lang';
import {useAspectReadingStyles} from './aspect-reading.style';
import {IAspectReading} from './aspect-reading';

// The long reading of one aspect: the two planets together, the aspect type and its tone. Collapsed by default.
const AspectReadingComponent = ({p1, p2, type}: IAspectReading) => {
    const translate = useLocalization();
    const content = useContent();
    const locale = useStore('locale');
    const classes = useAspectReadingStyles();
    const r = aspectReading(locale, p1, p2, type);
    const name = (id: string) => content.points[id as keyof typeof content.points]?.name ?? id;
    const aspectName = content.aspects[type as keyof typeof content.aspects]?.name;

    if (!r.pair && !r.aspect && !r.first) return null;
    return (
        <details className={classes.full}>
            <summary>{translate('read_full')}</summary>
            {r.pair ? <section><h4>{name(p1)} · {name(p2)}</h4><p>{r.pair}</p></section> : (
                <>
                    {r.first ? <section><h4>{translate('read_planet', {name: name(p1)})}</h4><p>{r.first}</p></section> : null}
                    {r.second ? <section><h4>{translate('read_planet', {name: name(p2)})}</h4><p>{r.second}</p></section> : null}
                </>
            )}
            {r.aspect ? <section><h4>{aspectName}</h4><p>{r.aspect}</p></section> : null}
            {r.tone ? <section><p>{r.tone}</p></section> : null}
        </details>
    );
};

export default AspectReadingComponent;
