import {ReactElement} from 'react';

export interface IAuthProtectedRouteProps {
    children: ReactElement;
    // Phase 1 has no accounts: every page is 'open'. 'auth'/'public' are reserved for the paid layer.
    layout: 'open';
}
