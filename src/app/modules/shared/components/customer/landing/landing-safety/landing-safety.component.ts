import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SAFETY_ITEMS } from '../../../../../../core/utils/landing.identity';
import { ScrollRevealDirective } from '../../../../../../core/directives/scroll-reveal.directive';

@Component({
    selector: 'app-landing-safety',
    standalone: true,
    imports: [CommonModule, ScrollRevealDirective],
    templateUrl: './landing-safety.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LandingSafetyComponent {
    readonly items = SAFETY_ITEMS;
}