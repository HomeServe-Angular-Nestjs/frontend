import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HOW_IT_WORKS_STEPS } from '../../../../../../core/utils/landing.identity';
import { ScrollRevealDirective } from '../../../../../../core/directives/scroll-reveal.directive';

@Component({
    selector: 'app-landing-how-it-works',
    standalone: true,
    imports: [CommonModule, ScrollRevealDirective],
    templateUrl: './landing-how-it-works.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LandingHowItWorksComponent {
    readonly steps = HOW_IT_WORKS_STEPS;
}