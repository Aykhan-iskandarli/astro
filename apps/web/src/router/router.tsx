import {Suspense} from 'react';
import {createBrowserRouter} from 'react-router-dom';
import {Routes} from './routes';
import AuthProtectedComponent from './protected/auth-protected.component';
import {lazyWithPreload} from '../core/helpers/lazy-with-preload';
import LoaderComponent from '../core/shared/loader/loader.component';
import WebsiteComponent from '../core/layouts/website/website.component';
import HomeComponent from '../pages/home/home.component';

const NatalChartComponent = lazyWithPreload(() => import('../pages/natal-chart/natal-chart.component'));
const PrivacyPolicyComponent = lazyWithPreload(() => import('../pages/privacy-policy/privacy-policy.component'));
const NotFoundComponent = lazyWithPreload(() => import('../core/layouts/error/not-found/not-found.component'));

/** Resolve the page chunk for a path before the first render (used for prerendered pages). */
export const preloadRoute = (pathname: string) => {
    const path = pathname.replace(/\/+$/, '') || '/';
    if (path === Routes.natalChart) return NatalChartComponent.preload();
    if (path === Routes.privacyPolicy) return PrivacyPolicyComponent.preload();
    return Promise.resolve();
};

const withSuspense = (element: React.ReactNode) => (
    <Suspense fallback={<LoaderComponent/>}>{element}</Suspense>
);

const router = createBrowserRouter([
    {
        element: <AuthProtectedComponent layout='open'><WebsiteComponent/></AuthProtectedComponent>,
        children: [
            {
                path: Routes.default,
                element: <HomeComponent/>,
            },
            {
                path: Routes.natalChart,
                element: withSuspense(<NatalChartComponent/>),
            },
            {
                path: Routes.privacyPolicy,
                element: withSuspense(<PrivacyPolicyComponent/>),
            },
            {
                path: '*',
                element: withSuspense(<NotFoundComponent/>),
            },
        ],
    },
], {basename: '/'});

export default router;
