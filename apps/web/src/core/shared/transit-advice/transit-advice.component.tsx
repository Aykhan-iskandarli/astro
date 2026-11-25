import useLocalization, {useContent} from 'assets/lang';
import {adviceKind} from 'core/helpers/advice';
import {useTransitAdviceStyles} from './transit-advice.style';
import {ITransitAdvice} from './transit-advice';

// A practical note for a transit: what to do and what to avoid, by the transiting planet and the kind of aspect.
// The notes are general guidance written for each planet and aspect type, not a prediction.
const TransitAdviceComponent = ({transit, aspect}: ITransitAdvice) => {
    const translate = useLocalization();
    const content = useContent();
    const classes = useTransitAdviceStyles();
    const kind = adviceKind(aspect);
    const note = kind ? (content.advice as unknown as Record<string, Record<string, {do: string; avoid: string}>>)[transit]?.[kind] : null;
    if (!note) return null;

    return (
        <dl className={classes.wrap}>
            <dt className={classes.do}>{translate('adv_do')}</dt>
            <dd>{note.do}</dd>
            <dt className={classes.avoid}>{translate('adv_avoid')}</dt>
            <dd>{note.avoid}</dd>
        </dl>
    );
};

export default TransitAdviceComponent;
