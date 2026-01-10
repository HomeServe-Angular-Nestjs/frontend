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
      text: "The professional who came for the deep cleaning was absolutely fantastic. No corner was left untouched, and the attention to detail was beyond my expectations!",
      rating: 5,
      service: "Deep Cleaning Service",
      date: "2 days ago",
      location: "San Francisco, CA"
    },
    {
      name: "Mark Thompson",
      avatar: "assets/images/testimonials/male-1.jpg",
      text: "Had a major leak emergency on a Sunday night. Within 45 minutes, a plumber was at my door. Fast, efficient, and very reasonably priced.",
      rating: 5,
      service: "Emergency Plumbing",
      date: "1 week ago",
      location: "Austin, TX"
    },
    {
      name: "Emily Rodriguez",
      avatar: "assets/images/testimonials/female-2.jpg",
      text: "Booking a painter was so easy through HomeServe. The quality of work was top-notch, and they finished the entire living room in just one day!",
      rating: 5,
      service: "Professional Painting",
      date: "3 days ago",
      location: "Miami, FL"
    }
  ];
}
