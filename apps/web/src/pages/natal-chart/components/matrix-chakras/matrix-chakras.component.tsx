import useLocalization, {useContent} from 'assets/lang';
import {useMatrixLinesStyles} from '../matrix-lines/matrix-lines.style';
import {IMatrixChakras} from './matrix-chakras';

// What the health map (the chakra table) means: how the three columns are made, and for each chakra the body areas and
// life theme it stands for, with the arcana of its result column. The numbers come from the engine.
const MatrixChakrasComponent = ({matrix}: IMatrixChakras) => {
    const translate = useLocalization();
    const content = useContent();
    const classes = useMatrixLinesStyles();
    const d = content.destiny as unknown as {
        chakras: Record<string, string>;
        chakraInfo: Record<string, {body: string; theme: string}>;
        arcana: Record<string, {name: string; keywords: string; plus: string; minus: string}>;
    };

    return (
        <div className={classes.wrap}>
            <p className={classes.muted}>{translate('chakra_how')}</p>
            <details className={classes.more}>
                <summary>{translate('chakra_read_more')}</summary>
                {matrix.chakras.map((c) => {
                    const info = d.chakraInfo[c.id];
                    const a = d.arcana[String(c.emotion)];
                    return (
                        <p key={c.id}>
                            <strong>{d.chakras[c.id]} · {c.emotion} {a?.name}.</strong>{' '}
                            {info ? `${translate('chakra_body')} ${info.body}. ${translate('chakra_theme')} ${info.theme}.` : ''}
                            {a ? ` ${translate('lines_plus')} ${a.plus} ${translate('lines_minus')} ${a.minus}` : ''}
                        </p>
                    );
                })}
                {matrix.chakraTotal ? (
                    <p>
                        <strong>{translate('total')} · {matrix.chakraTotal.emotion} {d.arcana[String(matrix.chakraTotal.emotion)]?.name}.</strong>{' '}
                        {translate('chakra_total')}
                    </p>
                ) : null}
            </details>
        </div>
    );
};

export default MatrixChakrasComponent;
