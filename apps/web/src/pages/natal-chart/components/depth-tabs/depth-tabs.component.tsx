import {useCallback, useMemo, useState} from 'react';
import {Segmented} from 'antd';
import useLocalization from 'assets/lang';
import ChartCareerComponent from '../chart-career/chart-career.component';
import ChartDepthComponent from '../chart-depth/chart-depth.component';
import ChartFinanceComponent from '../chart-finance/chart-finance.component';
import {useDepthTabsStyles} from './depth-tabs.style';
import {IDepthTabs} from './depth-tabs';

type Section = 'general' | 'career' | 'finance';

// The deep-analysis tab: the general reading and the life areas (career, finances; health follows), one at a time.
const DepthTabsComponent = ({chart}: IDepthTabs) => {
    const translate = useLocalization();
    const classes = useDepthTabsStyles();
    const [section, setSection] = useState<Section>('general');

    const handleSection = useCallback((v: string | number) => {
        setSection(v as Section);
    }, []);
    const options = useMemo(() => [
        {value: 'general', label: translate('depth_nav_general')},
        {value: 'career', label: translate('depth_nav_career')},
        {value: 'finance', label: translate('depth_nav_finance')},
    ], [translate]);

    return (
        <div className={classes.wrap}>
            <div className={classes.nav}><Segmented value={section} onChange={handleSection} options={options} size='large'/></div>
            {section === 'general' ? <ChartDepthComponent chart={chart}/> : null}
            {section === 'career' ? <ChartCareerComponent chart={chart}/> : null}
            {section === 'finance' ? <ChartFinanceComponent chart={chart}/> : null}
        </div>
    );
};

export default DepthTabsComponent;
