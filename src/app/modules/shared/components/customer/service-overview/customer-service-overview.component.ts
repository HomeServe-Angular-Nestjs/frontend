import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-customer-service-overview',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './customer-service-overview.component.html',
})
export class CustomerServiceOverviewComponent {
  services = [
    {
      image: 'assets/images/hero_image1.jpg',
      icon: 'fa-broom',
      title: 'Professional Cleaning',
      description: 'Experience a spotless home with our comprehensive cleaning services tailored to your needs.',
      price: 'Starting from $49'
    },
    {
      image: 'assets/images/hero_image2.jpg',
      icon: 'fa-wrench',
      title: 'Plumbing Solutions',
      description: 'Reliable plumbing repairs, installations, and emergency services by certified experts.',
      price: 'Starting from $75'
    },
    {
      image: 'assets/images/hero_image3.jpg',
      icon: 'fa-bolt',
      title: 'Electrical Services',
      description: 'Safe and professional electrical wiring, lighting installation, and diagnostics.',
      price: 'Starting from $89'
    },
    {
      image: 'assets/images/hero_image2.jpg',
      icon: 'fa-paint-roller',
      title: 'Painting & Decor',
      description: 'Transform your space with premium interior and exterior painting by skilled craftsmen.',
      price: 'Starting from $199'
    }
  ];
}
