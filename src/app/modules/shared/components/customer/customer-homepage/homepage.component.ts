import { Component } from '@angular/core';
import { CustomerHeaderComponent } from '../../../partials/sections/customer/header/header.component';
import { CustomerExploreSectionComponent } from "../../../partials/sections/customer/explore-section/customer-explore-section.component";
import { CustomerServiceOverviewComponent } from "../../../partials/sections/customer/service-overview/customer-service-overview.component";
import { CustomerTestimonialSectionComponent } from "../../../partials/sections/customer/testimonial-section/customer-testimonial-section.component";
import { CustomerFooterComponent } from "../../../partials/sections/customer/footer/customer-footer.component";

@Component({
  selector: 'app-customer-homepage',
  imports: [CustomerHeaderComponent, CustomerExploreSectionComponent, CustomerServiceOverviewComponent, CustomerTestimonialSectionComponent, CustomerFooterComponent],
  templateUrl: './homepage.component.html',
  styleUrl: './homepage.component.scss'
})
export class CustomerHomepageComponent {

}
