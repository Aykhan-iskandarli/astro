import {useMemo} from 'react';
import {Table} from 'antd';
import type {ColumnsType} from 'antd/es/table';
import {formatDegree, glyph, SIGN_GLYPHS} from 'core/helpers/astro';
import useLocalization, {useContent} from 'assets/lang';
import {ChartPositionModel} from '../../models/natal-chart.model';
import {useHousesTableStyles} from './houses-table.style';
import {IHousesTable} from './houses-table';

const HousesTableComponent = ({chart}: IHousesTable) => {
    const translate = useLocalization();
    const content = useContent();
    const {wrapper, glyphCell} = useHousesTableStyles();

    const signColumn = useMemo(() => ({
        title: translate('col_sign'),
        dataIndex: 'sign',
        render: (sign: string) => (
            <span className={glyphCell}>
                <span className='glyph' aria-hidden='true'>{glyph(SIGN_GLYPHS[sign])}</span>
                {content.signs[sign as keyof typeof content.signs]?.name}
            </span>
        ),
    }), [translate, content, glyphCell]);

    const positionColumn = useMemo(() => ({
        title: translate('col_position'),
        key: 'position',
        render: (_: unknown, r: ChartPositionModel) => formatDegree(r.degree, r.minute),
    }), [translate]);

    const angleColumns: ColumnsType<ChartPositionModel> = useMemo(() => [
        {
            title: translate('section_angles'),
            dataIndex: 'id',
            render: (id: string) => {
                const p = content.points[id as keyof typeof content.points] as {name: string; abbr?: string};
                return `${p.abbr ?? ''} · ${p.name}`;
            },
        },
        signColumn,
        positionColumn,
    ], [translate, content, signColumn, positionColumn]);

    const houseColumns: ColumnsType<ChartPositionModel> = useMemo(() => [
        {
            title: translate('col_house'),
            dataIndex: 'number',
            render: (n: number) => content.houses[String(n) as keyof typeof content.houses]?.name,
        },
        signColumn,
        positionColumn,
    ], [translate, content, signColumn, positionColumn]);

    return (
        <div className={wrapper}>
            <Table<ChartPositionModel> rowKey='id' size='small' columns={angleColumns} dataSource={chart.angles}
                                       pagination={false} scroll={{x: true}}/>
            <Table<ChartPositionModel> rowKey='id' size='small' columns={houseColumns} dataSource={chart.houses}
                                       pagination={false} scroll={{x: true}}/>
        </div>
    );
};

export default HousesTableComponent;
