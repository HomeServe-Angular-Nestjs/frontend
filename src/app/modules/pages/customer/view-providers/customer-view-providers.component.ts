import { Component, computed, effect, inject, OnDestroy, OnInit, signal, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Params } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subject, switchMap, takeUntil, tap, finalize } from 'rxjs';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { decode as base64Decode } from 'js-base64';
import { IFilterFetchProviders, IHomeSearch } from '../../../../core/models/user.model';
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
  private readonly providerService = inject(ProviderService);
  private readonly toastr = inject(ToastNotificationService);
  private readonly route = inject(ActivatedRoute);

  filters = signal<IFilterFetchProviders>({
    search: '',
    page: 1,
    limit: 10,
    status: 'all',
    availability: 'all',
  });

  pagination = signal<IPagination>({
    total: 1,
    page: 1,
    limit: 10,
  });

  private providersResponse = toSignal(
    toObservable(this.filters).pipe(
      switchMap(filters =>
        this.providerService.getProviders(filters)
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
    const queryParams = toSignal<Params | null>(
      this.route.queryParams,
      { initialValue: null }
    );

    effect(() => {
      const params = queryParams();
      if (!params) return;

      const ls = params['ls'];
      if (!ls) return;

      try {
        const parsed = JSON.parse(base64Decode(ls));
        this.filters.set({
          ...this.filters(),
          ...parsed,
          page: 1,
        });
      } catch {
        this.toastr.error('Oops something went wrong.');
      }
    });
  }

  @ViewChild(ProviderViewCardFilterComponent)
  filterComponent!: ProviderViewCardFilterComponent;

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
