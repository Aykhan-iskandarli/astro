import {Routes} from 'router/routes';
import {environment} from 'core/configs/app.config';
import SeoComponent from 'core/shared/seo/seo.component';
import HeroComponent from './components/hero/hero.component';
import SolarJourneyComponent from './components/solar-journey/solar-journey.component';
import FeaturesComponent from './components/features/features.component';
import CtaSectionComponent from './components/cta-section/cta-section.component';
import {useHomeStyles} from './home.style';

const JOURNEY_ID = 'journey';

function HomeComponent() {
    const {home} = useHomeStyles();

    return (
        <div className={home}>
            <SeoComponent
                titleKey='seo_home_title'
                descriptionKey='seo_home_description'
                path={Routes.default}
                jsonLd={{
                    '@context': 'https://schema.org',
                    '@type': 'WebSite',
                    name: 'Astra',
                    url: environment.siteUrl,
                }}
            />
            <HeroComponent journeyId={JOURNEY_ID}/>
            <SolarJourneyComponent id={JOURNEY_ID}/>
            <FeaturesComponent/>
            <CtaSectionComponent/>
        </div>
    );
}

export default HomeComponent;
