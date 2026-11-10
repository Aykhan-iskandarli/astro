import {ComponentType, lazy} from 'react';

type Module<P> = {default: ComponentType<P>};

export type PreloadableComponent<P> = ComponentType<P> & {preload: () => Promise<void>};

/**
 * React.lazy that can be resolved ahead of the first render. When preloaded, the real component
 * renders directly — no Suspense fallback flash (which would replace prerendered HTML and shift layout).
 */
export const lazyWithPreload = <P extends object>(factory: () => Promise<Module<P>>): PreloadableComponent<P> => {
    let Loaded: ComponentType<P> | null = null;
    const load = () => factory().then((m) => {
        Loaded = m.default;
        return m;
    });
    const Lazy = lazy(load);
    const Component = ((props: P) => (Loaded ? <Loaded {...props}/> : <Lazy {...props}/>)) as PreloadableComponent<P>;
    Component.preload = () => load().then(() => undefined);
    return Component;
};
