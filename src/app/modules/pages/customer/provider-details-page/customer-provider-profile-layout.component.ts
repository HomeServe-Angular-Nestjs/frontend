import { Component } from "@angular/core";
import { CustomerProviderProfileOverviewComponent } from "../../../shared/components/customer/provider-details/profile-overview/customer-provider-profile-overview.component";
import { CustomerBreadcrumbsComponent } from "../../../shared/partials/sections/customer/breadcrumbs/customer-breadcrumbs.component";
import { CustomerProviderProfileNavigationComponent } from "../../../shared/components/customer/provider-details/profile-nav/customer-provider-profile-nav.component";
import { RouterOutlet } from "@angular/router";
import { CustomerProviderProfileAvailabilityAndMatrixComponent } from "../../../shared/components/customer/provider-details/availability-and-metrix/customer-provider-profile-availability-and-matrix.component";

@Component({
    selector: 'customer-provider-profile-layout',
    templateUrl: 'customer-provider-profile-layout.component.html',
    imports: [
    CustomerProviderProfileOverviewComponent,
    CustomerBreadcrumbsComponent,
    CustomerProviderProfileNavigationComponent,
    RouterOutlet,
    CustomerProviderProfileAvailabilityAndMatrixComponent
],
    standalone: true
})
export class CustomerProviderProfileLayoutComponent {

}