import { Component, computed, effect, inject, signal, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { catchError, of, switchMap } from 'rxjs';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { decode as base64Decode } from 'js-base64';
import { IFilterFetchProviders } from '../../../../core/models/user.model';
import { CustomerProviderViewCardComponent } from "../../../shared/components/customer/provider-view-card/customer-provider-view-card.component";
import { ProviderViewCardFilterComponent } from "../../../shared/partials/sections/customer/provider-view-card-filter/provider-view-card-filter.component";
import { ProviderService } from '../../../../core/services/provider.service';
import { CategoryService } from '../../../../core/services/category.service';
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
  private readonly _categoryService = inject(CategoryService);
  private readonly _toastr = inject(ToastNotificationService);
  private readonly _route = inject(ActivatedRoute);
  private readonly _router = inject(Router);

  @ViewChild(ProviderViewCardFilterComponent)
  filterComponent!: ProviderViewCardFilterComponent;

  private _resolvedCategorySlug = '';

  filters = signal<IFilterFetchProviders>({
    search: '',
    address: '',
    page: 1,
    limit: 10,
    status: 'all',
    availability: 'all',
    date: '',
    categoryId: '',
    lat: null,
    lng: null,
  });

  pagination = signal<IPagination>({
    total: 1,
    page: 1,
    limit: 10,
  });

  private providersResponse = toSignal(
    toObservable(this.filters).pipe(
      switchMap(filters =>
        this._providerService.getProviders(filters).pipe(
          catchError((error) => {
            console.error('[Search, Header] failed to get providers:', error);
            this._toastr.error('Failed to fetch providers. Please try again.');
            return of({
              success: false,
              message: '',
              data: {
                providerCards: [],
                pagination: { total: 0, page: 1, limit: 10 },
              },
            });
          })
        )
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

      const current = this.filters();
      const nextFilters: Partial<IFilterFetchProviders> = {};

      const categoryId = params.get('categoryId');
      nextFilters.categoryId = categoryId || '';

      const address = params.get('address');
      nextFilters.address = address || '';

      // Decode base64 ls param from homepage full search
      const ls = params.get('ls');
      if (ls) {
        try {
          const decoded = JSON.parse(base64Decode(ls));
          nextFilters.categoryId = decoded.categoryId || '';
          nextFilters.lat = decoded.lat != null ? Number(decoded.lat) : null;
          nextFilters.lng = decoded.lng != null ? Number(decoded.lng) : null;
        } catch {
          console.warn('Failed to decode ls param');
        }
      }

      // Resolve category slug from popular services quick-links to a real id
      const category = params.get('category');
      if (category && category !== this._resolvedCategorySlug) {
        this._resolvedCategorySlug = category;
        this._categoryService.searchCategories(category).subscribe(res => {
          const match = res.data?.[0];
          if (match) {
            this.applyFilters({ categoryId: match.categoryId });
          }
        });
      } else if (!category) {
        this._resolvedCategorySlug = '';
      }

      // Support direct query params (override any inferred values)
      const search = params.get('search');
      if (search) nextFilters.search = search;
      const lat = params.get('lat');
      const lng = params.get('lng');
      if (lat) nextFilters.lat = Number(lat);
      if (lng) nextFilters.lng = Number(lng);

      if (!ls && !lat && !lng) {
        nextFilters.lat = null;
        nextFilters.lng = null;
      }

      const merged = {
        ...current,
        ...nextFilters,
        page: 1
      };

      if (JSON.stringify(current) !== JSON.stringify(merged)) {
        this.filters.set(merged);
      }
    });
  }

  applyFilters(newFilter: Partial<IFilterFetchProviders>) {
    this.filters.update(current => ({
      ...current,
      ...newFilter,
      page: 1,
    }));
  }

  resetFilters() {
    this._router.navigate(['/view_providers']);
    this.filterComponent?.reset();
  }

  changePage(page: number) {
    this.filters.set({
      ...this.filters(),
      page,
    });
  }
}
