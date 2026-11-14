import {Link} from 'react-router-dom';
import {Button, Select} from 'antd';
import {Routes} from 'router/routes';
import {useChartChoice} from 'core/helpers/use-chart-choice';
import useLocalization from 'assets/lang';
import PersonalLunationsComponent from 'pages/sky/components/personal-lunations/personal-lunations.component';
import {usePersonalYearStyles} from './personal-year.style';
import {IPersonalYear} from './personal-year';

// The year's lunations and eclipses read in one of the user's charts (natal house + natal points touched).
const PersonalYearComponent = ({year}: IPersonalYear) => {
    const translate = useLocalization();
    const classes = usePersonalYearStyles();
    const {input, options, choice, onChoice} = useChartChoice();

    return (
        <section className={classes.wrap} aria-labelledby='sec-personal-year'>
            <h2 id='sec-personal-year'>{translate('lunations_personal_year', {year})}</h2>
            <p className={classes.muted}>{translate('lunations_personal_intro')}</p>
            {input ? (
                <>
                    {options.length > 1 ? (
                        <Select className={classes.select} value={choice} options={options} onChange={onChoice}
                                aria-label={translate('today_choose_chart')}/>
                    ) : null}
                    <PersonalLunationsComponent input={input} start={`${year}-01-01`} days={365} limit={8} expandable/>
                </>
            ) : (
                <div className={classes.empty}>
                    <p className={classes.muted}>{translate('today_no_chart')}</p>
                    <Link to={Routes.natalChart}><Button type='primary'>{translate('hero_cta')}</Button></Link>
                </div>
            )}
        </section>
    );
};

export default PersonalYearComponent;
