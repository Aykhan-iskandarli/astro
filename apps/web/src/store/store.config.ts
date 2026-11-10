import {configureStore} from '@reduxjs/toolkit';
import {useSelector} from 'react-redux';
import {persistReducer, persistStore} from 'redux-persist';
import rootReducer from './store.reducer';
import {IState} from './store';

// Minimal localStorage adapter (redux-persist/lib/storage has a CJS/ESM interop bug under Vite).
// Never throws: private mode or blocked storage simply means nothing is remembered.
const safe = <T, >(fn: () => T, fallback: T): T => {
    try {
        return fn();
    } catch {
        return fallback;
    }
};

const storage = {
    getItem: (key: string) => Promise.resolve(safe(() => window.localStorage.getItem(key), null)),
    setItem: (key: string, value: string) => Promise.resolve(safe(() => window.localStorage.setItem(key, value), undefined)),
    removeItem: (key: string) => Promise.resolve(safe(() => window.localStorage.removeItem(key), undefined)),
};

const persistConfig = {
    key: 'astra',
    storage,
    // Privacy: birthInput is deliberately NOT persisted. savedCharts only fills on an explicit "save".
    whitelist: ['locale', 'savedCharts'],
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: false,
        }),
});

export const persistor = persistStore(store);

export const useStore = <K extends keyof IState>(key: K): IState[K] => {
    return useSelector((state: IState) => state[key]);
};
