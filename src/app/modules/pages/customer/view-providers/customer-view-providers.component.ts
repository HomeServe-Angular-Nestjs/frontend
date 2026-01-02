import { Component, inject, OnDestroy, OnInit, signal, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { map, Observable, Subject, takeUntil } from 'rxjs';
import { decode as base64Decode } from 'js-base64';
import { IFilterFetchProviders, IHomeSearch, IProviderCardView } from '../../../../core/models/user.model';
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
export class CustomerViewProvidersComponent implements OnInit, OnDestroy {
  private readonly _providerService = inject(ProviderService);
  private readonly _toastr = inject(ToastNotificationService);
  private readonly _route = inject(ActivatedRoute);

  private _destroy$ = new Subject<void>();

  providers$!: Observable<IProviderCardView[]>;

  homeSearch: IHomeSearch = {
    title: null,
    lat: null,
    lng: null,
  };

  filters = signal<IFilterFetchProviders>({
    search: '',
    page: 1,
    sort: 'all',
    availability: null,
  });

  pagination: IPagination = {
    total: 0,
    page: 1,
    limit: 0,
  };

  @ViewChild(ProviderViewCardFilterComponent)
  filterComponent!: ProviderViewCardFilterComponent

  ngOnInit(): void {
    this._route.queryParams.subscribe(params => {
      const ls = params['ls'];
      let parsedParam: IHomeSearch | undefined;

      try {
        if (ls) parsedParam = JSON.parse(base64Decode(ls));
      } catch (err) {
        this._toastr.error('Oops something went wrong.');
        console.error('Invalid location search param:', err);
      }

      this.homeSearch = parsedParam || this.homeSearch;

      this.filters.set({
        ...this.filters(),
        lat: this.homeSearch.lat,
        lng: this.homeSearch.lng,
        title: this.homeSearch.title,
      });

      this._fetchProviders(this.filters());
    });
  }

  private _fetchProviders(filter: IFilterFetchProviders = {}) {
    this.providers$ = this._providerService.getProviders(filter).pipe(
      takeUntil(this._destroy$),
      map(res => {
        this.pagination = res.data?.pagination ?? this.pagination;
        return res.data?.providerCards ?? []
      })
    );
  }

  applyFilters(newFilter: IFilterFetchProviders) {
    this.filters.set({ ...this.filters(), ...newFilter, page: 1 });
    this.pagination.page = 1;
    this._fetchProviders(this.filters());
  }

  resetFilters() {
    this.filters.set({ search: '', isCertified: false, status: 'all', page: 1, });
    this.pagination.page = 1;
    this.filterComponent?.reset();
    this._fetchProviders(this.filters());
  }

  changePage(page: number) {
    this.filters.set({ ...this.filters(), page });
    this.pagination.page = page;
    this._fetchProviders(this.filters());
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }
}
