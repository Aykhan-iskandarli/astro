import 'reflect-metadata';
import {createRoot} from 'react-dom/client';
import {Provider} from 'react-redux';
import {PersistGate} from 'redux-persist/integration/react';
// Playfair Display and Inter @font-face rules live in assets/styles/base/font-faces.ts (font-display: block + preload)
import '@fontsource/noto-sans-symbols/symbols-400.css';
import 'react-toastify/dist/ReactToastify.css';
import {persistor, store} from './store/store.config';
import {preloadRoute} from './router/router';
import {wasPrerendered} from './core/helpers/prerender';
import App from './App';
import {ensureLocale} from './assets/lang';
import {ILang} from './assets/lang/lang';

const render = () => {
    createRoot(document.getElementById('root')!).render(
        <Provider store={store}>
            {/* Render immediately (no blank gate): saved charts / locale arrive with the rehydrate action */}
            <PersistGate persistor={persistor}>
                {() => <App/>}
            </PersistGate>
        </Provider>,
    );
};

// The saved language (redux-persist key "persist:astra"), read before the first render so a visitor who chose
// another language never sees a flash of the Azerbaijani fallback while it loads
const savedLocale = (): ILang | null => {
    try {
        const raw = window.localStorage.getItem('persist:astra');
        const locale = raw ? JSON.parse(JSON.parse(raw).locale ?? 'null') : null;
        return locale === 'en' || locale === 'ru' ? locale : null;
    } catch {
        return null;
    }
};

const locale = savedLocale();
const ready = [
    // Prerendered page: load its route chunk first so React replaces the static HTML in one step
    wasPrerendered ? preloadRoute(window.location.pathname) : Promise.resolve(),
    locale ? ensureLocale(locale) : Promise.resolve(),
];
Promise.allSettled(ready).finally(render);
