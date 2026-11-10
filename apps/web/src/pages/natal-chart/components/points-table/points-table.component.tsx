import {useCallback, useMemo} from 'react';
import {Table} from 'antd';
import type {ColumnsType} from 'antd/es/table';
import classNames from 'classnames';
import {formatDegree, glyph, POINT_GLYPHS, SIGN_GLYPHS} from 'core/helpers/astro';
import useLocalization, {useContent} from 'assets/lang';
import {ChartPointModel} from '../../models/natal-chart.model';
import {usePointsTableStyles} from './points-table.style';
import {IPointsTable} from './points-table';

const PointsTableComponent = ({chart, activeId, onActivate, onSelect}: IPointsTable) => {
    const translate = useLocalization();
    const content = useContent();
    const {table, glyphCell, active, retro, dignity} = usePointsTableStyles();

    const columns: ColumnsType<ChartPointModel> = useMemo(() => [
        {
            title: translate('col_point'),
            dataIndex: 'id',
            render: (id: string) => (
                <span className={glyphCell}>
                    <span className='glyph' aria-hidden='true'>{id === 'partOfFortune' ? '⊗' : glyph(POINT_GLYPHS[id])}</span>
                    {content.points[id as keyof typeof content.points]?.name}
                </span>
            ),
        },
        {
            title: translate('col_sign'),
            dataIndex: 'sign',
            render: (sign: string) => (
                <span className={glyphCell}>
                    <span className='glyph' aria-hidden='true'>{glyph(SIGN_GLYPHS[sign])}</span>
                    {content.signs[sign as keyof typeof content.signs]?.name}
                </span>
            ),
        },
        {
            title: translate('col_position'),
            key: 'position',
            render: (_: unknown, p) => (
                <span>
                    {formatDegree(p.degree, p.minute)}
                    {p.retrograde ? <abbr className={retro} title={translate('retrograde')}> {translate('retrograde_short')}</abbr> : null}
                </span>
            ),
        },
        ...(chart.timeUnknown ? [] : [{
            title: translate('col_house'),
            dataIndex: 'house',
            align: 'center' as const,
        }]),
        {
            title: translate('col_dignity'),
            dataIndex: 'dignity',
            render: (d: string | null) => (d
                ? <span className={dignity}>{content.dignities[d as keyof typeof content.dignities]?.name}</span>
                : '—'),
        },
    ], [translate, content, chart.timeUnknown, glyphCell, retro, dignity]);

    const handleRow = useCallback((record: ChartPointModel) => ({
        onMouseEnter: () => onActivate(record.id),
        onMouseLeave: () => onActivate(null),
        onClick: () => record.id && onSelect(record.id),
    }), [onActivate, onSelect]);

    const rowClassName = useCallback((record: ChartPointModel) => classNames({[active]: record.id === activeId}), [active, activeId]);

    return (
        <Table<ChartPointModel>
            className={table}
            rowKey='id'
            size='small'
            columns={columns}
            dataSource={chart.points}
            pagination={false}
            scroll={{x: true}}
            onRow={handleRow}
            rowClassName={rowClassName}
        />
    );
};

export default PointsTableComponent;
