import {useState} from 'react';
import {Segmented} from 'antd';
import {useStore} from 'store/store.config';
import LoaderComponent from 'core/shared/loader/loader.component';
import useLocalization, {useContent} from 'assets/lang';
import {useGetOtherSystems} from '../../actions/natal-chart.query';
import {useExtrasStyles} from '../extras-ui/extras.style';

const KUA_KINDS = ['shengQi', 'tianYi', 'yanNian', 'fuWei'] as const;

// Other systems from the birth date: Tarot birth cards, the Maya Tzolkin and the Feng Shui Kua number.
const OtherPanelComponent = () => {
    const translate = useLocalization();
    const content = useContent();
    const classes = useExtrasStyles();
    const birthInput = useStore('birthInput');
    const [gender, setGender] = useState<'male' | 'female'>('male');
    const {data} = useGetOtherSystems(birthInput?.date ?? null, gender);
    const arcana = content.destiny.arcana;
    const t = content.other.tzolkin;
    const k = content.other.kua;

    if (!data) return <LoaderComponent/>;

    return (
        <div className={classes.wrapper}>
            <header className={classes.section}>
                <h2 style={{fontSize: 34}}>{translate('other_title')}</h2>
                <p className={classes.lead}>{translate('other_subtitle')}</p>
            </header>

            <section className={classes.section} aria-labelledby='other-tarot'>
                <h3 id='other-tarot'>{translate('other_tarot')}</h3>
                <p className={classes.lead}>{translate('other_tarot_info')}</p>
                <div className={classes.grid}>
                    {data.tarot.map((n) => {
                        const a = arcana[String(n) as keyof typeof arcana];
                        return (
                            <article key={n} className={classes.card}>
                                <p className={classes.big}>{n === 22 ? 0 : n}</p>
                                <p className={classes.title}>{a?.name} <span className={classes.small}>· {a?.keywords}</span></p>
                                <p className={classes.text}>{a?.plus}</p>
                                <p className={classes.small}>{a?.minus}</p>
                            </article>
                        );
                    })}
                </div>
            </section>

            {data.tzolkin ? (
                <section className={classes.section} aria-labelledby='other-tzolkin'>
                    <h3 id='other-tzolkin'>{translate('other_tzolkin')}</h3>
                    <p className={classes.lead}>{t.intro}</p>
                    <article className={classes.cardHot}>
                        <p className={classes.big}>{data.tzolkin.tone} · {t.signs[data.tzolkin.sign as keyof typeof t.signs]?.name}</p>
                        <p className={classes.small}>{translate('other_kin', {kin: data.tzolkin.kin})}</p>
                        <p className={classes.text}>{t.signs[data.tzolkin.sign as keyof typeof t.signs]?.meaning}</p>
                        <p className={classes.text}>{translate('other_tone', {tone: data.tzolkin.tone})}: {t.tones[String(data.tzolkin.tone) as keyof typeof t.tones]}</p>
                    </article>
                </section>
            ) : null}

            {data.kua ? (
                <section className={classes.section} aria-labelledby='other-kua'>
                    <h3 id='other-kua'>{translate('other_kua')}</h3>
                    <p className={classes.lead}>{k.intro}</p>
                    <Segmented value={gender} onChange={(v) => setGender(v as 'male' | 'female')}
                               options={[{value: 'male', label: translate('gender_male')}, {value: 'female', label: translate('gender_female')}]}/>
                    <article className={classes.cardHot}>
                        <p className={classes.big}>Kua {data.kua.number}</p>
                        <p className={classes.text}>{k.groups[data.kua.group]} · {translate('other_kua_year', {year: data.kua.chineseYear})}</p>
                        <ul className={classes.list}>
                            {KUA_KINDS.map((kind) => (
                                <li key={kind}>
                                    <b>{k.directions[data.kua!.directions[kind] as keyof typeof k.directions]}</b> — {k.kinds[kind].name}: {k.kinds[kind].meaning}
                                </li>
                            ))}
                        </ul>
                    </article>
                </section>
            ) : null}
            <p className={classes.small}>{translate('other_note')}</p>
        </div>
    );
};

export default OtherPanelComponent;
