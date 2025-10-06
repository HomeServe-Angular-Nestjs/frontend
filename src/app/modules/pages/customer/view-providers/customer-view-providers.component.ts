import { Component, inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { map, Observable, Subject, takeUntil } from 'rxjs';
import { decode as base64Decode } from 'js-base64';
import { CustomerBreadcrumbsComponent } from "../../../shared/partials/sections/customer/breadcrumbs/customer-breadcrumbs.component";
import { IHomeSearch, IProviderCardView } from '../../../../core/models/user.model';
import { CustomerProviderViewCardComponent } from "../../../shared/components/customer/provider-view-card/customer-provider-view-card.component";
import { ProviderViewCardFilterComponent } from "../../../shared/partials/sections/customer/provider-view-card-filter/provider-view-card-filter.component";
import { IFilter } from '../../../../core/models/filter.model';
import { ProviderService } from '../../../../core/services/provider.service';
import { ToastNotificationService } from '../../../../core/services/public/toastr.service';

@Component({
  selector: 'app-customer-view-providers',
  imports: [CommonModule, CustomerBreadcrumbsComponent, FormsModule, CustomerProviderViewCardComponent, ProviderViewCardFilterComponent],
  templateUrl: './customer-view-providers.component.html',
})
export class CustomerViewProvidersComponent implements OnInit, OnDestroy {
  private readonly _providerService = inject(ProviderService);
  private readonly _toastr = inject(ToastNotificationService);
  private readonly _route = inject(ActivatedRoute);

  private _destroy$ = new Subject<void>();

  providers$!: Observable<IProviderCardView[]>;

  @ViewChild(ProviderViewCardFilterComponent)
  filterComponent!: ProviderViewCardFilterComponent

  ngOnInit(): void {
    this._route.queryParams.subscribe(params => {
      const ls = params['ls'];
      let parsedParam: IHomeSearch | undefined;

      try {
        if (ls) {
          parsedParam = JSON.parse(base64Decode(ls));
        }
      } catch (err) {
        this._toastr.error('Oops something went wrong.');
        console.error('Invalid ls param:', err);
      }

      this._fetchProviders({}, parsedParam);
    });
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }

  private _fetchProviders(filter?: IFilter, locationSearch?: IHomeSearch) {
    this.providers$ = this._providerService.getProviders(filter, locationSearch).pipe(
      takeUntil(this._destroy$),
      map(res => res.data ?? [])
    );
  }

  applyFilters(filter: IFilter) {
    this._fetchProviders(filter);
  }

  resetFilters() {
    if (this.filterComponent) {
      this.filterComponent.reset();
    }
  }
}
