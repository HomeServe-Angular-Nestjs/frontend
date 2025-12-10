import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CustomerHeroSectionComponent } from '../../../shared/components/customer/hero-section/customer-hero-section.component';
import { CustomerServiceOverviewComponent } from '../../../shared/components/customer/service-overview/customer-service-overview.component';
import { authActions } from '../../../../store/auth/auth.actions';
import { CustomerRoleSelectionComponent } from "../../../shared/components/customer/customer-role-selection/customer-role-selection.component";

@Component({
  selector: 'app-customer-landing-page',
  standalone: true,
  imports: [CommonModule, CustomerHeroSectionComponent, CustomerServiceOverviewComponent, CustomerRoleSelectionComponent],
  templateUrl: './customer-landing-page.component.html',
})
export class CustomerLandingPageComponent {
}
