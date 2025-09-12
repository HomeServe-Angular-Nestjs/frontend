import { CommonModule } from '@angular/common';
import { Component, inject, Input, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { map, Observable, Subject, takeUntil } from 'rxjs';
import { authActions } from '../../../../../../store/auth/auth.actions';
import { selectCheckStatus } from '../../../../../../store/auth/auth.selector';
import { StatusType } from '../../../../../../core/models/auth.model';
import { selectCustomer } from '../../../../../../store/customer/customer.selector';
import { getColorFromChar } from '../../../../../../core/utils/style.utils';
import { customerActions } from '../../../../../../store/customer/customer.actions';
import { DebounceService } from '../../../../../../core/services/public/debounce.service';
import { CustomerService } from '../../../../../../core/services/customer.service';
import { ICustomerSearchServices } from '../../../../../../core/models/offeredService.model';
import { selectTotalUnReadNotificationCount } from '../../../../../../store/notification/notification.selector';

@Component({
  selector: 'app-customer-header',
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './header.component.html',
  providers: [DebounceService]
})
export class CustomerHeaderComponent implements OnInit {
  private readonly _store = inject(Store);
  private readonly _debounceService = inject(DebounceService);
  private readonly _customerService = inject(CustomerService);
  private readonly _router = inject(Router);

  private readonly _destroy$ = new Subject<void>();

  @Input() isFixed: boolean = true;

  // User observables
  userStatus$!: Observable<StatusType>;
  email$!: Observable<string>;
  username$!: Observable<string>;
  fullname$!: Observable<string | null>;
  avatar$!: Observable<string | null>;
  fallbackChar$!: Observable<string>;
  fallbackColor$!: Observable<string>;
  unReadNotificationCount$ = this._store.select(selectTotalUnReadNotificationCount);

  // Provider Search
  providerSearch = '';
  fetchedProviders: any[] = [];
  isLoadingProviders = false;

  // Service Search
  serviceSearch = '';
  fetchedServices: any[] = [];
  isLoadingServices = false;

  ngOnInit(): void {
    this.userStatus$ = this._store.select(selectCheckStatus);
    this._store.dispatch(customerActions.fetchOneCustomer());

    const customer$ = this._store.select(selectCustomer);

    this.avatar$ = customer$.pipe(takeUntil(this._destroy$), map(c => c?.avatar ?? null));
    this.email$ = customer$.pipe(takeUntil(this._destroy$), map(c => c?.email ?? ''));
    this.username$ = customer$.pipe(takeUntil(this._destroy$), map(c => c?.username ?? ''));
    this.fullname$ = customer$.pipe(takeUntil(this._destroy$), map(c => c?.fullname ?? ''));
    this.fallbackChar$ = customer$.pipe(takeUntil(this._destroy$), map(c => c?.username?.charAt(0).toUpperCase() ?? ''));
    this.fallbackColor$ = this.fallbackChar$.pipe(takeUntil(this._destroy$), map(char => char ? getColorFromChar(char) : '#4f46e5'));

    this._debounceService.onSearch(700)
      .pipe(takeUntil(this._destroy$))
      .subscribe((search: any) => {
        if (search.type === 'provider') {
          this.fetchProviders(search.search);
        } else if (search.type === 'service') {
          this.fetchServices(search.search);
        }
      });
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }

  private fetchProviders(search: string): void {
    this._customerService.searchProviders(search).subscribe({
      next: (res) => {
        if (res.success && res.data) this.fetchedProviders = res.data;
      },
      complete: () => this.isLoadingProviders = false
    });
  }

  private fetchServices(search: string): void {
    this._customerService.searchService(search).subscribe({
      next: (res) => {
        if (res.success && res.data) this.fetchedServices = res.data;
      },
      complete: () => this.isLoadingServices = false
    });
  }

  searchProviders(): void {
    if (!this.providerSearch.trim()) return;
    this.isLoadingProviders = true;
    this._debounceService.delay({ search: this.providerSearch, type: 'provider' });
  }

  searchServices(): void {
    if (!this.serviceSearch.trim()) return;
    this.isLoadingServices = true;
    this._debounceService.delay({ search: this.serviceSearch, type: 'service' });
  }

  handleProviderClick(provider: any): void {
    this.providerSearch = '';
    this.fetchedProviders = [];
    this.isLoadingProviders = false;
    this._router.navigate(['provider_details', provider.id, 'about']);
  }

  handleServiceClick(data: ICustomerSearchServices): void {
    this.serviceSearch = '';
    this.fetchedServices = [];
    this.isLoadingServices = false;
    this._router.navigate(['pick_a_service', data.provider], {
      queryParams: { ids: data.offeredServiceIds.join(',') }
    });
  }

  logout(): void {
    this._store.dispatch(authActions.logout({ fromInterceptor: false }));
  }

}
