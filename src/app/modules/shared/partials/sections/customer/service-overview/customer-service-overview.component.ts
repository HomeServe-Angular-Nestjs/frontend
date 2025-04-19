import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-customer-service-overview',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './customer-service-overview.component.html',
  styleUrl: './customer-service-overview.component.scss',
})
export class CustomerServiceOverviewComponent {
  services = [
    {
      image: 'assets/images/cleaning-service.jpg',
      title: 'Professional Cleaning',
      description: 'Thorough home cleaning with eco-friendly products'
    },
    {
      image: 'assets/images/plumbing-service.jpg',
      title: 'Plumbing Solutions',
      description: '24/7 emergency plumbing repairs and installations'
    },
    {
      image: 'assets/images/electrician-service.jpg',
      title: 'Electrical Services',
      description: 'Certified electricians for all your wiring needs'
    },
    {
      image: 'assets/images/painting-service.jpg',
      title: 'Painting Services',
      description: 'Interior and exterior painting with premium materials'
    }
  ];
}
