import { Component, inject, OnInit, signal } from "@angular/core";
import { CustomerProviderProfileOverviewComponent } from "../../../shared/components/customer/provider-details/profile-overview/customer-provider-profile-overview.component";
import { CustomerProviderProfileNavigationComponent } from "../../../shared/components/customer/provider-details/profile-nav/customer-provider-profile-nav.component";
import { ActivatedRoute, Router, RouterOutlet } from "@angular/router";
import { ProviderService } from "../../../../core/services/provider.service";
import { filter, map, switchMap, tap } from "rxjs";

@Component({
    selector: 'customer-provider-profile-layout',
    templateUrl: 'customer-provider-profile-layout.component.html',
    imports: [
        CustomerProviderProfileOverviewComponent,
        CustomerProviderProfileNavigationComponent,
        RouterOutlet,
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