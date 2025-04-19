import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-customer-testimonial-section',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './customer-testimonial-section.component.html',
})
export class CustomerTestimonialSectionComponent {
  testimonials = [
    {
      name: "Sarah Johnson",
      avatar: "assets/images/testimonials/female-1.jpg",
      text: "Excellent service! The cleaning team was professional and thorough. Would definitely recommend!",
      rating: 5,
      service: "Cleaning Service"
    },
    {
      name: "Mike Thompson",
      avatar: "assets/images/testimonials/male-1.jpg",
      text: "Quick response time and very professional plumbing service. Fixed my issue in no time!",
      rating: 5,
      service: "Plumbing Service"
    },
    {
      name: "Emily Davis",
      avatar: "assets/images/testimonials/female-2.jpg",
      text: "The painters did an amazing job! Very detail-oriented and clean work. My house looks brand new!",
      rating: 4,
      service: "Painting Service"
    }
  ];
}
