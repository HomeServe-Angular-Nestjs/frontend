import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { BehaviorSubject, Subject, Subscription, takeUntil } from 'rxjs';
import { IProvider } from '../../../../../../core/models/user.model';
import { IProviderService } from '../../../../../../core/models/provider-service.model';
import { ProviderService } from '../../../../../../core/services/provider.service';
import { ServiceManagementService } from '../../../../../../core/services/service-management.service';
import { DebounceService } from '../../../../../../core/services/public/debounce.service';
import { IFilter, IPriceRange, IServiceDurationRange, ServiceDurationKey, SortOption } from '../../../../../../core/models/filter.model';
import { ToastNotificationService } from '../../../../../../core/services/public/toastr.service';
import { CartService } from '../../../../../../core/services/cart.service';

@Component({
  selector: 'app-customer-provider-profile-services',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './customer-provider-profile-services.component.html',
  providers: [DebounceService, CartService]
})
export class CustomerProviderProfileServicesComponent implements OnInit {
  private _providerService = inject(ProviderService);
  private _serviceManagementService = inject(ServiceManagementService);
  private _debounceService = inject(DebounceService)
  private _toastr = inject(ToastNotificationService);
  private _router = inject(Router);
  private _cartService = inject(CartService);
  private _route = inject(ActivatedRoute);

  private _providerDataSub!: Subscription;
  private _filters$ = new BehaviorSubject<IFilter>({});
  private _destroy$ = new Subject<void>();

  providerId!: string;
  providerData!: IProvider | null;
  allServices: IProviderService[] = [];
  serviceData: IProviderService[] = [];
  serviceCategories: string[] = [];

  serviceDurations: Record<ServiceDurationKey, IServiceDurationRange> = {
    "Quick Service": { minHours: 0, maxHours: 2 },
    "Half Day": { minHours: 3, maxHours: 4 },
    "Full Day": { minHours: 5, maxHours: 8 },
    "Multi-day": { minHours: 24, maxHours: undefined }
  };
  durationKeys: ServiceDurationKey[] = ["Quick Service", "Half Day", "Full Day", "Multi-day"];

  searchTerm: string = '';
  sortOption: SortOption = 'price-asc';
  selectedServiceCategory: string = '';
  priceRange: IPriceRange = { min: undefined, max: undefined };
  selectedDuration?: IServiceDurationRange = undefined;
  selectedDurationKey?: ServiceDurationKey;


  ngOnInit(): void {
    this._route.parent?.paramMap.subscribe(params => {
      this.providerId = params.get('id') ?? '';
      if (this.providerId) {
        this.loadProviderServices(this.providerId);
      }
    });

    this._providerDataSub = this._providerService.providerData$.subscribe(data => {
      this.providerData = data;
    });

    this._debounceService.onSearch(700)
      .pipe(takeUntil(this._destroy$))
      .subscribe(() => {
        this._emitFilters()
      });

    this._filters$
      .pipe(takeUntil(this._destroy$))
      .subscribe((filters) => {
        this._applyFilters(filters);
      })
  }

  private _emitFilters() {
    const filter: IFilter = {
      search: this.searchTerm,
      sort: this.sortOption,
      priceRange: {
        min: this.priceRange.min,
        max: this.priceRange.max
      },
      category: this.selectedServiceCategory,
      duration: this.selectedDuration
    };
    this._filters$.next(filter);
  }

  private _applyFilters(filters: IFilter) {
    let filtered = [...this.allServices];

    // Search filter
    if (filters.search) {
      const search = filters.search.toLowerCase();
      filtered = filtered.filter(s =>
        s.category.name.toLowerCase().includes(search) ||
        s.description.toLowerCase().includes(search)
      );
    }

    // Category filter
    if (filters.category) {
      filtered = filtered.filter(s => s.category.name === filters.category);
    }

    // Price filter
    if (filters.priceRange) {
      const { min, max } = filters.priceRange;
      if (min !== undefined) filtered = filtered.filter(s => s.price >= min);
      if (max !== undefined) filtered = filtered.filter(s => s.price <= max);
    }

    // Duration filter
    if (filters.duration) {
      const { minHours, maxHours } = filters.duration;
      const minMins = minHours ? minHours * 60 : 0;
      const maxMins = maxHours ? maxHours * 60 : Infinity;
      filtered = filtered.filter(s =>
        s.estimatedTimeInMinutes >= minMins && (maxHours ? s.estimatedTimeInMinutes <= maxMins : true)
      );
    }

    // Sorting
    if (filters.sort) {
      switch (filters.sort) {
        case 'price-asc':
          filtered.sort((a, b) => a.price - b.price);
          break;
        case 'price-desc':
          filtered.sort((a, b) => b.price - a.price);
          break;
        case 'duration-asc':
          filtered.sort((a, b) => a.estimatedTimeInMinutes - b.estimatedTimeInMinutes);
          break;
        case 'duration-desc':
          filtered.sort((a, b) => b.estimatedTimeInMinutes - a.estimatedTimeInMinutes);
          break;
      }
    }

    this.serviceData = filtered;
  }

  loadProviderServices(providerId: string) {
    this._serviceManagementService.getServicesByProviderId(providerId).subscribe({
      next: (res) => {
        if (res.data) {
          this.allServices = res.data;
          this.serviceData = [...this.allServices];
          this.serviceCategories = [...new Set(this.allServices.map(s => s.category.name))];
          this._emitFilters();
        }
      },
      error: (err) => this._toastr.error(err.message || 'Failed to load services')
    });
  }

  addServiceToCart(selectedServiceId: string) {
    this._cartService.addItemsToCart(selectedServiceId)
      .pipe(takeUntil(this._destroy$))
      .subscribe({
        next: (res) => {
          this._toastr.success(res.message);
        }
      });
  }

  triggerSearch() {
    this._debounceService.delay(this.searchTerm);
  }

  selectDuration(key: ServiceDurationKey) {
    this.selectedDurationKey = key;
    this.selectedDuration = this.serviceDurations[key];
    this._emitFilters();
  }

  selectCategory(value: string) {
    this.selectedServiceCategory = value;
    this._emitFilters();
  }

  selectPriceRange() {
    const { min, max } = this.priceRange;

    if ((min !== undefined && min < 0) || (max !== undefined && max < 0)) {
      this._toastr.error("Price cannot be negative.");
      return;
    }

    if (min !== undefined && max !== undefined && min > max) {
      this._toastr.error("Minimum price should be less than maximum price.");
      return;
    }
    this._emitFilters();
  }

  applySort(value: SortOption) {
    this.sortOption = value;
    this._emitFilters();
  }


  clearFilters() {
    this.searchTerm = '';
    this.selectedServiceCategory = '';
    this.priceRange = { min: undefined, max: undefined };
    this.selectedDuration = undefined;
    this.selectedDurationKey = undefined;
    this.sortOption = 'price-asc';
    this._emitFilters();
  }

  emitFilters() {
    this._emitFilters();
  }

  ngOnDestroy(): void {
    if (this._providerDataSub) {
      this._providerDataSub.unsubscribe();
    }
    this._destroy$.next();
    this._destroy$.complete();
  }
}
