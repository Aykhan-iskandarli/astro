import {useMemo} from 'react';
import {Table} from 'antd';
import type {ColumnsType} from 'antd/es/table';
import {formatDegree, glyph, POINT_GLYPHS, SIGN_GLYPHS} from 'core/helpers/astro';
import useLocalization, {useContent} from 'assets/lang';
import {ChartPositionModel, HouseCuspModel} from '../../models/natal-chart.model';
import {useHousesTableStyles} from './houses-table.style';
import {IHousesTable} from './houses-table';

const HousesTableComponent = ({chart}: IHousesTable) => {
    const translate = useLocalization();
    const content = useContent();
    const {wrapper, glyphCell, rulerCell, links, linkItem, linkHead, linkText, muted} = useHousesTableStyles();
    const houseName = (n: number | null) => (n ? content.houses[String(n) as keyof typeof content.houses] : null);
    const pointName = (id: string | null) => (id ? content.points[id as keyof typeof content.points]?.name : '');

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
        {
            title: translate('col_ruler'),
            key: 'rulers',
            render: (_: unknown, r: ChartPositionModel) => (
                <span className={rulerCell}>
                    {(r as HouseCuspModel).rulers.map((ru) => (
                        <span key={ru.id} className={`${glyphCell} ${ru.kind === 'modern' ? muted : ''}`}>
                            <span className='glyph' aria-hidden='true'>{glyph(POINT_GLYPHS[ru.id!])}</span>
                            {pointName(ru.id)}{ru.house ? ` → ${ru.house}` : ''}
                        </span>
                    ))}
                </span>
            ),
        },
    ], [translate, content, signColumn, positionColumn, glyphCell, rulerCell, muted]);

    return (
        <div className={wrapper}>
            <Table<ChartPositionModel> rowKey='id' size='small' columns={angleColumns} dataSource={chart.angles}
                                       pagination={false} scroll={{x: true}}/>
            <Table<ChartPositionModel> rowKey='id' size='small' columns={houseColumns} dataSource={chart.houses}
                                       pagination={false} scroll={{x: true}}/>

            <div>
                <h3 className={linkHead}>{translate('house_links_title')}</h3>
                <p className={muted}>{translate('house_links_intro')}</p>
            </div>
            <ul className={links}>
                {(chart.houses as HouseCuspModel[]).map((h) => {
                    const ruler = h.rulers[0];
                    const own = houseName(h.number);
                    const target = houseName(ruler?.house ?? null);
                    if (!ruler || !own || !target) return null;
                    return (
                        <li key={h.id} className={linkItem}>
                            <p className={glyphCell}>
                                <strong>{own.name}</strong>
                                <span aria-hidden='true'>→</span>
                                <span className='glyph' aria-hidden='true'>{glyph(POINT_GLYPHS[ruler.id!])}</span>
                                {pointName(ruler.id)}
                                <span aria-hidden='true'>→</span>
                                <strong>{target.name}</strong>
                            </p>
                            <p className={linkText}>
                                {h.number === ruler.house
                                    ? translate('house_link_self', {t1: own.theme, planet: pointName(ruler.id)})
                                    : translate('house_link', {t1: own.theme, planet: pointName(ruler.id), h2: target.name, t2: target.theme})}
                            </p>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
};

export default HousesTableComponent;
