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
    { url: 'assets/images/hero_image1.jpg', alt: 'Home construction' },
    { url: 'assets/images/hero_image2.jpg', alt: 'Cleaning service' },
    { url: 'assets/images/hero_image3.jpg', alt: 'Electrical work' }
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
