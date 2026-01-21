import { Component, computed, effect, inject, signal, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { switchMap } from 'rxjs';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { decode as base64Decode } from 'js-base64';
import { IFilterFetchProviders } from '../../../../core/models/user.model';
import { CustomerProviderViewCardComponent } from "../../../shared/components/customer/provider-view-card/customer-provider-view-card.component";
import { ProviderViewCardFilterComponent } from "../../../shared/partials/sections/customer/provider-view-card-filter/provider-view-card-filter.component";
import { ProviderService } from '../../../../core/services/provider.service';
import { ToastNotificationService } from '../../../../core/services/public/toastr.service';
import { IPagination } from '../../../../core/models/booking.model';
import { CustomerPaginationComponent } from '../../../shared/partials/sections/customer/pagination/pagination.component';

@Component({
  selector: 'app-customer-view-providers',
  imports: [CommonModule, FormsModule, CustomerProviderViewCardComponent, ProviderViewCardFilterComponent, CustomerPaginationComponent],
  templateUrl: './customer-view-providers.component.html',
})
export class CustomerViewProvidersComponent {
  private readonly _providerService = inject(ProviderService);
  private readonly _toastr = inject(ToastNotificationService);
  private readonly _route = inject(ActivatedRoute);

  @ViewChild(ProviderViewCardFilterComponent)
  filterComponent!: ProviderViewCardFilterComponent;

  filters = signal<IFilterFetchProviders>({
    search: '',
    page: 1,
    limit: 10,
    status: 'all',
    availability: 'all',
    categoryId: ''
  });

  pagination = signal<IPagination>({
    total: 1,
    page: 1,
    limit: 10,
  });

  private providersResponse = toSignal(
    toObservable(this.filters).pipe(
      switchMap(filters =>
        this._providerService.getProviders(filters)
      )
    ),
    { initialValue: null }
  );

  providers = computed(() =>
    this.providersResponse()?.data?.providerCards ?? []
  );

  isLoading = computed(() => this.providersResponse() === null);

  constructor() {
    /* Sync pagination from API */
    effect(() => {
      const pagination = this.providersResponse()?.data?.pagination;
      if (pagination) {
        this.pagination.set(pagination);
      }
    });

    /* Sync query params → filters */
    const queryParams = toSignal<ParamMap | null>(
      this._route.queryParamMap,
      { initialValue: null }
    );

    effect(() => {
      const params = queryParams();
      if (!params) return;

      const nextFilters: Partial<IFilterFetchProviders> = {};

      const categoryId = params.get('categoryId');
      if (categoryId?.trim()) {
        nextFilters.categoryId = categoryId;
      }

      const ls = params.get('ls');
      if (ls) {
        try {
          Object.assign(nextFilters, JSON.parse(base64Decode(ls)));
        } catch {
          this._toastr.error('Invalid filter parameters.');
          return;
        }
      }

      if (Object.keys(nextFilters).length === 0) return;

      const current = this.filters();
      const merged = { ...current, ...nextFilters, page: 1 };

      if (JSON.stringify(current) !== JSON.stringify(merged)) {
        this.filters.set(merged);
      }
    });
  }

  applyFilters(newFilter: IFilterFetchProviders) {
    this.filters.set({
      ...this.filters(),
      ...newFilter,
      page: 1,
    });
  }

  resetFilters() {
    this.filters.set({
      search: '',
      status: 'all',
      availability: 'all',
      page: 1,
    });

    this.filterComponent?.reset();
  }

  changePage(page: number) {
    this.filters.set({
      ...this.filters(),
      page,
    });
  }
}
