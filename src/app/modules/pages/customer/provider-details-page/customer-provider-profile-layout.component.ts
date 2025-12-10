import { Component, inject, OnInit, signal } from "@angular/core";
import { CustomerProviderProfileOverviewComponent } from "../../../shared/components/customer/provider-details/profile-overview/customer-provider-profile-overview.component";
import { CustomerBreadcrumbsComponent } from "../../../shared/partials/sections/customer/breadcrumbs/customer-breadcrumbs.component";
import { CustomerProviderProfileNavigationComponent } from "../../../shared/components/customer/provider-details/profile-nav/customer-provider-profile-nav.component";
import { ActivatedRoute, Router, RouterOutlet } from "@angular/router";
import { CustomerProviderProfileAvailabilityAndMatrixComponent } from "../../../shared/components/customer/provider-details/availability-and-metrix/customer-provider-profile-availability-and-matrix.component";
import { ProviderService } from "../../../../core/services/provider.service";
import { filter, map, switchMap, tap } from "rxjs";

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
})
export class CustomerProviderProfileLayoutComponent implements OnInit {
    private readonly _route = inject(ActivatedRoute);
    private readonly _router = inject(Router);
    private readonly _providerService = inject(ProviderService);

    providerId = signal<string | null>(null);

    ngOnInit() {
        this._route.paramMap
            .pipe(
                map(paramMap => paramMap.get('id')),
                filter(id => !!id),
                tap((id) => this.providerId.set(id)),
                switchMap((id) => this._providerService.getOneProvider(id))
            )
            .subscribe({
                next: (provider) => this._providerService.setProviderData(provider),
                error: () => {
                    this._router.navigate(['not_found'], {
                        state: { type: 'data' }
                    });
                }
            });
    }
}   