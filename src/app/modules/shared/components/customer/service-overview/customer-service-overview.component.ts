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
      title: 'Professional Cleaning',
      description: 'Thorough home cleaning with eco-friendly products'
    },
    {
      image: 'assets/images/hero_image1.jpg',
      title: 'Plumbing Solutions',
      description: '24/7 emergency plumbing repairs and installations'
    },
    {
      image: 'assets/images/hero_image1.jpg',
      title: 'Electrical Services',
      description: 'Certified electricians for all your wiring needs'
    },
    {
      image: 'assets/images/hero_image1.jpg',
      title: 'Painting Services',
      description: 'Interior and exterior painting with premium materials'
    }
  ];
}
