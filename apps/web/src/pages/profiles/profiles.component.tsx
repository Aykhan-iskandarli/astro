import {useCallback, useRef, useState} from 'react';
import {Link} from 'react-router-dom';
import {Alert, Button} from 'antd';
import {useDispatch} from 'react-redux';
import {Routes} from 'router/routes';
import {useStore} from 'store/store.config';
import {importSavedCharts} from 'store/store.reducer';
import {ISavedChart} from 'store/store';
import SeoComponent from 'core/shared/seo/seo.component';
import {downloadBlob} from 'core/helpers/export-image';
import {errorToast} from 'core/shared/toast/toast';
import useLocalization from 'assets/lang';
import {parseProfilesBackup} from './profiles.helpers';
import ProfileCardComponent from './components/profile-card/profile-card.component';
import {useProfilesStyles} from './profiles.style';

// Saved charts as people: who they are, which one is "me", plus a JSON backup (data lives only in this browser).
function ProfilesComponent() {
    const translate = useLocalization();
    const dispatch = useDispatch();
    const saved = useStore('savedCharts');
    const primaryId = useStore('primaryChartId');
    const classes = useProfilesStyles();
    const fileRef = useRef<HTMLInputElement>(null);
    const [imported, setImported] = useState<number | null>(null);


    const handleExport = useCallback(() => {
        const data = JSON.stringify({app: 'astra', version: 1, exportedAt: new Date().toISOString(), profiles: saved}, null, 2);
        downloadBlob(new Blob([data], {type: 'application/json'}), 'astra-profiles.json');
    }, [saved]);
    const handleImportClick = useCallback(() => {
        fileRef.current?.click();
    }, []);
    const handleImport = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        e.target.value = '';
        if (!file) return;
        try {
            const profiles = parseProfilesBackup(await file.text());
            dispatch(importSavedCharts(profiles));
            setImported(profiles.length);
        } catch {
            errorToast(translate('profiles_import_error'));
        }
    }, [dispatch, translate]);

    const sorted = [...saved].sort((a, b) => Number(b.id === primaryId) - Number(a.id === primaryId));

    return (
        <article className={`container ${classes.page}`}>
            <SeoComponent titleKey='seo_profiles_title' descriptionKey='seo_profiles_description' path={Routes.profiles}/>
            <header className={classes.head}>
                <h1>{translate('profiles_title')}</h1>
                <p className={classes.muted}>{translate('profiles_intro')}</p>
            </header>

            <div className={classes.toolbar}>
                <Link to={Routes.natalChart}><Button type='primary'>{translate('profiles_new')}</Button></Link>
                <Button onClick={handleExport} disabled={!saved.length}>{translate('profiles_export')}</Button>
                <Button onClick={handleImportClick}>{translate('profiles_import')}</Button>
                <input ref={fileRef} type='file' accept='application/json,.json' hidden onChange={handleImport}/>
            </div>
            {imported !== null ? <Alert type='success' showIcon closable title={translate('profiles_imported', {n: imported})}/> : null}

            {sorted.length ? (
                <ul className={classes.list}>
                    {sorted.map((c: ISavedChart) => (
                        <ProfileCardComponent key={c.id} chart={c} isPrimary={c.id === primaryId}/>
                    ))}
                </ul>
            ) : (
                <div className={classes.empty}>
                    <p>{translate('profiles_empty')}</p>
                </div>
            )}
            <p className={classes.muted}>{translate('profiles_privacy')}</p>
        </article>
    );
}

export default ProfilesComponent;
