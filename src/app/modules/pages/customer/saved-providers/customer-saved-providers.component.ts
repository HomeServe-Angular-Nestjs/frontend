import { Component, computed, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { catchError, combineLatest, debounceTime, of, switchMap } from 'rxjs';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { Store } from '@ngrx/store';
import { selectSavedProviders } from '../../../../store/customer/customer.selector';
import { ProviderService } from '../../../../core/services/provider.service';
import { ToastNotificationService } from '../../../../core/services/public/toastr.service';
import { IProviderCardWithPagination } from '../../../../core/models/user.model';
import { IPagination } from '../../../../core/models/booking.model';
import { IResponse } from '../../../shared/models/response.model';
import { CustomerProviderViewCardComponent } from '../../../shared/components/customer/provider-view-card/customer-provider-view-card.component';
import { CustomerPaginationComponent } from '../../../shared/partials/sections/customer/pagination/pagination.component';

@Component({
  selector: 'app-customer-saved-providers',
  imports: [CommonModule, FormsModule, RouterLink, CustomerProviderViewCardComponent, CustomerPaginationComponent],
  templateUrl: './customer-saved-providers.component.html',
  styles: [`
    .float-heart { animation: floatHeart 3s ease-in-out infinite; }
    .float-heart-delay { animation: floatHeart 3.6s ease-in-out infinite 0.5s; }
    @keyframes floatHeart { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-7px); } }
  `],
})
export class CustomerSavedProvidersComponent {
  private readonly _store = inject(Store);
  private readonly _providerService = inject(ProviderService);
  private readonly _toastr = inject(ToastNotificationService);

  readonly page = signal(1);
  readonly limit = 10;

  readonly search = signal('');
  readonly sort = signal<'all' | 'best-rated' | 'nearest'>('all');

  private _savedKey = '';

  readonly savedIds = toSignal(
    this._store.select(selectSavedProviders),
    { initialValue: [] }
  );

  readonly providersResponse = toSignal(
    combineLatest([
      toObservable(this.savedIds),
      toObservable(this.search).pipe(debounceTime(400)),
      toObservable(this.sort),
      toObservable(this.page),
    ]).pipe(
      switchMap(([ids, search, sort, page]) => {
        if (!ids || ids.length === 0) {
          return of(this._buildResponse(page));
        }

        return this._providerService.getProviders({
          providerIds: ids,
          search: search?.trim() || '',
          status: sort,
          page,
          limit: this.limit,
          lat: null,
          lng: null,
        }).pipe(
          catchError(() => {
            this._toastr.error('Failed to fetch saved providers. Please try again.');
            return of(this._buildResponse(page));
          })
        );
      })
    ),
    { initialValue: null }
  );

  readonly providers = computed(() =>
    this.providersResponse()?.data?.providerCards ?? []
  );

  readonly isLoading = computed(() => this.providersResponse() === null);

  readonly hasSaved = computed(() => (this.savedIds()?.length ?? 0) > 0);

  readonly hasSearch = computed(() => (this.search()?.trim()?.length ?? 0) > 0);

  readonly pagination = signal<IPagination>({
    total: 0,
    page: 1,
    limit: this.limit,
  });

  constructor() {
    effect(() => {
      const pagination = this.providersResponse()?.data?.pagination;
      if (pagination) {
        this.pagination.set(pagination);
      }
    });

    effect(() => {
      const ids = this.savedIds();
      const key = (ids ?? []).join(',');
      if (key !== this._savedKey) {
        this._savedKey = key;
        this.page.set(1);
      }
    });
  }

  onSearch(value: string) {
    this.search.set(value ?? '');
    this.page.set(1);
  }

  onSortChange(value: string) {
    this.sort.set((value as 'all' | 'best-rated' | 'nearest') ?? 'all');
    this.page.set(1);
  }

  clearFilters() {
    this.search.set('');
    this.sort.set('all');
    this.page.set(1);
  }

  changePage(newPage: number) {
    this.page.set(newPage);
  }

  private _buildResponse(page: number): IResponse<IProviderCardWithPagination> {
    return {
      success: true,
      message: '',
      data: {
        providerCards: [],
        pagination: { total: 0, page, limit: this.limit },
      },
    };
  }
}
