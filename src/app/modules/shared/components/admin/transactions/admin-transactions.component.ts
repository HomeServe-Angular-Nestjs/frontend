import { Component, inject, OnDestroy, OnInit } from "@angular/core";
import { SharedDataService } from "../../../../../core/services/public/shared-data.service";
import { IAdminOverViewCard, OverviewCardComponent } from "../../../partials/sections/admin/overview-card/admin-overview-card.component";
import { TransactionService } from "../../../../../core/services/transaction.service";
import { combineLatest, map, Subject, takeUntil } from "rxjs";
import { ITransactionFilter, ITransactionStats, ITransactionTableData } from "../../../../../core/models/transaction.model";
import { CommonModule } from "@angular/common";
import { IPagination } from "../../../../../core/models/booking.model";
import { AdminPaginationComponent } from "../../../partials/sections/admin/pagination/pagination.component";
import { WalletService } from "../../../../../core/services/wallet.service";
import { DebounceService } from "../../../../../core/services/public/debounce.service";
import { FormsModule } from "@angular/forms";

@Component({
  selector: 'app-admin-transactions',
  templateUrl: './admin-transactions.component.html',
  imports: [CommonModule, FormsModule, OverviewCardComponent, AdminPaginationComponent],
  providers: [WalletService, DebounceService]
})
export class AdminTransactionsComponent implements OnInit, OnDestroy {
  private readonly _transactionService = inject(TransactionService);
  private readonly _sharedService = inject(SharedDataService);
  private readonly _walletService = inject(WalletService);
  private readonly _debounceService = inject(DebounceService);

  private _destroy$ = new Subject<void>();

  stats: IAdminOverViewCard[] = [];
  transactions: ITransactionTableData[] = [];
  walletBalance: number = 0;
  options: { page?: number, limit?: number } = { page: 1, limit: 10 };
  pagination: IPagination = {
    limit: 1,
    page: 1,
    total: 0
  }
  filters: ITransactionFilter = {
    search: '',
    sort: 'newest',
    type: 'all',
    date: 'all',
    method: 'all'
  };

  ngOnInit(): void {
    this._sharedService.setAdminHeader('Revenues & Transactions');

    this._debounceService.onSearch()
      .pipe(takeUntil(this._destroy$))
      .subscribe(value => {
        this.filters.search = value;
        this.options = { page: 1, limit: 10 };
        this._loadTableData(this.options, this.filters);
      });

    this._loadTableData(this.options, this.filters);

    combineLatest([
      this._loadOverviewData(),
      this._fetchWalletAmount()
    ]).pipe(takeUntil(this._destroy$))
      .subscribe({
        next: ([stats, balance]) => {
          if (stats && balance) {
            this.stats = this._buildOverviewCards(stats, balance);
          }
        }
      });
  }

  private _loadTableData(options?: { page?: number, limit?: number }, filters: ITransactionFilter = {}) {
    this._transactionService.getTransactionTableData(options, filters)
      .pipe(takeUntil(this._destroy$))
      .subscribe({
        next: (res) => {
          if (res.success && res.data) {
            this.transactions = res.data.tableData;
            this.pagination = res.data.pagination;
          }
        }
      });
  }

  private _loadOverviewData() {
    return this._transactionService.getTransactionStats()
      .pipe(
        takeUntil(this._destroy$),
        map((res) => res.data)
      );
  }

  private _fetchWalletAmount() {
    return this._walletService.getWallet()
      .pipe(
        takeUntil(this._destroy$),
        map(res => res?.data?.balance ?? 0)
      );
  }

  private _buildOverviewCards(data: ITransactionStats, balance: number): IAdminOverViewCard[] {
    return [
      {
        icon: 'fas fa-receipt',
        iconBg: 'bg-blue-100 text-blue-700',
        title: 'Available Balance',
        value: this.formatINR(balance ?? 0),
      },
      {
        icon: 'fas fa-receipt',
        iconBg: 'bg-blue-100 text-blue-700',
        title: 'Total Transactions',
        value: data.totalTransactions ?? 0,
      },
      {
        icon: 'fas fa-rupee-sign',
        iconBg: 'bg-green-100 text-green-700',
        title: 'Total Revenue',
        value: this.formatINR((data.totalRevenue ?? 0) / 100),
      },
      {
        icon: 'fas fa-percentage',
        iconBg: 'bg-red-100 text-red-600',
        title: 'Success Rate',
        value: `${(data?.successRate ?? 0).toFixed(1)}%`,
      },
      {
        icon: 'fas fa-balance-scale',
        iconBg: 'bg-purple-100 text-purple-700',
        title: 'Average Transaction Value',
        value: (data.avgTransactionValue ?? 0 / 100).toFixed(2),
      },
    ];
  }

  formatINR(amount: number): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2
    }).format(amount);
  }

  pageChange(page: number) {
    this.options.page = page;
    this._loadTableData(this.options, this.filters);
  }

  updateFilter(key: keyof ITransactionFilter, value: any) {
    this.filters[key] = value;
    this.options = { page: 1, limit: 10 };
    this._loadTableData(this.options, this.filters);
  }

  onSearch(text: string) {
    this._debounceService.delay(text);
  }

  ngOnDestroy() {
    this._destroy$.next();
    this._destroy$.complete();
  }
}
