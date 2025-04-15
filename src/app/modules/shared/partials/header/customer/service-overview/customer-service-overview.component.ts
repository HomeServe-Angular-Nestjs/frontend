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
      title: 'Home Cleaning',
      description: 'Professional cleaning services for your home',
      image: 'https://img.icons8.com/color/96/cleaning-a-surface.png',
    },
    {
      title: 'Plumbing',
      description: 'Expert plumbing repair and installation',
      image: 'https://img.icons8.com/color/96/plunger.png',
    },
    {
      title: 'Electrical',
      description: 'Professional electrical services',
      image: 'https://img.icons8.com/color/96/electrical.png',
    },
    {
      title: 'Painting',
      description: 'Quality painting services for your home',
      image: 'https://img.icons8.com/color/96/paint-brush.png',
    },
  ];
}
