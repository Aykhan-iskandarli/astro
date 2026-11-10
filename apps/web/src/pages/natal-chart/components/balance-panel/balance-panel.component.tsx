import {useRef} from 'react';
import {motion, useInView} from 'framer-motion';
import {glyph, POINT_GLYPHS} from 'core/helpers/astro';
import colors from 'assets/styles/abstracts/color';
import useLocalization, {useContent} from 'assets/lang';
import {useBalancePanelStyles} from './balance-panel.style';
import {IBalancePanel} from './balance-panel';

const GROUP_COLORS: Record<string, string> = {
    fire: colors.fire, earth: colors.earth, air: colors.air, water: colors.water,
    cardinal: colors.gold, fixed: colors.violet, mutable: colors.harmonious,
    positive: colors.gold, negative: colors.violet,
};

const BalancePanelComponent = ({balance}: IBalancePanel) => {
    const translate = useLocalization();
    const content = useContent();
    const {panel, group, groupTitle, row, label, track, bar, count, members, dominant} = useBalancePanelStyles();
    // One observer for the whole panel (per-bar whileInView proved unreliable for the middle column)
    const ref = useRef<HTMLDivElement>(null);
    const inView = useInView(ref, {once: true, amount: 0.3});

    const groups = [
        {key: 'elements', title: translate('elements'), data: balance.elements, texts: content.elements},
        {key: 'modalities', title: translate('modalities'), data: balance.modalities, texts: content.modalities},
        {key: 'polarity', title: translate('polarity'), data: balance.polarity, texts: content.polarity},
    ] as const;

    return (
        <div ref={ref} className={panel}>
            {groups.map((g) => {
                const total = Object.values(g.data).reduce((a, b) => a + b, 0) || 1;
                return (
                    <section key={g.key} className={group} aria-label={g.title}>
                        <h4 className={groupTitle}>{g.title}</h4>
                        {Object.entries(g.data).map(([k, v], i) => {
                            const text = (g.texts as Record<string, {name: string; meaning: string}>)[k];
                            const who = balance.members[k] ?? [];
                            return (
                                <div key={k} className={row}>
                                    <span className={label} title={text?.meaning}>{text?.name}</span>
                                    <span className={track} aria-hidden='true'>
                                        <motion.span
                                            className={bar}
                                            style={{background: GROUP_COLORS[k], originX: 0}}
                                            initial={{scaleX: 0}}
                                            animate={{scaleX: inView ? v / total : 0}}
                                            transition={{delay: 0.1 + i * 0.08, duration: 0.9, ease: [0.22, 1, 0.36, 1]}}
                                        />
                                    </span>
                                    <span className={count}>{v}</span>
                                    {who.length ? (
                                        <span className={members} aria-label={who.map((id) => content.points[id as keyof typeof content.points]?.name).join(', ')}>
                                            {who.map((id) => <span key={id} className='glyph' aria-hidden='true'>{glyph(POINT_GLYPHS[id])}</span>)}
                                        </span>
                                    ) : <span className={members}/>}
                                </div>
                            );
                        })}
                    </section>
                );
            })}
            <p className={dominant}>
                {translate('dominant')}: {balance.dominant.element.map((e) => content.elements[e as keyof typeof content.elements]?.name).join(', ')}
                {' · '}{balance.dominant.modality.map((m) => content.modalities[m as keyof typeof content.modalities]?.name).join(', ')}
                {balance.missing.element.length
                    ? <>{' · '}{translate('missing')}: {balance.missing.element.map((e) => content.elements[e as keyof typeof content.elements]?.name).join(', ')}</>
                    : null}
            </p>
        </div>
    );
};

export default BalancePanelComponent;
