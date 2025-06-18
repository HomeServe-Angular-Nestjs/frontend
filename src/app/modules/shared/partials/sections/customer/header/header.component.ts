import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
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

  private _destroy$ = new Subject<void>();

  userStatus$!: Observable<StatusType>;
  email$!: Observable<string>;
  username$!: Observable<string>;
  fullname$!: Observable<string | null>;
  avatar$!: Observable<string | null>;
  fallbackChar$!: Observable<string>;
  fallbackColor$!: Observable<string>;

  providerSearch = '';
  fetchedProviders: any;
  isLoadingProviders = false;

  ngOnInit(): void {
    this.userStatus$ = this._store.select(selectCheckStatus);
    this._store.dispatch(customerActions.fetchOneCustomer());

    const customer$ = this._store.select(selectCustomer);

    this.avatar$ = customer$.pipe(
      map(customer => customer?.avatar ?? null)
    );

    this.email$ = customer$.pipe(
      map((customer) => {
        if (customer && customer.email) {
          return customer.email
        }
        return ''
      })
    );

    this.username$ = customer$.pipe(
      map((customer) => {
        if (customer && customer.username) {
          return customer.username
        }
        return ''
      })
    );

    this.fullname$ = customer$.pipe(
      map((customer) => {
        if (customer && customer.fullname) {
          return customer.fullname
        }
        return ''
      })
    );

    this.fallbackChar$ = customer$.pipe(
      map(customer => {
        if (customer && customer.username) {
          return customer.username.charAt(0).toUpperCase();
        }
        return '';
      })
    );

    this.fallbackColor$ = this.fallbackChar$.pipe(
      map(char => char ? getColorFromChar(char) : '#4f46e5')
    );

    this._debounceService.onSearch(700)
      .pipe(takeUntil(this._destroy$))
      .subscribe(() => {
        this._customerService.searchProviders(this.providerSearch).subscribe({
          next: (response) => {
            if (response.success) {
              this.fetchedProviders = response.data;
            }
            this.isLoadingProviders = false;
          },
          error: (err) => {
            console.error(err);
            this.isLoadingProviders = false;
          }
        });
      });
  }

  searchProviders() {
    this._debounceService.delay(this.providerSearch);
  }

  handleProviderClick(provider: any) {
    this.isLoadingProviders = true
    this.providerSearch = provider.address || '';
    this.fetchedProviders = [];
    this.onProviderSelected(provider.id); // or provider._id
  }

  onProviderSelected(id: string) {
    console.log('Selected Provider ID:', id);
    // You can now call any service or logic based on the selected provider
  }

  logout(): void {
    this._store.dispatch(authActions.logout({ fromInterceptor: false }));
  }

}
