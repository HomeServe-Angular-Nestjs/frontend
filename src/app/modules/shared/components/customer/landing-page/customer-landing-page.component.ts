import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CustomerHeroSectionComponent } from "../../../partials/header/customer/hero-section/customer-hero-section.component";
import { CustomerServiceOverviewComponent } from "../../../partials/header/customer/service-overview/customer-service-overview.component";

@Component({
  selector: 'app-customer-landing-page',
  standalone: true,
  imports: [CommonModule, CustomerHeroSectionComponent, CustomerServiceOverviewComponent],
  templateUrl: './customer-landing-page.component.html',
  // styleUrls: ['./customer-landing-page.component.css'],
})
export class CustomerLandingPageComponent {}
