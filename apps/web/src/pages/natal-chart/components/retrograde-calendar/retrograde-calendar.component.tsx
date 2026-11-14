import {useCallback, useState} from 'react';
import {Alert, InputNumber} from 'antd';
import dayjs from 'dayjs';
import {useStore} from 'store/store.config';
import LoaderComponent from 'core/shared/loader/loader.component';
import useLocalization from 'assets/lang';
import {useGetRetrogrades} from '../../actions/natal-chart.query';
import RetrogradeListComponent from '../retrograde-list/retrograde-list.component';
import {useRetrogradeCalendarStyles} from './retrograde-calendar.style';

// A year of retrogrades read in the user's chart (Forecast tab).
const RetrogradeCalendarComponent = () => {
    const translate = useLocalization();
    const birthInput = useStore('birthInput');
    const classes = useRetrogradeCalendarStyles();
    const [year, setYear] = useState(() => dayjs().year());
    const {data, isFetching, isError} = useGetRetrogrades(birthInput, `${year}-01-01`, 365);

    const handleYear = useCallback((v: number | null) => {
        if (v) setYear(v);
    }, []);

    if (!birthInput) return null;

    return (
        <div className={classes.wrap}>
            <header>
                <h3>{translate('retro_title')}</h3>
                <p className={classes.muted}>{translate('retro_intro')}</p>
            </header>
            <label className={classes.control}>
                <span>{translate('forecast_year')}</span>
                <InputNumber min={1800} max={2998} value={year} onChange={handleYear} size='large'/>
            </label>
            {data?.timeUnknown ? <Alert type='info' showIcon title={translate('retro_no_houses')}/> : null}
            {isError ? <Alert type='error' showIcon title={translate('retro_error')}/> : null}
            {!data ? (isFetching ? <LoaderComponent/> : null) : (
                <RetrogradeListComponent retrogrades={data.retrogrades} from={`${year}-01-01`} to={`${year + 1}-01-01`}/>
            )}
        </div>
    );
};

export default RetrogradeCalendarComponent;
