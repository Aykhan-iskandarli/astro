import {lazy, Suspense, useEffect} from 'react';
import {RouterProvider} from 'react-router-dom';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import {ToastContainer} from 'react-toastify';
import {ConfigProvider} from 'antd';
import azAZ from 'antd/locale/az_AZ';
import enUS from 'antd/locale/en_US';
import {MotionConfig} from 'framer-motion';
import {useStore} from './store/store.config';
import router from './router/router';
import {themeConfig} from './core/configs/theme.config';
import {cleanupPrerender} from './core/helpers/prerender';
import LoaderComponent from './core/shared/loader/loader.component';
import useGlobalStyles from './assets/styles/style';

const ReactQueryDevtools = import.meta.env.DEV
    ? lazy(() => import('@tanstack/react-query-devtools').then((m) => ({default: m.ReactQueryDevtools})).catch(() => ({default: () => null})))
    : () => null;

const queryClient = new QueryClient();

function App() {
    const loader = useStore('loader');
    const locale = useStore('locale');
    useGlobalStyles();

    useEffect(() => {
        cleanupPrerender();
    }, []);

    return (
        <QueryClientProvider client={queryClient}>
            <ConfigProvider theme={themeConfig} locale={locale === 'az' ? azAZ : enUS}>
                {/* reducedMotion='user': every framer-motion animation respects prefers-reduced-motion */}
                <MotionConfig reducedMotion='user'>
                    <div className='App'>
                        <RouterProvider router={router}/>
                        {loader ? <LoaderComponent/> : null}
                    </div>
                </MotionConfig>
                <ToastContainer
                    position='bottom-right'
                    autoClose={5000}
                    hideProgressBar
                    newestOnTop={false}
                    closeOnClick
                    closeButton={false}
                    rtl={false}
                    pauseOnFocusLoss
                    draggable={false}
                    pauseOnHover
                    theme='dark'
                    style={{minHeight: 'auto', maxHeight: '80vh'}}
                />
            </ConfigProvider>
            <Suspense fallback={null}>
                <ReactQueryDevtools initialIsOpen={false}/>
            </Suspense>
        </QueryClientProvider>
    );
}

export default App;
