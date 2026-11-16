import {useCallback, useMemo, useState} from 'react';
import {Segmented} from 'antd';
import useLocalization from 'assets/lang';
import ChartAspectsComponent from '../chart-aspects/chart-aspects.component';
import ChartCareerComponent from '../chart-career/chart-career.component';
import ChartDepthComponent from '../chart-depth/chart-depth.component';
import ChartFinanceComponent from '../chart-finance/chart-finance.component';
import ChartPowerComponent from '../chart-power/chart-power.component';
import ChartSaturnPlutoComponent from '../chart-saturn-pluto/chart-saturn-pluto.component';
import ChartDraconicComponent from '../chart-draconic/chart-draconic.component';
import ChartGenerationComponent from '../chart-generation/chart-generation.component';
import ChartSummaryComponent from '../chart-summary/chart-summary.component';
import ChartHealthComponent from '../chart-health/chart-health.component';
import {useDepthTabsStyles} from './depth-tabs.style';
import {IDepthTabs} from './depth-tabs';

type Section = 'summary' | 'general' | 'power' | 'saturnPluto' | 'draconic' | 'generation' | 'aspects' | 'career' | 'finance' | 'health';

// The deep-analysis tab: the general reading and the life areas (career, finances, health), one at a time.
const DepthTabsComponent = ({chart}: IDepthTabs) => {
    const translate = useLocalization();
    const classes = useDepthTabsStyles();
    const [section, setSection] = useState<Section>('summary');

    const handleSection = useCallback((v: string | number) => {
        setSection(v as Section);
    }, []);
    const options = useMemo(() => [
        {value: 'summary', label: translate('depth_nav_summary')},
        {value: 'general', label: translate('depth_nav_general')},
        {value: 'power', label: translate('depth_nav_power')},
        {value: 'aspects', label: translate('depth_nav_aspects')},
        {value: 'saturnPluto', label: translate('depth_nav_sp')},
        {value: 'draconic', label: translate('depth_nav_draconic')},
        {value: 'generation', label: translate('depth_nav_generation')},
        {value: 'career', label: translate('depth_nav_career')},
        {value: 'finance', label: translate('depth_nav_finance')},
        {value: 'health', label: translate('depth_nav_health')},
    ], [translate]);

    return (
        <div className={classes.wrap}>
            <div className={classes.nav}><Segmented value={section} onChange={handleSection} options={options} size='large'/></div>
            {section === 'summary' ? <ChartSummaryComponent chart={chart}/> : null}
            {section === 'saturnPluto' ? <ChartSaturnPlutoComponent chart={chart}/> : null}
            {section === 'generation' ? <ChartGenerationComponent chart={chart}/> : null}
            {section === 'draconic' ? <ChartDraconicComponent chart={chart}/> : null}
            {section === 'general' ? <ChartDepthComponent chart={chart}/> : null}
            {section === 'power' ? <ChartPowerComponent chart={chart}/> : null}
            {section === 'aspects' ? <ChartAspectsComponent chart={chart}/> : null}
            {section === 'career' ? <ChartCareerComponent chart={chart}/> : null}
            {section === 'finance' ? <ChartFinanceComponent chart={chart}/> : null}
            {section === 'health' ? <ChartHealthComponent chart={chart}/> : null}
        </div>
    );
};

export default DepthTabsComponent;
