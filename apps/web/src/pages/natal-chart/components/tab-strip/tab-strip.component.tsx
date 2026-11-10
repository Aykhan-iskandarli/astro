import {useCallback, useEffect, useRef} from 'react';
import {motion} from 'framer-motion';
import classNames from 'classnames';
import {useTabStripStyles} from './tab-strip.style';
import {ITabStrip} from './tab-strip';

// Natively scrollable tab bar (replaces antd's bar, whose own scroll handling fought touch/mouse scrolling on
// phones and made off-screen tabs unclickable). WAI-ARIA tabs pattern: arrows / Home / End move between tabs.
const TabStripComponent = ({items, activeKey, onChange, label}: ITabStrip) => {
    const classes = useTabStripStyles();
    const listRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const el = listRef.current?.querySelector<HTMLElement>(`[data-key="${activeKey}"]`);
        el?.scrollIntoView({block: 'nearest', inline: 'nearest'});
    }, [activeKey]);

    const handleClick = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
        const key = e.currentTarget.dataset.key;
        if (key) onChange(key);
    }, [onChange]);

    const handleKey = useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
        const i = items.findIndex((it) => it.key === activeKey);
        const next = {ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: items.length - 1}[e.key];
        if (next === undefined) return;
        e.preventDefault();
        const target = items[(next + items.length) % items.length];
        onChange(target.key);
        listRef.current?.querySelector<HTMLElement>(`[data-key="${target.key}"]`)?.focus();
    }, [items, activeKey, onChange]);

    return (
        <div ref={listRef} className={classes.strip} role='tablist' aria-label={label} onKeyDown={handleKey}>
            {items.map((it) => {
                const active = it.key === activeKey;
                return (
                    <button
                        key={it.key}
                        type='button'
                        role='tab'
                        id={`tab-${it.key}`}
                        aria-selected={active}
                        aria-controls={`panel-${it.key}`}
                        tabIndex={active ? 0 : -1}
                        data-key={it.key}
                        className={classNames(classes.tab, {[classes.active]: active})}
                        onClick={handleClick}
                    >
                        {it.label}
                        {active ? <motion.span layoutId='tab-underline' className={classes.underline} transition={{duration: 0.3}}/> : null}
                    </button>
                );
            })}
        </div>
    );
};

export default TabStripComponent;
