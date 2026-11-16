import {useCallback, useMemo, useState} from 'react';
import {Segmented} from 'antd';
import useLocalization from 'assets/lang';
import ChartCareerComponent from '../chart-career/chart-career.component';
import ChartDepthComponent from '../chart-depth/chart-depth.component';
import {useDepthTabsStyles} from './depth-tabs.style';
import {IDepthTabs} from './depth-tabs';

type Section = 'general' | 'career';

// The deep-analysis tab: the general reading and the life areas (career; finances and health follow), one at a time.
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
    ], [translate]);

    return (
        <div className={classes.wrap}>
            <div className={classes.nav}><Segmented value={section} onChange={handleSection} options={options} size='large'/></div>
            {section === 'general' ? <ChartDepthComponent chart={chart}/> : <ChartCareerComponent chart={chart}/>}
        </div>
    );
};

export default DepthTabsComponent;
