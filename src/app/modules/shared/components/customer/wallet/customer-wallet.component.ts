import { Component, computed, inject, OnDestroy, OnInit, signal } from "@angular/core";
import { WalletService } from "../../../../../core/services/wallet.service";
import { IWallet } from "../../../../../core/models/wallet.model";
import { combineLatest, filter, map, Subject, switchMap, takeUntil } from "rxjs";
import { CommonModule } from "@angular/common";
import { ITransactionFilter, ITransactionTableData } from "../../../../../core/models/transaction.model";
import { toObservable, toSignal } from "@angular/core/rxjs-interop";
import { CustomerPaginationComponent } from "../../../partials/sections/customer/pagination/pagination.component";
import { FormsModule } from "@angular/forms";
import { DebounceService } from "../../../../../core/services/public/debounce.service";

@Component({
  selector: 'app-customer-wallet',
  templateUrl: 'customer-wallet.component.html',
  providers: [WalletService, DebounceService],
  imports: [CommonModule, CustomerPaginationComponent, FormsModule]
})
export class CustomerWalletComponent implements OnInit, OnDestroy {
  private readonly _walletService = inject(WalletService);
  private readonly _debounceService = inject(DebounceService);
  private _destroy$ = new Subject<void>();

  walletSignal = toSignal(this._fetchWallet(), { initialValue: null });
  wallet = computed(() => this.walletSignal()?.balance ?? 0);

  options = signal({ page: 1, limit: 5 });
  filters = signal<ITransactionFilter>({
    search: '',
    sort: 'newest',
    type: 'all',
    date: 'all',
    method: 'all'
  });

  tnxSignal = toSignal(
    combineLatest([
      toObservable(this.options),
      toObservable(this.filters)])
      .pipe(
        switchMap(([options, filter]) => this._fetchTransactions(options, filter))
      ),
    { initialValue: null }
  );

  transactions = computed(() => {
    return this.tnxSignal()?.transactions ?? []
  });

  pagination = computed(() => {
    const pag = this.tnxSignal()?.pagination;
    return pag ?? { page: 1, limit: 10, total: 0 };
  });

  ngOnInit(): void {
    this._debounceService.onSearch()
      .pipe(takeUntil(this._destroy$))
      .subscribe(value => {
        this.filters.update((filters) => ({ ...filters, search: value }));
        this.options.update((options) => ({ ...options, page: 1 }));
      });
  }

  private _fetchWallet() {
    return this._walletService.getWallet()
      .pipe(
        filter(res => !!res.success && !!res.data),
        map((res) => res.data as IWallet)
      );
  }

  private _fetchTransactions(options: { page: number, limit: number }, filters: ITransactionFilter = {}) {
    return this._walletService.getTransaction(options, filters)
      .pipe(
        filter(res => !!res.success && !!res.data),
        map((res) => res.data)
      );
  }

  onPageChange(page: number) {
    this.options.update((options) => ({ ...options, page }));
  }

  onSearch(text: string) {
    this._debounceService.delay(text);
  }

  updateFilter(key: keyof ITransactionFilter, value: any) {
    this.filters.update((filters) => ({ ...filters, [key]: value }));
    this.options.update((options) => ({ ...options, page: 1 }));
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }
}