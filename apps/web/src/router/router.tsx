import {Suspense} from 'react';
import {createBrowserRouter} from 'react-router-dom';
import {Routes} from './routes';
import AuthProtectedComponent from './protected/auth-protected.component';
import {lazyWithPreload} from '../core/helpers/lazy-with-preload';
import LoaderComponent from '../core/shared/loader/loader.component';
import WebsiteComponent from '../core/layouts/website/website.component';
import HomeComponent from '../pages/home/home.component';

const NatalChartComponent = lazyWithPreload(() => import('../pages/natal-chart/natal-chart.component'));
const SkyComponent = lazyWithPreload(() => import('../pages/sky/sky.component'));
const CalendarComponent = lazyWithPreload(() => import('../pages/calendar/calendar.component'));
const NameAnalysisComponent = lazyWithPreload(() => import('../pages/name-analysis/name-analysis.component'));
const ProfilesComponent = lazyWithPreload(() => import('../pages/profiles/profiles.component'));
const YearForecastComponent = lazyWithPreload(() => import('../pages/year-forecast/year-forecast.component'));
const ChooseDayComponent = lazyWithPreload(() => import('../pages/choose-day/choose-day.component'));
const TransformationsComponent = lazyWithPreload(() => import('../pages/transformations/transformations.component'));
const DirectionsComponent = lazyWithPreload(() => import('../pages/directions/directions.component'));
const PastEventsComponent = lazyWithPreload(() => import('../pages/past-events/past-events.component'));
const QuestionsComponent = lazyWithPreload(() => import('../pages/questions/questions.component'));
const DashboardComponent = lazyWithPreload(() => import('../pages/dashboard/dashboard.component'));
const RectificationComponent = lazyWithPreload(() => import('../pages/rectification/rectification.component'));
const LifeTimelineComponent = lazyWithPreload(() => import('../pages/life-timeline/life-timeline.component'));
const GlossaryComponent = lazyWithPreload(() => import('../pages/glossary/glossary.component'));
const PrivacyPolicyComponent = lazyWithPreload(() => import('../pages/privacy-policy/privacy-policy.component'));
const NotFoundComponent = lazyWithPreload(() => import('../core/layouts/error/not-found/not-found.component'));

/** Resolve the page chunk for a path before the first render (used for prerendered pages). */
export const preloadRoute = (pathname: string) => {
    const path = pathname.replace(/\/+$/, '') || '/';
    if (path === Routes.natalChart) return NatalChartComponent.preload();
    if (path === Routes.today) return SkyComponent.preload();
    if (path === Routes.calendar) return CalendarComponent.preload();
    if (path === Routes.nameAnalysis) return NameAnalysisComponent.preload();
    if (path === Routes.profiles) return ProfilesComponent.preload();
    if (path === Routes.yearForecast) return YearForecastComponent.preload();
    if (path === Routes.chooseDay) return ChooseDayComponent.preload();
    if (path === Routes.transformations) return TransformationsComponent.preload();
    if (path === Routes.directions) return DirectionsComponent.preload();
    if (path === Routes.pastEvents) return PastEventsComponent.preload();
    if (path === Routes.questions) return QuestionsComponent.preload();
    if (path === Routes.dashboard) return DashboardComponent.preload();
    if (path === Routes.rectification) return RectificationComponent.preload();
    if (path === Routes.lifeTimeline) return LifeTimelineComponent.preload();
    if (path === Routes.glossary) return GlossaryComponent.preload();
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
                path: Routes.today,
                element: withSuspense(<SkyComponent/>),
            },
            {
                path: Routes.nameAnalysis,
                element: withSuspense(<NameAnalysisComponent/>),
            },
            {
                path: Routes.calendar,
                element: withSuspense(<CalendarComponent/>),
            },
            {
                path: Routes.profiles,
                element: withSuspense(<ProfilesComponent/>),
            },
            {
                path: Routes.yearForecast,
                element: withSuspense(<YearForecastComponent/>),
            },
            {
                path: Routes.chooseDay,
                element: withSuspense(<ChooseDayComponent/>),
            },
            {
                path: Routes.transformations,
                element: withSuspense(<TransformationsComponent/>),
            },
            {
                path: Routes.directions,
                element: withSuspense(<DirectionsComponent/>),
            },
            {
                path: Routes.pastEvents,
                element: withSuspense(<PastEventsComponent/>),
            },
            {
                path: Routes.questions,
                element: withSuspense(<QuestionsComponent/>),
            },
            {
                path: Routes.dashboard,
                element: withSuspense(<DashboardComponent/>),
            },
            {
                path: Routes.rectification,
                element: withSuspense(<RectificationComponent/>),
            },
            {
                path: Routes.lifeTimeline,
                element: withSuspense(<LifeTimelineComponent/>),
            },
            {
                path: Routes.glossary,
                element: withSuspense(<GlossaryComponent/>),
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
