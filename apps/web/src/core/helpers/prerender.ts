/** True when this page load started from build-time prerendered HTML (see scripts/prerender.mjs). */
export const wasPrerendered = typeof document !== 'undefined'
    && document.documentElement.hasAttribute('data-prerendered');

/**
 * Remove the static copies once React has rendered: JSS sheets (JSS re-injects its own) and route head tags
 * (React 19 hoists fresh ones). Ant Design's CSS-in-JS styles (data-css-hash / data-rc-order) are KEPT:
 * antd adopts existing style tags as if server-rendered and does not inject them again.
 */
export const cleanupPrerender = () => {
    document.querySelectorAll('style[data-jss][data-prerender], head > :not(style)[data-prerender]')
        .forEach((el) => el.remove());
};
