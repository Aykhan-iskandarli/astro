import {createUseStyles} from 'react-jss';
import colors from 'assets/styles/abstracts/color';
import fonts from 'assets/styles/abstracts/fonts';
import {transition} from 'assets/styles/abstracts/mixins';

const node = (fill: string, stroke: string, text: string) => ({
    '& circle': {fill, stroke},
    '& text': {fill: text},
});

const styles = {
    svg: {
        width: '100%',
        height: 'auto',
        maxWidth: 640,
        margin: '0 auto',
        display: 'block',
        overflow: 'visible',
        userSelect: 'none',
    },
    ring: {
        fill: 'none',
        stroke: colors.border,
        strokeWidth: 1,
        strokeDasharray: '2 6',
    },
    age: {
        fill: colors.textSubtle,
        fontSize: 14,
        fontFamily: fonts.font,
    },
    line: {
        stroke: colors.border,
        strokeWidth: 1.4,
    },
    lineLove: {stroke: colors.nebulaPink, strokeOpacity: 0.7},
    lineMoney: {stroke: colors.earth, strokeOpacity: 0.7},
    node: {
        cursor: 'pointer',
        outline: 'none',
        '& circle': {
            strokeWidth: 1.5,
            transition: transition('stroke, stroke-width', 0.2),
        },
        '& text': {
            fontFamily: fonts.font,
            fontWeight: 600,
            fontVariantNumeric: 'tabular-nums',
        },
        '&:hover circle, &:focus-visible circle': {
            stroke: colors.gold,
            strokeWidth: 2.5,
        },
    },
    anchor: node(colors.violetDeep, colors.violet, colors.white),
    center: node(colors.gold, colors.goldDeep, colors.onGold),
    personal: node(colors.surfaceRaised, colors.violet, colors.text),
    ancestral: node(colors.surface, colors.border, colors.textMuted),
    love: node('#3A1F3F', colors.nebulaPink, colors.text),
    money: node('#1F3326', colors.earth, colors.text),
    active: {
        '& circle': {stroke: `${colors.gold} !important`, strokeWidth: '3px !important'},
    },
};

// @ts-ignore
export const useMatrixDiagramStyles = createUseStyles(styles);
