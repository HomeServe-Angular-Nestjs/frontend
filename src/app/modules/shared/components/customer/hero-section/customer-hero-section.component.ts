import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-customer-hero-section',
  standalone: true,
  templateUrl: './customer-hero-section.component.html',
  imports: [CommonModule, RouterLink]
})
export class CustomerHeroSectionComponent {
  currentSlide = 0;
  intervalId: any;

  images = [
    { url: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1600&q=80', alt: 'Cozy living room' },
    { url: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=1600&q=80', alt: 'Warm clean kitchen' },
    { url: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=1600&q=80', alt: 'Home maintenance' }
  ];

  ngOnInit() {
    this.startCarousel();
  }

  ngOnDestroy() {
    clearInterval(this.intervalId);
  }

  startCarousel() {
    this.intervalId = setInterval(() => {
      this.currentSlide = (this.currentSlide + 1) % this.images.length;
    }, 5000);
  }

  selectSlide(index: number) {
    this.currentSlide = index;
    clearInterval(this.intervalId);
    this.startCarousel();
  }
}
