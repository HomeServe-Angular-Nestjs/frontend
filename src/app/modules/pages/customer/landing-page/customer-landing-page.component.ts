import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { map } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
import { LandingService } from '../../../../core/services/landing.service';
import { ILandingData } from '../../../../core/models/landing.model';
import { LandingNavComponent } from '../../../shared/components/customer/landing/landing-nav/landing-nav.component';
import { LandingHeroComponent } from '../../../shared/components/customer/landing/landing-hero/landing-hero.component';
import { LandingSearchComponent } from '../../../shared/components/customer/landing/landing-search/landing-search.component';
import { LandingCategoriesComponent } from '../../../shared/components/customer/landing/landing-categories/landing-categories.component';
import { LandingWhyChooseComponent } from '../../../shared/components/customer/landing/landing-why-choose/landing-why-choose.component';
import { LandingHowItWorksComponent } from '../../../shared/components/customer/landing/landing-how-it-works/landing-how-it-works.component';
import { LandingFeaturedProvidersComponent } from '../../../shared/components/customer/landing/landing-featured-providers/landing-featured-providers.component';
import { LandingTestimonialsComponent } from '../../../shared/components/customer/landing/landing-testimonials/landing-testimonials.component';
import { LandingSafetyComponent } from '../../../shared/components/customer/landing/landing-safety/landing-safety.component';
import { LandingProviderCtaComponent } from '../../../shared/components/customer/landing/landing-provider-cta/landing-provider-cta.component';
import { LandingFaqComponent } from '../../../shared/components/customer/landing/landing-faq/landing-faq.component';
import { LandingFooterComponent } from '../../../shared/components/customer/landing/landing-footer/landing-footer.component';

@Component({
    selector: 'app-customer-landing-page',
    standalone: true,
    imports: [
        CommonModule,
        LandingNavComponent,
        LandingHeroComponent,
        LandingSearchComponent,
        LandingCategoriesComponent,
        LandingWhyChooseComponent,
        LandingHowItWorksComponent,
        LandingFeaturedProvidersComponent,
        LandingTestimonialsComponent,
        LandingSafetyComponent,
        LandingProviderCtaComponent,
        LandingFaqComponent,
        LandingFooterComponent,
    ],
    templateUrl: './customer-landing-page.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CustomerLandingPageComponent {
    private readonly _landingService = inject(LandingService);

    private readonly _data = toSignal(
        this._landingService.getLandingData().pipe(map(res => res.data)),
        { initialValue: null }
    );

    readonly loading = computed(() => this._data() === null);

    readonly data = computed<ILandingData>(() =>
        this._data() ?? {
            statistics: { completedJobs: 0, verifiedProviders: 0, averageRating: 0, totalCategories: 0 },
            categories: [],
            featuredProviders: [],
            testimonials: [],
        }
    );
}