import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { BehaviorSubject, forkJoin, Subject, Subscription, takeUntil } from 'rxjs';
import { IProvider } from '../../../../../../core/models/user.model';
import { IOfferedService } from '../../../../../../core/models/offeredService.model';
import { ProviderService } from '../../../../../../core/services/provider.service';
import { OfferedServicesService } from '../../../../../../core/services/service-management.service';
import { DebounceService } from '../../../../../../core/services/public/debounce.service';
import { IFilter, IPriceRange, IServiceDurationRange, ServiceDurationKey, SortOption } from '../../../../../../core/models/filter.model';
import { ToastNotificationService } from '../../../../../../core/services/public/toastr.service';
import { selectAllUnReadNotifications } from '../../../../../../store/notification/notification.selector';

@Component({
  selector: 'app-customer-provider-profile-services',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './customer-provider-profile-services.component.html',
  providers: [DebounceService]
})
export class CustomerProviderProfileServicesComponent implements OnInit {
  private _providerService = inject(ProviderService);
  private _serviceOfferedService = inject(OfferedServicesService);
  private _debounceService = inject(DebounceService)
  private _toastr = inject(ToastNotificationService);
  private _router = inject(Router);
  private _route = inject(ActivatedRoute);

  private _providerDataSub!: Subscription;
  private _filters$ = new BehaviorSubject<IFilter>({});
  private _destroy$ = new Subject<void>();

  providerId!: string;
  providerData!: IProvider | null;
  serviceData: IOfferedService[] = [];
  serviceCategories: string[] = [];

  serviceDurations: Record<ServiceDurationKey, IServiceDurationRange> = {
    "Quick Service": { minHours: 1, maxHours: 2 },
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
    });

    this._providerDataSub = this._providerService.providerData$.subscribe(data => {
      this.providerData = data;
    });

    if (this.providerData && this.providerData.servicesOffered.length > 0) {
      this.loadAllServices(this.providerData.servicesOffered);
    }

    this._debounceService.onSearch(700)
      .pipe(takeUntil(this._destroy$))
      .subscribe(() => {
        this._emitFilters()
      });

    this._filters$
      .pipe(takeUntil(this._destroy$))
      .subscribe((data) => {
        this._serviceOfferedService.fetchFilteredServices(this.providerId, data)
          .subscribe((data) => {
            this.serviceData = data;
          });
      })
  }

  private _emitFilters() {
    const filter: IFilter = {
      search: this.searchTerm,
      sort: this.sortOption,
      priceRange: {
        min: this.priceRange.min ?? 0,
        max: this.priceRange.max ?? undefined
      },
      category: this.selectedServiceCategory,
      duration: this.selectedDuration
    };
    this._filters$.next(filter);
  }

  loadAllServices(serviceIds: string[]) {
    const observables = serviceIds.map(id =>
      this._serviceOfferedService.fetchOneService(id)
    );

    forkJoin(observables).subscribe({
      next: (service) => {
        this.serviceData = service;
        service.forEach(s => this.serviceCategories.push(s.title));
      },
      error: (err) => this._toastr.error(err)
    });
  }

  bookService(selectedServiceId: string, ids: string[]) {
    if (ids.length < 0 || !selectedServiceId) return;
    this._router.navigate(['pick_a_service', this.providerId], {
      queryParams: { ids: ids.join(','), selectedServiceId }
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


  ngOnDestroy(): void {
    if (this._providerDataSub) {
      this._providerDataSub.unsubscribe();
    }
    this._destroy$.next();
    this._destroy$.complete();
  }
}
