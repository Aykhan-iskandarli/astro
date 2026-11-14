import axios, {AxiosError, AxiosResponse} from 'axios';
import {environment} from './app.config';
import {errorToast} from '../shared/toast/toast';
import {store} from '../../store/store.config';
import {translateFor} from '../../assets/lang';

// No auth in Phase 1: every endpoint is public. Errors are toasted here, then re-thrown for callers.
const axiosPublic = axios.create({
    baseURL: environment.apiMain,
    timeout: 20000,
});

axiosPublic.interceptors.response.use(
    (response: AxiosResponse) => response,
    (error: AxiosError) => {
        const lang = store.getState().locale;
        const status = error.response?.status;
        if (!error.response) {
            errorToast(translateFor(lang, 'error_network'));
        } else if (status === 422) {
            errorToast(translateFor(lang, 'error_validation'));
        } else {
            errorToast(translateFor(lang, 'error_generic'));
        }
        return Promise.reject(error);
    },
);

export default axiosPublic;
