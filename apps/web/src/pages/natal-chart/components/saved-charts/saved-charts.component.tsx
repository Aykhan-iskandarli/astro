import {useCallback} from 'react';
import {Button} from 'antd';
import {useDispatch} from 'react-redux';
import {useStore} from 'store/store.config';
import {removeSavedChart} from 'store/store.reducer';
import useLocalization from 'assets/lang';
import {useSavedChartsStyles} from './saved-charts.style';
import {ISavedCharts} from './saved-charts';

// Charts saved explicitly by the user, kept only in this browser (redux-persist / localStorage).
const SavedChartsComponent = ({onOpen}: ISavedCharts) => {
    const translate = useLocalization();
    const dispatch = useDispatch();
    const savedCharts = useStore('savedCharts');
    const {wrapper, title, item, meta, actions} = useSavedChartsStyles();

    const handleOpen = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
        const chart = savedCharts.find((c) => c.id === e.currentTarget.dataset.id);
        if (chart) onOpen(chart.input);
    }, [savedCharts, onOpen]);

    const handleDelete = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
        const id = e.currentTarget.dataset.id;
        if (id) dispatch(removeSavedChart(id));
    }, [dispatch]);

    if (!savedCharts.length) return null;

    return (
        <section className={wrapper} aria-labelledby='saved-charts-title'>
            <h2 id='saved-charts-title' className={title}>{translate('saved_charts_title')}</h2>
            <ul>
                {savedCharts.map((c) => (
                    <li key={c.id} className={item}>
                        <div className={meta}>
                            <strong>{c.input.name || translate('unnamed_chart')}</strong>
                            <span>{`${c.input.date.split('-').reverse().join('.')} ${c.input.time ?? ''} · ${c.input.place}`}</span>
                        </div>
                        <div className={actions}>
                            <Button data-id={c.id} onClick={handleOpen}>{translate('saved_open')}</Button>
                            <Button data-id={c.id} type='text' danger onClick={handleDelete}>{translate('delete')}</Button>
                        </div>
                    </li>
                ))}
            </ul>
        </section>
    );
};

export default SavedChartsComponent;
