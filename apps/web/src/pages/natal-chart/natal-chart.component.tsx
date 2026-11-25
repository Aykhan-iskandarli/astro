import {Suspense, useCallback, useEffect, useMemo, useState} from 'react';
import {useSearchParams} from 'react-router-dom';
import {AnimatePresence, motion} from 'framer-motion';
import {useDispatch} from 'react-redux';
import {useStore} from 'store/store.config';
import {addSavedChart, setBirthInput} from 'store/store.reducer';
import {IBirthInput} from 'store/store';
import {Routes} from 'router/routes';
import SeoComponent from 'core/shared/seo/seo.component';
import {wasPrerendered} from 'core/helpers/prerender';
import LoaderComponent from 'core/shared/loader/loader.component';
import CosmicBackgroundComponent from 'core/shared/cosmic-background/cosmic-background.component';
import ShootingStarsComponent from 'core/shared/shooting-stars/shooting-stars.component';
import AstrolabeComponent from 'core/shared/astrolabe/astrolabe.component';
import useLocalization from 'assets/lang';
import {useCreateDestinyMatrix, useCreateNatalChart} from './actions/natal-chart.mutation';
import BirthFormComponent from './components/birth-form/birth-form.component';
import SavedChartsComponent from './components/saved-charts/saved-charts.component';
import {lazyWithPreload} from 'core/helpers/lazy-with-preload';

// The result screen (all tabs) is not needed to show the form: it loads when the form is submitted,
// in parallel with the calculation request, so the form page stays light.
const ChartResultComponent = lazyWithPreload(() => import('./components/chart-result/chart-result.component'));
import {useNatalChartStyles} from './natal-chart.style';

const sameInput = (a: IBirthInput, b: IBirthInput) => JSON.stringify(a) === JSON.stringify(b);

function NatalChartComponent() {
    const translate = useLocalization();
    const dispatch = useDispatch();
    const birthInput = useStore('birthInput');
    const savedCharts = useStore('savedCharts');
    const {stage, backdrop, astrolabe, page, formCard, formHead, resultWrap} = useNatalChartStyles();
    const [editing, setEditing] = useState(true);
    // The prerendered form is already on screen: do not fade it out and back in when React takes over (LCP)
    const [firstPaint] = useState(wasPrerendered);

    const {mutate: createChart, data: chart, isPending, reset} = useCreateNatalChart();
    const {mutate: createMatrix, data: matrix, isError: matrixFailed, reset: resetMatrix} = useCreateDestinyMatrix();

    const handleSubmit = useCallback((input: IBirthInput) => {
        ChartResultComponent.preload();
        dispatch(setBirthInput(input));
        createMatrix(input);
        createChart(input, {
            onSuccess: () => {
                setEditing(false);
                window.scrollTo({top: 0, behavior: 'smooth'});
            },
        });
    }, [dispatch, createChart, createMatrix]);

    // Opened from the profiles page: /natal-chart?profile=<id>
    const [params, setParams] = useSearchParams();
    const profileId = params.get('profile');
    const timeParam = params.get('time');
    useEffect(() => {
        if (!profileId) return;
        const profile = savedCharts.find((c) => c.id === profileId);
        setParams({}, {replace: true});
        if (profile) handleSubmit(profile.input);
    }, [profileId, savedCharts, handleSubmit, setParams]);
    useEffect(() => {
        // Opened from the rectification page: /natal-chart?time=14:28 builds the chart for that time. The parameter is
        // left in the address: changing it would remount the page (the layout animates on every navigation).
        if (timeParam && birthInput && /^\d{2}:\d{2}$/.test(timeParam)) handleSubmit({...birthInput, time: timeParam});
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [timeParam]);
    useEffect(() => {
        if (timeParam && chart) setEditing(false);
    }, [timeParam, chart]);

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
        <div className={stage}>
            <AnimatePresence>
                {!showResult && (
                    <motion.div key='backdrop' className={backdrop} aria-hidden='true'
                                initial={firstPaint ? false : {opacity: 0}} animate={{opacity: 1}} exit={{opacity: 0}} transition={{duration: 0.8}}>
                        <CosmicBackgroundComponent intensity={0.85}/>
                        <ShootingStarsComponent/>
                        <div className={astrolabe}><AstrolabeComponent opacity={0.55}/></div>
                    </motion.div>
                )}
            </AnimatePresence>
        <div className={`container ${page}`}>
            <SeoComponent titleKey='seo_chart_title' descriptionKey='seo_chart_description' path={Routes.natalChart}/>
            <AnimatePresence mode='wait'>
                {showResult ? (
                    <motion.div key='result' className={resultWrap} initial={{opacity: 0}} animate={{opacity: 1}} exit={{opacity: 0}}
                                transition={{duration: 0.5}}>
                        <Suspense fallback={<LoaderComponent/>}>
                            <ChartResultComponent chart={chart} matrix={matrix ?? null} matrixFailed={matrixFailed} onEdit={handleEdit} onSave={handleSave} saved={saved}/>
                        </Suspense>
                    </motion.div>
                ) : (
                    <motion.div key='form' initial={firstPaint ? false : {opacity: 0, y: 16}} animate={{opacity: 1, y: 0}} exit={{opacity: 0, y: -12}}
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
        </div>
    );
}

export default NatalChartComponent;
