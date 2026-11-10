import {createUseStyles} from 'react-jss';
import colors from 'assets/styles/abstracts/color';
import sizes from 'assets/styles/abstracts/sizes';
import {rem} from 'assets/styles/abstracts/functions';

const styles = {
    panel: {
        minHeight: rem(280),
        // Fixed maximum height: long aspect lists scroll inside, so the page below never jumps
        maxHeight: 'calc(100vh - 128px)',
        overflowY: 'auto',
        overscrollBehavior: 'contain',
        padding: rem(24),
        borderRadius: rem(sizes.radius),
        border: `1px solid ${colors.borderSoft}`,
        background: 'linear-gradient(170deg, rgba(28,28,56,0.9), rgba(11,11,30,0.6))',
        backdropFilter: 'blur(4px)',
    },
    head: {
        display: 'flex',
        gap: rem(16),
        alignItems: 'center',
        marginBottom: rem(16),
    },
    bigGlyph: {
        width: rem(56),
        height: rem(56),
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '50%',
        fontSize: rem(30),
        color: colors.gold,
        background: 'radial-gradient(circle, rgba(226,194,117,0.18), transparent 70%)',
        border: `1px solid ${colors.border}`,
    },
    title: {
        fontSize: rem(26),
    },
    position: {
        color: colors.textMuted,
        fontSize: rem(sizes.small),
        '& .glyph': {color: colors.gold},
    },
    text: {
        display: 'flex',
        flexDirection: 'column',
        gap: rem(10),
        color: colors.text,
        lineHeight: 1.7,
    },
    dignity: {
        color: colors.textMuted,
        '& strong': {color: colors.violet, fontWeight: sizes.weight600},
    },
    aspects: {
        marginTop: rem(20),
        paddingTop: rem(16),
        borderTop: `1px solid ${colors.borderSoft}`,
        display: 'flex',
        flexDirection: 'column',
        gap: rem(12),
        fontSize: rem(sizes.small),
        '& li': {display: 'flex', gap: rem(12), alignItems: 'flex-start'},
        '& .glyph': {fontSize: rem(18), width: rem(20), textAlign: 'center', lineHeight: 1.2},
    },
    muted: {color: colors.textSubtle},
    hint: {
        color: colors.textMuted,
        textAlign: 'center',
        paddingTop: rem(80),
    },
    harmonious: {color: colors.harmonious},
    tense: {color: colors.tense},
    neutral: {color: colors.neutral},
    minor: {color: colors.minor},
};

// @ts-ignore
export const useInterpretationPanelStyles = createUseStyles(styles);
