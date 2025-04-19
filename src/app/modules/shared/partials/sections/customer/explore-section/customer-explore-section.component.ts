import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-customer-explore-section',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './customer-explore-section.component.html',
})
export class CustomerExploreSectionComponent {
  private interval: any;

  currentSlide = 0;

  services = [
    {
      icon: 'fa-broom',
      title: 'Cleaning Services',
      description: 'Professional home cleaning'
    },
    {
      icon: 'fa-wrench',
      title: 'Plumbing',
      description: 'Expert plumbing solutions'
    },
    {
      icon: 'fa-bolt',
      title: 'Electrical',
      description: 'Electrical maintenance'
    },
    {
      icon: 'fa-paint-roller',
      title: 'Painting',
      description: 'Interior & exterior painting'
    }
  ];


  images = [
    { src: 'service1.jpg', alt: 'Home Service 1' },
    { src: 'service2.jpg', alt: 'Home Service 2' },
    { src: 'service3.jpg', alt: 'Home Service 3' }
  ];


  ngOnInit() {
    this.startCarousel();
  }

  startCarousel() {
    this.interval = setInterval(() => {
      this.nextSlide();
    }, 5000); // Change slide every 5 seconds
  }

  nextSlide() {
    this.currentSlide = (this.currentSlide + 1) % this.images.length;
  }

  goToSlide(index: number) {
    this.currentSlide = index;
    // Reset timer when user manually changes slide
    clearInterval(this.interval);
    this.startCarousel();
  }

  ngOnDestroy() {
    clearInterval(this.interval);
  }
}
