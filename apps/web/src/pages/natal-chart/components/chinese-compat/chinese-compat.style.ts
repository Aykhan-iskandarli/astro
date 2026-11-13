import {createUseStyles} from 'react-jss';
import colors from 'assets/styles/abstracts/color';
import sizes from 'assets/styles/abstracts/sizes';
import {rem} from 'assets/styles/abstracts/functions';

const styles = {
    section: {display: 'flex', flexDirection: 'column', gap: rem(16), '& > h3': {fontSize: rem(24)}},
    lead: {color: colors.textMuted, lineHeight: 1.7, maxWidth: rem(780)},
    input: {
        display: 'flex',
        flexDirection: 'column',
        gap: rem(6),
        color: colors.textMuted,
        maxWidth: rem(320),
        '& .ant-picker': {width: '100%'},
    },
    result: {
        padding: rem(20),
        borderRadius: rem(sizes.radius),
        border: `1px solid ${colors.borderSoft}`,
        background: 'linear-gradient(170deg, rgba(28,28,56,0.75), rgba(11,11,30,0.45))',
        display: 'flex',
        flexDirection: 'column',
        gap: rem(10),
    },
    pair: {display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: rem(14), fontSize: rem(20)},
    animal: {display: 'flex', alignItems: 'baseline', gap: rem(8), '& span': {color: colors.gold, fontSize: rem(26)}},
    relation: {fontWeight: sizes.weight600},
    good: {color: colors.harmonious},
    bad: {color: colors.tense},
    text: {color: colors.textMuted, lineHeight: 1.7},
    note: {color: colors.textSubtle, fontSize: rem(sizes.small)},
};

// @ts-ignore
export const useChineseCompatStyles = createUseStyles(styles);
