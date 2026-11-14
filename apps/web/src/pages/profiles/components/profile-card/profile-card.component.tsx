import {useCallback, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {Button, Input, Popconfirm, Select} from 'antd';
import {useDispatch} from 'react-redux';
import {Routes} from 'router/routes';
import {removeSavedChart, setPrimaryChart, updateSavedChart} from 'store/store.reducer';
import {IRelation} from 'store/store';
import useLocalization from 'assets/lang';
import {ITranslationKey} from 'assets/lang/lang';
import {useProfilesStyles} from '../../profiles.style';
import {IProfileCard} from './profile-card';

const RELATIONS: IRelation[] = ['self', 'partner', 'family', 'friend', 'other'];

const ProfileCardComponent = ({chart, isPrimary}: IProfileCard) => {
    const translate = useLocalization();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const classes = useProfilesStyles();
    const [editing, setEditing] = useState(false);
    const [draft, setDraft] = useState(chart.input.name ?? '');

    const relationOptions = RELATIONS.map((r) => ({value: r, label: translate(`relation_${r}` as ITranslationKey)}));

    const handleOpen = useCallback(() => {
        navigate(`${Routes.natalChart}?profile=${chart.id}`);
    }, [navigate, chart.id]);
    const handlePrimary = useCallback(() => {
        dispatch(setPrimaryChart(isPrimary ? null : chart.id));
    }, [dispatch, isPrimary, chart.id]);
    const handleDelete = useCallback(() => {
        dispatch(removeSavedChart(chart.id));
    }, [dispatch, chart.id]);
    const handleRelation = useCallback((relation: IRelation) => {
        dispatch(updateSavedChart({id: chart.id, relation}));
    }, [dispatch, chart.id]);
    const handleEdit = useCallback(() => {
        setDraft(chart.input.name ?? '');
        setEditing(true);
    }, [chart.input.name]);
    const handleDraft = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setDraft(e.target.value.slice(0, 80));
    }, []);
    const handleRename = useCallback(() => {
        dispatch(updateSavedChart({id: chart.id, name: draft.trim()}));
        setEditing(false);
    }, [dispatch, chart.id, draft]);

    return (
        <li className={`${classes.card} ${isPrimary ? classes.primary : ''}`}>
            <div className={classes.top}>
                {editing ? (
                    <Input value={draft} onChange={handleDraft} onPressEnter={handleRename} onBlur={handleRename}
                           autoFocus aria-label={translate('field_name')} className={classes.nameInput}/>
                ) : (
                    <h2 className={classes.name}>{chart.input.name || translate('unnamed_chart')}</h2>
                )}
                {isPrimary ? <span className={classes.badge}>{translate('profiles_mine')}</span> : null}
            </div>
            <p className={classes.muted}>
                {chart.input.date.split('-').reverse().join('.')}{chart.input.time ? ` · ${chart.input.time}` : ''} · {chart.input.place}
            </p>
            <Select<IRelation> value={chart.relation ?? 'other'} options={relationOptions} className={classes.relation}
                               aria-label={translate('profiles_relation')} onChange={handleRelation}/>
            <div className={classes.actions}>
                <Button type='primary' onClick={handleOpen}>{translate('saved_open')}</Button>
                <Button onClick={handlePrimary} aria-pressed={isPrimary}>
                    {isPrimary ? translate('profiles_unset_mine') : translate('profiles_set_mine')}
                </Button>
                <Button type='text' onClick={handleEdit}>{translate('profiles_rename')}</Button>
                <Popconfirm title={translate('profiles_delete_confirm')} okText={translate('delete')}
                            cancelText={translate('cancel')} onConfirm={handleDelete}>
                    <Button type='text' danger>{translate('delete')}</Button>
                </Popconfirm>
            </div>
        </li>
    );
};

export default ProfileCardComponent;
