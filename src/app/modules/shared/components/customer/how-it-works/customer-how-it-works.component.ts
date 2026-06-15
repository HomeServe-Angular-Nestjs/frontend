import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-customer-how-it-works',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './customer-how-it-works.component.html',
})
export class CustomerHowItWorksComponent {
  steps = [
    {
      icon: 'fa-magnifying-glass',
      title: '1. Search Services',
      description: 'Browse through our elite categories to find exactly what your home needs.',
    },
    {
      icon: 'fa-id-badge',
      title: '2. Select Your Provider',
      description: 'Compare background-verified local pros based on real reviews, pricing, and expertise.',
    },
    {
      icon: 'fa-calendar-check',
      title: '3. Schedule & Customize',
      description: 'Pick the specific tasks you need and choose a convenient date and time slot that fits your schedule.',
    },
    {
      icon: 'fa-lock',
      title: '4. Secure Booking & Pay',
      description: 'Confirm your appointment with transparent, upfront pricing and secure checkout. No hidden fees.',
    },
    {
      icon: 'fa-house-circle-check',
      title: '5. Relax & Stay Flexible',
      description: 'Simply wait for your pro to arrive at the scheduled time. Need a change? Easily reschedule anytime later.',
    },
  ];
}
