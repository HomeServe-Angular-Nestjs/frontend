import { CommonModule } from '@angular/common';
import { Component, inject, Input, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Store } from '@ngrx/store';
import { authActions } from '../../../../../../store/auth/auth.actions';
import { map, Observable, Subject, takeUntil } from 'rxjs';
import { selectCheckStatus } from '../../../../../../store/auth/auth.selector';
import { StatusType } from '../../../../../../core/models/auth.model';
import { selectCustomer } from '../../../../../../store/customer/customer.selector';
import { getColorFromChar } from '../../../../../../core/utils/style.utils';
import { customerActions } from '../../../../../../store/customer/customer.actions';
import { FormsModule } from '@angular/forms';
import { DebounceService } from '../../../../../../core/services/public/debounce.service';
import { CustomerService } from '../../../../../../core/services/customer.service';

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

    this.avatar$ = customer$.pipe(map(c => c?.avatar ?? null));
    this.email$ = customer$.pipe(map(c => c?.email ?? ''));
    this.username$ = customer$.pipe(map(c => c?.username ?? ''));
    this.fullname$ = customer$.pipe(map(c => c?.fullname ?? ''));
    this.fallbackChar$ = customer$.pipe(map(c => c?.username?.charAt(0).toUpperCase() ?? ''));
    this.fallbackColor$ = this.fallbackChar$.pipe(map(char => char ? getColorFromChar(char) : '#4f46e5'));

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

  private fetchProviders(search: string): void {
    this.isLoadingProviders = true;
    this._customerService.searchProviders(search).subscribe({
      next: (res) => {
        if (res.success) this.fetchedProviders = res.data;
        this.isLoadingProviders = false;
      },
      error: (err) => {
        console.error(err);
        this.isLoadingProviders = false;
      }
    });
  }

  private fetchServices(search: string): void {
    this.isLoadingServices = true;
    this._customerService.searchService(search).subscribe({
      next: (res) => {
        if (res.success) this.fetchedServices = res.data;
        this.isLoadingServices = false;
      },
      error: (err) => {
        console.error(err);
        this.isLoadingServices = false;
      }
    });
  }

  searchProviders(): void {
    this._debounceService.delay({ search: this.providerSearch, type: 'provider' });
  }

  searchServices(): void {
    this._debounceService.delay({ search: this.serviceSearch, type: 'service' });
  }

  handleProviderClick(provider: any): void {
    this.providerSearch = provider.address || '';
    this.fetchedProviders = [];
    this.onProviderSelected(provider.id);
  }

  onProviderSelected(id: string): void {
    this.isLoadingProviders = false;
    this.providerSearch = '';
    this.fetchedProviders = [];
    this._router.navigate(['provider_details', id, 'about']);
  }

  handleServiceClick(service: any): void {
    this.serviceSearch = '';
    this.fetchedServices = [];
    this.onServiceSelected(service.id);
  }

  onServiceSelected(id: string): void {
    this.isLoadingServices = false;
    this.serviceSearch = '';
    this.fetchedServices = [];
    this._router.navigate(['service_details', id, 'service']);
  }

  logout(): void {
    this._store.dispatch(authActions.logout({ fromInterceptor: false }));
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }

}
