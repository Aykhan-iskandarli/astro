import {createUseStyles} from 'react-jss';
import colors from 'assets/styles/abstracts/color';
import fonts from 'assets/styles/abstracts/fonts';
import {transition} from 'assets/styles/abstracts/mixins';

const styles = {
    wheel: {
        width: '100%',
        height: 'auto',
        maxWidth: 680,
        margin: '0 auto',
        overflow: 'visible',
        userSelect: 'none',
    },
    ring: {
        fill: 'none',
        stroke: colors.border,
        strokeWidth: 1.2,
    },
    signGlyph: {
        fontSize: 22,
    },
    tick: {
        stroke: colors.border,
        strokeWidth: 1,
    },
    cusp: {
        stroke: colors.textSubtle,
        strokeOpacity: 0.55,
        strokeWidth: 1,
    },
    axis: {
        stroke: colors.gold,
        strokeOpacity: 0.9,
        strokeWidth: 1.8,
    },
    houseNum: {
        fill: colors.textSubtle,
        fontSize: 12,
        fontFamily: fonts.font,
    },
    angleLabel: {
        fill: colors.gold,
        fontSize: 13,
        fontWeight: 600,
        fontFamily: fonts.font,
        letterSpacing: '0.06em',
    },
    aspects: {},
    aspect: {
        strokeWidth: 1.3,
        strokeOpacity: 0.75,
        transition: transition('stroke-opacity, stroke-width', 0.25),
    },
    harmonious: {stroke: colors.harmonious},
    tense: {stroke: colors.tense},
    neutral: {stroke: colors.neutral},
    minor: {stroke: colors.minor},
    minorAspect: {
        strokeDasharray: '3 4',
        strokeOpacity: 0.4,
    },
    fader: {
        transition: transition('opacity', 0.3),
    },
    dimmed: {
        opacity: 0.15,
    },
    highlighted: {
        strokeWidth: 2.4,
        strokeOpacity: 1,
    },
    point: {
        cursor: 'pointer',
        outline: 'none',
        '&:focus-visible $hit': {
            stroke: colors.gold,
            strokeWidth: 1.5,
        },
    },
    pointActive: {
        '& $pointGlyph': {fill: colors.gold},
        '& $pofGlyph': {stroke: colors.gold},
        '& $hit': {fill: 'rgba(226,194,117,0.12)'},
    },
    hit: {
        fill: 'transparent',
        stroke: 'none',
    },
    outerPoint: {
        '& $pointGlyph': {fill: colors.harmonious},
    },
    outerTick: {
        stroke: colors.harmonious,
        strokeWidth: 2,
    },
    pointGlyph: {
        fill: colors.text,
        fontSize: 21,
        transition: transition('fill', 0.2),
    },
    pofGlyph: {
        fill: 'none',
        stroke: colors.text,
        strokeWidth: 1.4,
    },
    pointTick: {
        stroke: colors.gold,
        strokeWidth: 2,
    },
    connector: {
        stroke: colors.textSubtle,
        strokeOpacity: 0.5,
        strokeWidth: 0.8,
    },
    degree: {
        fill: colors.textMuted,
        fontSize: 11,
        fontFamily: fonts.font,
    },
};

// @ts-ignore
export const useChartWheelStyles = createUseStyles(styles);
