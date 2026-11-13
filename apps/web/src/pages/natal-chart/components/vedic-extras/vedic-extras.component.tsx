import classNames from 'classnames';
import {glyph, SIGN_GLYPHS} from 'core/helpers/astro';
import useLocalization, {useContent} from 'assets/lang';
import {useExtrasStyles} from '../extras-ui/extras.style';
import {IVedicExtrasProps} from './vedic-extras';

const DIVISIONS = ['d3', 'd7', 'd10', 'd12'] as const;
const ORDER = ['lagna', 'sun', 'moon', 'mars', 'mercury', 'jupiter', 'venus', 'saturn', 'rahu', 'ketu'];
const BAV = ['sun', 'moon', 'mars', 'mercury', 'jupiter', 'venus', 'saturn'];

// Vedic extras: classic yogas, divisional charts D3/D7/D10/D12 and the Ashtakavarga table.
const VedicExtrasComponent = ({vedic}: IVedicExtrasProps) => {
    const translate = useLocalization();
    const content = useContent();
    const v = content.vedic;
    const classes = useExtrasStyles();
    const grahaName = (id: string) => (id === 'lagna' ? 'Lagna' : v.grahas[id as keyof typeof v.grahas]?.name?.split(' ')[0] ?? id);
    const rashi = (s: string) => v.rashis[s as keyof typeof v.rashis] ?? s;
    const av = vedic.ashtakavarga;

    return (
        <div className={classes.wrapper}>
            <section className={classes.section} aria-labelledby='vedic-yogas'>
                <h3 id='vedic-yogas'>{translate('vedic_yogas')}</h3>
                <div className={classes.grid}>
                    {vedic.yogas.map((y) => {
                        const info = v.yogas[y.id as keyof typeof v.yogas];
                        return (
                            <article key={y.id} className={y.id === 'kemadruma' ? classes.card : classes.cardHot}>
                                <p className={classes.title}>{info?.name}</p>
                                <p className={classes.text}>{info?.meaning}</p>
                                <p className={classes.small}>{y.planets.map(grahaName).join(', ')}</p>
                            </article>
                        );
                    })}
                </div>
                <p className={classes.small}>{translate('vedic_yogas_note')}</p>
            </section>

            <section className={classes.section} aria-labelledby='vedic-divisional'>
                <h3 id='vedic-divisional'>{translate('vedic_divisional')}</h3>
                <ul className={classes.list}>
                    {DIVISIONS.map((d) => <li key={d}><b>{v.divisional[d].name}:</b> {v.divisional[d].meaning}</li>)}
                </ul>
                <div className={classes.tableWrap}>
                    <table className={classes.table}>
                        <thead><tr><th/>{DIVISIONS.map((d) => <th key={d}>{d.toUpperCase()}</th>)}</tr></thead>
                        <tbody>
                            {ORDER.filter((id) => vedic.divisional[id]).map((id) => (
                                <tr key={id}>
                                    <td>{grahaName(id)}</td>
                                    {DIVISIONS.map((d) => {
                                        const s = vedic.divisional[id][d];
                                        return <td key={d}><span className='glyph' aria-hidden='true'>{glyph(SIGN_GLYPHS[s])}</span> {rashi(s)}</td>;
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>

            {av ? (
                <section className={classes.section} aria-labelledby='vedic-ashtakavarga'>
                    <h3 id='vedic-ashtakavarga'>Ashtakavarga</h3>
                    <p className={classes.lead}>{v.ashtakavarga}</p>
                    <div className={classes.tableWrap}>
                        <table className={classes.table}>
                            <thead>
                                <tr><th/>{av.signs.map((s) => <th key={s} title={rashi(s)}><span className='glyph' aria-hidden='true'>{glyph(SIGN_GLYPHS[s])}</span></th>)}<th>Σ</th></tr>
                            </thead>
                            <tbody>
                                {BAV.map((p) => (
                                    <tr key={p}>
                                        <td>{grahaName(p)}</td>
                                        {av.bav[p].map((x, i) => <td key={i}>{x}</td>)}
                                        <td>{av.bav[p].reduce((a, b) => a + b, 0)}</td>
                                    </tr>
                                ))}
                                <tr data-hot='true'>
                                    <td>SAV</td>
                                    {av.sav.map((x, i) => <td key={i} className={classNames({[classes.good]: x > 28, [classes.bad]: x < 25})}>{x}</td>)}
                                    <td>{av.total}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </section>
            ) : <p className={classes.small}>{translate('vedic_ashtakavarga_time')}</p>}
        </div>
    );
};

export default VedicExtrasComponent;
