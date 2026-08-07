import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { PROVIDER_BENEFITS } from '../../../../../../core/utils/landing.identity';
import { ScrollRevealDirective } from '../../../../../../core/directives/scroll-reveal.directive';

@Component({
    selector: 'app-landing-provider-cta',
    standalone: true,
    imports: [CommonModule, RouterLink, ScrollRevealDirective],
    templateUrl: './landing-provider-cta.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LandingProviderCtaComponent {
    readonly benefits = PROVIDER_BENEFITS;
}