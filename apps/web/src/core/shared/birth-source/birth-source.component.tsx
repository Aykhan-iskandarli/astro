import {useCallback} from 'react';
import {DatePicker, Segmented} from 'antd';
import dayjs, {Dayjs} from 'dayjs';
import useLocalization from 'assets/lang';
import {useBirthSourceStyles} from './birth-source.style';
import {IBirthSource} from './birth-source';

const BIRTH_MIN = dayjs('1800-01-01');

// The choice between "my chart" and "only a birth date" that the personal pages share.
const BirthSourceComponent = ({chartInput, mode, onMode, birth, onBirth, showDate}: IBirthSource) => {
    const translate = useLocalization();
    const classes = useBirthSourceStyles();
    const disabledBirth = useCallback((d: Dayjs) => d.isBefore(BIRTH_MIN) || d.isAfter(dayjs()), []);

    return (
        <div className={classes.wrap}>
            {chartInput ? (
                <Segmented value={mode} onChange={onMode} size='large'
                           options={[{value: 'chart', label: translate('tr_source_chart')}, {value: 'date', label: translate('tr_source_date')}]}/>
            ) : null}
            {showDate ? (
                <label className={classes.dateField}>
                    <span>{translate('tr_date_label')}</span>
                    <DatePicker value={birth} onChange={onBirth} format='DD.MM.YYYY' disabledDate={disabledBirth}
                                placeholder={translate('field_date_placeholder')} inputReadOnly={false} size='large'/>
                    <small>{translate('tr_date_hint')}</small>
                </label>
            ) : null}
        </div>
    );
};

export default BirthSourceComponent;
