import {useCallback, useMemo, useState} from 'react';
import {AnimatePresence, motion} from 'framer-motion';
import {useDispatch} from 'react-redux';
import {useStore} from 'store/store.config';
import {addSavedChart, setBirthInput} from 'store/store.reducer';
import {IBirthInput} from 'store/store';
import {Routes} from 'router/routes';
import SeoComponent from 'core/shared/seo/seo.component';
import LoaderComponent from 'core/shared/loader/loader.component';
import useLocalization from 'assets/lang';
import {useCreateDestinyMatrix, useCreateNatalChart} from './actions/natal-chart.mutation';
import BirthFormComponent from './components/birth-form/birth-form.component';
import SavedChartsComponent from './components/saved-charts/saved-charts.component';
import ChartResultComponent from './components/chart-result/chart-result.component';
import {useNatalChartStyles} from './natal-chart.style';

const sameInput = (a: IBirthInput, b: IBirthInput) => JSON.stringify(a) === JSON.stringify(b);

function NatalChartComponent() {
    const translate = useLocalization();
    const dispatch = useDispatch();
    const birthInput = useStore('birthInput');
    const savedCharts = useStore('savedCharts');
    const {page, formCard, formHead, resultWrap} = useNatalChartStyles();
    const [editing, setEditing] = useState(true);

    const {mutate: createChart, data: chart, isPending, reset} = useCreateNatalChart();
    const {mutate: createMatrix, data: matrix, isError: matrixFailed, reset: resetMatrix} = useCreateDestinyMatrix();

    const handleSubmit = useCallback((input: IBirthInput) => {
        dispatch(setBirthInput(input));
        createMatrix(input);
        createChart(input, {
            onSuccess: () => {
                setEditing(false);
                window.scrollTo({top: 0, behavior: 'smooth'});
            },
        });
    }, [dispatch, createChart, createMatrix]);

    const handleEdit = useCallback(() => {
        setEditing(true);
        reset();
        resetMatrix();
    }, [reset, resetMatrix]);

    const saved = useMemo(() => Boolean(birthInput && savedCharts.some((c) => sameInput(c.input, birthInput))), [birthInput, savedCharts]);

    const handleSave = useCallback(() => {
        if (!birthInput || saved) return;
        dispatch(addSavedChart({
            id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            savedAt: new Date().toISOString(),
            input: birthInput,
        }));
    }, [birthInput, saved, dispatch]);

    const showResult = !editing && chart;

    return (
        <div className={`container ${page}`}>
            <SeoComponent titleKey='seo_chart_title' descriptionKey='seo_chart_description' path={Routes.natalChart}/>
            <AnimatePresence mode='wait'>
                {showResult ? (
                    <motion.div key='result' className={resultWrap} initial={{opacity: 0}} animate={{opacity: 1}} exit={{opacity: 0}}
                                transition={{duration: 0.5}}>
                        <ChartResultComponent chart={chart} matrix={matrix ?? null} matrixFailed={matrixFailed} onEdit={handleEdit} onSave={handleSave} saved={saved}/>
                    </motion.div>
                ) : (
                    <motion.div key='form' initial={{opacity: 0, y: 16}} animate={{opacity: 1, y: 0}} exit={{opacity: 0, y: -12}}
                                transition={{duration: 0.5}}>
                        <div className={formCard}>
                            <div className={formHead}>
                                <h1>{translate('form_title')}</h1>
                                <p>{translate('form_subtitle')}</p>
                            </div>
                            {isPending ? <LoaderComponent/> : (
                                <BirthFormComponent initialValue={birthInput} loading={isPending} onSubmit={handleSubmit}/>
                            )}
                            <SavedChartsComponent onOpen={handleSubmit}/>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default NatalChartComponent;
