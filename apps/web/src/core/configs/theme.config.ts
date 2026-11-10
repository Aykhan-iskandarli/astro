import {theme, ThemeConfig} from 'antd';
import colors from '../../assets/styles/abstracts/color';
import fonts from '../../assets/styles/abstracts/fonts';

export const themeConfig: ThemeConfig = {
    algorithm: theme.darkAlgorithm,
    token: {
        colorPrimary: colors.gold,
        colorTextLightSolid: colors.onGold,
        colorInfo: colors.violet,
        colorError: colors.error,
        colorSuccess: colors.success,
        colorBgBase: colors.space,
        colorBgContainer: colors.surface,
        colorBgElevated: colors.surfaceRaised,
        colorBorder: colors.border,
        colorBorderSecondary: colors.borderSoft,
        colorText: colors.text,
        colorTextSecondary: colors.textMuted,
        colorTextPlaceholder: colors.textSubtle,
        fontFamily: fonts.font,
        fontSize: 15,
        borderRadius: 12,
        controlHeight: 44,
        controlHeightLG: 52,
    },
    components: {
        Button: {
            primaryShadow: 'none',
            fontWeight: 600,
        },
        Table: {
            headerBg: colors.surfaceRaised,
            rowHoverBg: colors.surfaceRaised,
            borderColor: colors.borderSoft,
        },
    },
};
