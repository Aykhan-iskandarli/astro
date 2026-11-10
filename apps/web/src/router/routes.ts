export enum Routes {
    default = '/',
    natalChart = '/natal-chart',
    privacyPolicy = '/privacy-policy',
}

export const goTo = (route: string, param: string | number) => {
    return route + '/' + param;
};

export const goToWithQuery = (route: string, param: Record<string, string | number> | null) => {
    let path = route + '?';
    if (param)
        for (const key in param) {
            if (path.substr(path.length - 1) !== '?')
                path += '&';
            path += key + '=' + encodeURIComponent(String(param[`${key}`]));
        }
    return path;
};

/** Public, indexable routes (used for sitemap generation). */
export const publicRoutes = [Routes.default, Routes.natalChart, Routes.privacyPolicy];
