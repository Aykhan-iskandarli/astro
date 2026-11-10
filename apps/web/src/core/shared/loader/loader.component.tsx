import {useLoaderStyles} from './loader.style';
import useLocalization from 'assets/lang';

const LoaderComponent = () => {
    const translate = useLocalization();
    const {loader, orbit, planet} = useLoaderStyles();

    return (
        <div className={loader} role='status' aria-live='polite'>
            <div className={orbit} aria-hidden='true'>
                <span className={planet}/>
            </div>
            <span className='sr-only'>{translate('loading_chart')}</span>
        </div>
    );
};

export default LoaderComponent;
