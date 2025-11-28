import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-customer-hero-section',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './customer-hero-section.component.html',
})
export class CustomerHeroSectionComponent {
  currentSlide = 0;
  intervalId: any;

  images = [
    {
      url: 'asset/images/hero_image1.jpg',
      alt: 'Home construction'
    },
    {
      url: 'https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6',
      alt: 'Home cleaning'
    },
    {
      url: 'https://images.unsplash.com/photo-1600121848594-d8644e57abab',
      alt: 'Home electrical'
    }
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
}
