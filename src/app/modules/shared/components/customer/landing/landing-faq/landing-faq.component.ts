import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LANDING_FAQS } from '../../../../../../core/utils/landing.identity';
import { ScrollRevealDirective } from '../../../../../../core/directives/scroll-reveal.directive';

@Component({
    selector: 'app-landing-faq',
    standalone: true,
    imports: [CommonModule, ScrollRevealDirective],
    templateUrl: './landing-faq.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LandingFaqComponent {
    readonly faqs = LANDING_FAQS;
    openIndex = signal<number | null>(0);

    toggle(index: number): void {
        this.openIndex.set(this.openIndex() === index ? null : index);
    }
}