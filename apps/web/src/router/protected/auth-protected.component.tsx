import {IAuthProtectedRouteProps} from './auth-protected';

const AuthProtectedComponent = ({children, layout = 'open'}: IAuthProtectedRouteProps) => {
    switch (layout) {
        default:
            return children;
    }
};

export default AuthProtectedComponent;
