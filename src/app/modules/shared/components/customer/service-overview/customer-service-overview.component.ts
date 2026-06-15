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
      image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=1200&q=85',
      icon: 'fa-broom',
      title: 'Professional Cleaning',
      description: 'Experience a spotless home with our comprehensive cleaning services tailored to your needs.',
      price: 'Starting from $49'
    },
    {
      image: 'https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?auto=format&fit=crop&w=1200&q=85',
      icon: 'fa-wrench',
      title: 'Plumbing Solutions',
      description: 'Reliable plumbing repairs, installations, and emergency services by certified experts.',
      price: 'Starting from $75'
    },
    {
      image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=1200&q=85',
      icon: 'fa-bolt',
      title: 'Electrical Services',
      description: 'Safe and professional electrical wiring, lighting installation, and diagnostics.',
      price: 'Starting from $89'
    },
    {
      image: 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?auto=format&fit=crop&w=1200&q=85',
      icon: 'fa-paint-roller',
      title: 'Painting & Decor',
      description: 'Transform your space with premium interior and exterior painting by skilled craftsmen.',
      price: 'Starting from $199'
    }
  ];
}
