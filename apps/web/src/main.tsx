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

// Prerendered page: load its route chunk first so React replaces the static HTML in one step
if (wasPrerendered) {
    preloadRoute(window.location.pathname).finally(render);
} else {
    render();
}
