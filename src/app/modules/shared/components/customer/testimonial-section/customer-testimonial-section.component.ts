import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { ILandingTestimonial } from '../../../../../core/models/landing.model';
import { LandingService } from '../../../../../core/services/landing.service';

@Component({
  selector: 'app-customer-testimonial-section',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './customer-testimonial-section.component.html',
})
export class CustomerTestimonialSectionComponent {
  private readonly _landingService = inject(LandingService);

  readonly testimonials = toSignal(
    this._landingService.getLandingData().pipe(
      map(response => (response.data?.testimonials ?? [])
        .filter(testimonial => testimonial.rating === 5)
        .slice(0, 3))
    ),
    { initialValue: [] as ILandingTestimonial[] }
  );

  readonly hasEnoughTestimonials = computed(() => this.testimonials().length >= 3);
}
