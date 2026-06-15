import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CustomerHeroSectionComponent } from '../../../shared/components/customer/hero-section/customer-hero-section.component';
import { CustomerServiceOverviewComponent } from '../../../shared/components/customer/service-overview/customer-service-overview.component';
import { CustomerHowItWorksComponent } from '../../../shared/components/customer/how-it-works/customer-how-it-works.component';

@Component({
  selector: 'app-customer-landing-page',
  standalone: true,
  imports: [CommonModule, CustomerHeroSectionComponent, CustomerHowItWorksComponent, CustomerServiceOverviewComponent],
  templateUrl: './customer-landing-page.component.html',
})
export class CustomerLandingPageComponent {
}
