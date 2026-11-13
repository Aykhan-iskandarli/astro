import {useCallback, useState} from 'react';
import LoaderComponent from 'core/shared/loader/loader.component';
import useLocalization from 'assets/lang';
import {useGetComposite, useGetDavison} from '../../actions/natal-chart.query';
import ChartWheelComponent from '../chart-wheel/chart-wheel.component';
import InterpretationPanelComponent from '../interpretation-panel/interpretation-panel.component';
import PointsTableComponent from '../points-table/points-table.component';
import PatternsListComponent from '../patterns-list/patterns-list.component';
import {useCompositeViewStyles} from './composite-view.style';
import {ICompositeView} from './composite-view';

// The composite (planet midpoints) or the Davison chart (midpoint in time and space) of two people
const CompositeViewComponent = ({first, second, kind = 'composite'}: ICompositeView) => {
    const translate = useLocalization();
    const classes = useCompositeViewStyles();
    const {data: composite} = useGetComposite(kind === 'composite' ? first : null, second);
    const {data: davison} = useGetDavison(first, second, kind === 'davison');
    const chart = kind === 'davison' ? davison : composite;
    const [hovered, setHovered] = useState<string | null>(null);
    const [selected, setSelected] = useState<string>('sun');

    const handleActivate = useCallback((id: string | null) => {
        setHovered(id);
    }, []);

    const handleSelect = useCallback((id: string) => {
        setSelected(id);
    }, []);

    if (!chart) return <LoaderComponent/>;

    return (
        <div className={classes.body}>
            <p className={classes.info}>{translate(kind === 'davison' ? 'davison_info' : 'composite_info')}</p>
            <div className={classes.stage}>
                <ChartWheelComponent chart={chart} activeId={hovered} selectedId={selected} onActivate={handleActivate}
                                     onSelect={handleSelect}/>
                <aside className={classes.sidePlain}>
                    <InterpretationPanelComponent chart={chart} pointId={hovered ?? selected}/>
                </aside>
            </div>
            <PointsTableComponent chart={chart} activeId={hovered ?? selected} onActivate={handleActivate} onSelect={handleSelect}/>
            <h3 className={classes.subhead}>{translate('section_patterns')}</h3>
            <PatternsListComponent patterns={chart.patterns}/>
        </div>
    );
};

export default CompositeViewComponent;
