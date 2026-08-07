import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ILandingTestimonial } from '../../../../../../core/models/landing.model';
import { getColorFromChar } from '../../../../../../core/utils/style.utils';
import { ScrollRevealDirective } from '../../../../../../core/directives/scroll-reveal.directive';

@Component({
    selector: 'app-landing-testimonials',
    standalone: true,
    imports: [CommonModule, ScrollRevealDirective],
    templateUrl: './landing-testimonials.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LandingTestimonialsComponent {
    @Input() testimonials: ILandingTestimonial[] = [];

    readonly Math = Math;
    currentIndex = 0;
    private touchStartX = 0;

    get maxIndex(): number {
        return Math.max(this.testimonials.length - 1, 0);
    }

    avatarColor(name: string): string {
        return getColorFromChar((name || '?').charAt(0));
    }

    visibleItems(): ILandingTestimonial[] {
        if (this.testimonials.length <= 3) return this.testimonials;
        return [
            this.testimonials[this.currentIndex],
            this.testimonials[(this.currentIndex + 1) % this.testimonials.length],
            this.testimonials[(this.currentIndex + 2) % this.testimonials.length],
        ];
    }

    prev(): void {
        this.currentIndex = (this.currentIndex - 1 + this.testimonials.length) % this.testimonials.length;
    }

    next(): void {
        this.currentIndex = (this.currentIndex + 1) % this.testimonials.length;
    }

    onTouchStart(event: TouchEvent): void {
        this.touchStartX = event.touches[0].clientX;
    }

    onTouchEnd(event: TouchEvent): void {
        const deltaX = event.changedTouches[0].clientX - this.touchStartX;
        if (Math.abs(deltaX) > 48) {
            if (deltaX < 0) this.next();
            else this.prev();
        }
    }
}