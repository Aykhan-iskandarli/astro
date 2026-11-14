import {createUseStyles} from 'react-jss';
import colors from 'assets/styles/abstracts/color';
import {rem} from 'assets/styles/abstracts/functions';

const styles = {
    wrap: {
        display: 'flex',
        flexDirection: 'column',
        gap: rem(16),
    },
    muted: {color: colors.textMuted},
    strip: {
        display: 'flex',
        flexDirection: 'column',
        gap: rem(6),
        padding: rem(14),
        borderRadius: rem(14),
        border: `1px solid ${colors.borderSoft}`,
        background: 'rgba(28,28,56,0.4)',
    },
    stripRow: {
        display: 'grid',
        gridTemplateColumns: `${rem(28)} 1fr`,
        alignItems: 'center',
        gap: rem(8),
    },
    stripWho: {'& .glyph': {color: colors.gold, fontSize: rem(18)}},
    track: {
        position: 'relative',
        height: rem(12),
        borderRadius: 999,
        background: 'rgba(157,140,255,0.1)',
    },
    run: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        borderRadius: 999,
        background: colors.tense,
        opacity: 0.85,
    },
    list: {
        listStyle: 'none',
        margin: 0,
        padding: 0,
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 360px), 1fr))',
        gap: rem(12),
    },
    item: {
        display: 'flex',
        flexDirection: 'column',
        gap: rem(6),
        padding: rem(18),
        borderRadius: rem(16),
        border: `1px solid ${colors.borderSoft}`,
        background: 'rgba(28,28,56,0.45)',
        '& h4': {fontSize: rem(18), '& .glyph': {color: colors.gold}},
        '& p': {lineHeight: 1.6},
        '& .glyph': {color: colors.gold},
    },
    dates: {color: colors.gold, fontVariantNumeric: 'tabular-nums'},
    houses: {display: 'flex', flexWrap: 'wrap', gap: rem(6)},
    chip: {
        padding: [rem(2), rem(10)],
        borderRadius: 999,
        border: `1px solid ${colors.border}`,
        fontSize: rem(13),
        color: colors.textMuted,
    },
    text: {color: colors.text},
};

// @ts-ignore
export const useRetrogradeListStyles = createUseStyles(styles);
