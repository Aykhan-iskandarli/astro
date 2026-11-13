import {useCallback, useState} from 'react';
import {DatePicker} from 'antd';
import dayjs, {Dayjs} from 'dayjs';
import classNames from 'classnames';
import useLocalization, {useContent} from 'assets/lang';
import {useGetChineseCompatibility} from '../../actions/natal-chart.query';
import {useChineseCompatStyles} from './chinese-compat.style';
import {IChineseCompatProps} from './chinese-compat';

const MIN = dayjs('1800-01-01');
const MAX = dayjs('2999-12-31');

// Year-animal compatibility with another person (six harmonies, three harmonies, clash, harm).
const ChineseCompatComponent = ({birthDate}: IChineseCompatProps) => {
    const translate = useLocalization();
    const content = useContent();
    const c = content.chinese;
    const classes = useChineseCompatStyles();
    const [partner, setPartner] = useState<Dayjs | null>(null);
    const {data} = useGetChineseCompatibility(partner ? birthDate : null, partner ? partner.format('YYYY-MM-DD') : null);

    const handleDate = useCallback((v: Dayjs | null) => setPartner(v), []);
    const disabledDate = useCallback((d: Dayjs) => d.isBefore(MIN) || d.isAfter(MAX), []);
    const animalName = (id: string) => c.animals[id as keyof typeof c.animals];

    const rel = data ? c.relations[data.relation] : null;
    const tone = data && ['sixHarmony', 'threeHarmony', 'same'].includes(data.relation) ? classes.good
        : data && ['clash', 'harm'].includes(data.relation) ? classes.bad : undefined;

    return (
        <section className={classes.section} aria-labelledby='cn-compat'>
            <h3 id='cn-compat'>{translate('cn_compat_title')}</h3>
            <p className={classes.lead}>{translate('cn_compat_info')}</p>
            <label className={classes.input} htmlFor='cn-partner-date'>
                {translate('numerology_partner_date')}
                <DatePicker id='cn-partner-date' size='large' value={partner} onChange={handleDate} format='DD.MM.YYYY'
                            disabledDate={disabledDate} placeholder={translate('field_date_placeholder')}/>
            </label>
            {partner && data?.first && data.second && rel ? (
                <article className={classes.result}>
                    <div className={classes.pair}>
                        <span className={classes.animal}><span lang='zh'>{data.first.char}</span>{animalName(data.first.animal)}</span>
                        <span aria-hidden='true'>↔</span>
                        <span className={classes.animal}><span lang='zh'>{data.second.char}</span>{animalName(data.second.animal)}</span>
                    </div>
                    <p className={classNames(classes.relation, tone)}>{rel.name}</p>
                    <p className={classes.text}>{rel.meaning}</p>
                </article>
            ) : null}
            <p className={classes.note}>{translate('cn_compat_note')}</p>
        </section>
    );
};

export default ChineseCompatComponent;
