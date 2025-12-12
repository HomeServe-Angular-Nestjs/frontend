import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { WalletService } from '../../../../core/services/wallet.service';
import { ITransactionFilter } from '../../../../core/models/transaction.model';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { combineLatest, Subject, switchMap, takeUntil } from 'rxjs';
import { DebounceService } from '../../../../core/services/public/debounce.service';
import { SharedDataService } from '../../../../core/services/public/shared-data.service';
import { ProviderPaginationComponent } from "../../../shared/partials/sections/provider/pagination/provider-pagination.component";
import { FormsModule } from "@angular/forms";
import { PaymentDirection, TransactionType } from '../../../../core/enums/enums';

@Component({
  selector: 'app-provider-wallet',
  templateUrl: './wallet.component.html',
  imports: [CommonModule, ProviderPaginationComponent, FormsModule],
  providers: [WalletService, DebounceService]
})
export class ProviderWalletComponent implements OnInit, OnDestroy {
  private readonly _walletService = inject(WalletService);
  private readonly _debounceService = inject(DebounceService);
  private readonly _sharedService = inject(SharedDataService);

  private _destroy$ = new Subject<void>();

  filter = signal<ITransactionFilter>({
    search: '',
    sort: 'newest',
    type: 'all',
    date: 'all',
    method: 'all'
  });

  options = signal({
    page: 1,
    limit: 10
  });

  dataSignal = toSignal(
    combineLatest([
      toObservable(this.options),
      toObservable(this.filter)
    ]).pipe(
      switchMap(([options, filter]) => this._walletService.getTransactionListForProvider(options, filter))
    ),
    { initialValue: null }
  );

  transactions = computed(() => this.dataSignal()?.data?.transactions ?? []);
  pagination = computed(() => {
    const pag = this.dataSignal()?.data?.pagination;
    return pag ?? { page: 1, limit: 1, total: 0 }
  });

  ngOnInit(): void {
    this._sharedService.setProviderHeader('Wallet Overview');

    this._debounceService.onSearch(700)
      .pipe(takeUntil(this._destroy$))
      .subscribe(value => {
        this.filter.update(f => ({ ...f, search: value }));
        this.options.update(o => ({ ...o, page: 1 }));
      });
  }

  onSearch(term: string) {
    this._debounceService.delay(term);
  }

  onDateChange(value: 'all' | 'last_six_months' | 'last_year') {
    this.options.update(o => ({ ...o, page: 1 }));
    this.filter.update(f => ({ ...f, date: value }));
  }

  onSort(value: 'newest' | 'oldest' | 'high' | 'low') {
    this.options.update(o => ({ ...o, page: 1 }));
    this.filter.update(f => ({ ...f, sort: value }));
  }

  onTypeChange(value: TransactionType | 'all') {
    this.options.update(o => ({ ...o, page: 1 }));

    this.filter.update(f => ({ ...f, type: value }));
  }

  onMethodChange(value: PaymentDirection | 'all') {
    this.options.update(o => ({ ...o, page: 1 }));

    this.filter.update(f => ({ ...f, method: value }));
  }

  onPageChange(newPage: number) {
    this.options.update(o => ({ ...o, page: newPage }));
  }

  displayType(type: TransactionType) {
    switch (type) {
      case TransactionType.BOOKING_PAYMENT:
        return 'Booking Payment';
      case TransactionType.BOOKING_REFUND:
        return 'Booking Refund';
      case TransactionType.SUBSCRIPTION_PAYMENT:
        return 'Subscription Payment';
      case TransactionType.BOOKING_RELEASE:
        return 'Booking Release';
      default:
        return '_';
    }
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }
}
