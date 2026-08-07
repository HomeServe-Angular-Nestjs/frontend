import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WHY_CHOOSE_FEATURES } from '../../../../../../core/utils/landing.identity';
import { ScrollRevealDirective } from '../../../../../../core/directives/scroll-reveal.directive';

@Component({
    selector: 'app-landing-why-choose',
    standalone: true,
    imports: [CommonModule, ScrollRevealDirective],
    templateUrl: './landing-why-choose.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LandingWhyChooseComponent {
    readonly features = WHY_CHOOSE_FEATURES;
}