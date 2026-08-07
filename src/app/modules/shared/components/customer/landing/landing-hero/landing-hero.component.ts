import { ChangeDetectionStrategy, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CountUpDirective } from '../../../../../../core/directives/count-up.directive';
import { ILandingStatistics } from '../../../../../../core/models/landing.model';

@Component({
    selector: 'app-landing-hero',
    standalone: true,
    imports: [CommonModule, RouterLink, CountUpDirective],
    templateUrl: './landing-hero.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LandingHeroComponent implements OnInit, OnDestroy {
    @Input() statistics: ILandingStatistics | null = null;

    currentSlide = 0;
    private intervalId: any;

    images = [
        { url: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1600&q=80', alt: 'Cozy living room' },
        { url: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=1600&q=80', alt: 'Warm clean kitchen' },
        { url: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=1600&q=80', alt: 'Home maintenance' },
    ];

    ngOnInit(): void {
        this.startCarousel();
    }

    ngOnDestroy(): void {
        clearInterval(this.intervalId);
    }

    startCarousel(): void {
        this.intervalId = setInterval(() => {
            this.currentSlide = (this.currentSlide + 1) % this.images.length;
        }, 5000);
    }

    selectSlide(index: number): void {
        this.currentSlide = index;
        clearInterval(this.intervalId);
        this.startCarousel();
    }

    scrollToSearch(event: Event): void {
        event.preventDefault();
        const el = document.getElementById('search');
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}