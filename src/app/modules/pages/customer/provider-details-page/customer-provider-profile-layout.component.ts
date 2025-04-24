import { Component } from "@angular/core";
import { CustomerProviderProfileOverviewComponent } from "../../../shared/components/customer/provider-details/profile-overview/customer-provider-profile-overview.component";
import { CustomerBreadcrumbsComponent } from "../../../shared/partials/sections/customer/breadcrumbs/customer-breadcrumbs.component";
import { CustomerProviderProfileNavigationComponent } from "../../../shared/components/customer/provider-details/profile-nav/customer-provider-profile-nav.component";
import { ActivatedRoute, Router, RouterOutlet } from "@angular/router";
import { CustomerProviderProfileAvailabilityAndMatrixComponent } from "../../../shared/components/customer/provider-details/availability-and-metrix/customer-provider-profile-availability-and-matrix.component";
import { ProviderService } from "../../../../core/services/provider.service";
import { IProvider } from "../../../../core/models/user.model";
import { NotificationService } from "../../../../core/services/public/notification.service";

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
    providerId: string | null = null;

    constructor(
        private route: ActivatedRoute,
        private readonly providerService: ProviderService,
        private readonly notyf: NotificationService
    ) {
        this.route.queryParams.subscribe(params => {
            this.providerId = params['id'];
        });
        if (this.providerId) {
            this.providerService.getOneProvider(this.providerId).subscribe({
                next: (provider) => this.providerService.setProviderData(provider),
                error: (err) => this.notyf.error(err)
            });
        }
    }

}