import LoaderComponent from 'core/shared/loader/loader.component';
import useLocalization from 'assets/lang';
import {useGetMoonLunations} from '../../actions/sky.query';
import LunationListComponent from '../lunation-list/lunation-list.component';
import {IPersonalLunations} from './personal-lunations';

// The coming lunations and eclipses read in the user's chart (loads them from the API).
const PersonalLunationsComponent = ({input, start, days, limit, expandable}: IPersonalLunations) => {
    const translate = useLocalization();
    const {data, isFetching, isError} = useGetMoonLunations(input, start, days);

    if (isError) return <p>{translate('lunations_personal_error')}</p>;
    if (!data) return isFetching ? <LoaderComponent/> : null;

    return <LunationListComponent lunations={data.lunations} timeUnknown={data.timeUnknown} limit={limit} expandable={expandable}/>;
};

export default PersonalLunationsComponent;
