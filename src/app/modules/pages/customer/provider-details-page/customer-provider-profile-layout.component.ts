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
        private _route: ActivatedRoute,
        private _router: Router,
        private readonly _providerService: ProviderService,
    ) {
        this.providerId = this._route.snapshot.paramMap.get('id');
        if (this.providerId) {
            this._providerService.getOneProvider(this.providerId).subscribe({
                next: (provider) => this._providerService.setProviderData(provider),
                error: () => {
                    this._router.navigate(['not_found'], {
                        state: { type: 'data' }
                    });
                }
            });
        }
    }

}   