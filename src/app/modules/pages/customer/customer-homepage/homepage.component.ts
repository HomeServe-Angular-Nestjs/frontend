import { Component } from '@angular/core';
import { CustomerExploreSectionComponent } from "../../../shared/components/customer/explore-section/customer-explore-section.component";
import { CustomerServiceOverviewComponent } from "../../../shared/components/customer/service-overview/customer-service-overview.component";
import { CustomerTestimonialSectionComponent } from "../../../shared/components/customer/testimonial-section/customer-testimonial-section.component";

@Component({
  selector: 'app-customer-homepage',
  imports: [CustomerExploreSectionComponent, CustomerServiceOverviewComponent, CustomerTestimonialSectionComponent],
  templateUrl: './homepage.component.html',
})
export class CustomerHomepageComponent {

}
