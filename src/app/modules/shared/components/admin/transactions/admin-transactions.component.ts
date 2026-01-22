import { Component, computed, inject, OnDestroy, OnInit, signal } from "@angular/core";
import { SharedDataService } from "../../../../../core/services/public/shared-data.service";
import { IAdminOverViewCard, OverviewCardComponent } from "../../../partials/sections/admin/overview-card/admin-overview-card.component";
import { combineLatest, map, Subject, switchMap, takeUntil } from "rxjs";
import { ITransactionFilter, ITransactionStats } from "../../../../../core/models/transaction.model";
import { CommonModule } from "@angular/common";
import { AdminPaginationComponent } from "../../../partials/sections/admin/pagination/pagination.component";
import { WalletService } from "../../../../../core/services/wallet.service";
import { DebounceService } from "../../../../../core/services/public/debounce.service";
import { FormsModule } from "@angular/forms";
import { toObservable, toSignal } from "@angular/core/rxjs-interop";
import { PaymentDirection, TransactionType } from "../../../../../core/enums/enums";
import { ToastNotificationService } from "../../../../../core/services/public/toastr.service";

@Component({
  selector: 'app-admin-transactions',
  templateUrl: './admin-transactions.component.html',
  styleUrl: './admin-transactions.component.css',
  imports: [
    CommonModule,
    FormsModule,
    OverviewCardComponent,
    AdminPaginationComponent
  ],
  providers: [WalletService, DebounceService]
})
export class AdminTransactionsComponent implements OnInit, OnDestroy {
  private readonly _walletService = inject(WalletService);
  private readonly _sharedService = inject(SharedDataService);
  private readonly _debounceService = inject(DebounceService);
  private readonly _toastr = inject(ToastNotificationService);

  private readonly _destroy$ = new Subject<void>();

  filters = signal<ITransactionFilter & { page: number; limit: number }>({
    search: '',
    sort: 'newest',
    type: 'all',
    date: 'all',
    method: 'all',
    page: 1,
    limit: 8,
  });

  adminTable = toSignal(
    combineLatest([
      toObservable(this.filters),
    ]).pipe(
      switchMap(([filters]) =>
        this._walletService.getTransactionListForAdmin(filters)
      )
    ),
    { initialValue: null }
  );

  transactions = computed(() =>
    this.adminTable()?.data?.transactions ?? []
  );

  pagination = computed(() =>
    this.adminTable()?.data?.pagination ?? {
      page: 1,
      limit: 8,
      total: 0,
    }
  );

  adminOverview = toSignal(
    this._walletService.getTransactionStats().pipe(
      map(res => res?.data ?? {
        balance: 0,
        grossPayments: 0,
        providerPayouts: 0,
        platformCommission: 0,
        gstCollected: 0,
        refundIssued: 0,
        netProfit: 0,
      })
    ),
    { initialValue: null }
  );

  stats = computed<IAdminOverViewCard[]>(() => {
    const stats = this.adminOverview();

    if (!stats) return [];

    return this._buildOverviewCards(stats);
  });

  ngOnInit(): void {
    this._sharedService.setAdminHeader('Revenues & Transactions');

    this._debounceService.onSearch(700)
      .pipe(takeUntil(this._destroy$))
      .subscribe(value => {
        this.filters.update(f => ({ ...f, search: value }));
      });
  }

  private _buildOverviewCards(data: ITransactionStats): IAdminOverViewCard[] {
    return [
      {
        icon: 'fa-solid fa-wallet',
        iconBg: 'bg-blue-50 text-blue-600',
        title: 'Available Balance',
        value: this.formatINR(data.balance),
      },
      {
        icon: 'fa-solid fa-credit-card',
        iconBg: 'bg-slate-50 text-slate-600',
        title: 'Gross Payments',
        value: this.formatINR(data.grossPayments),
      },
      {
        icon: 'fa-solid fa-arrow-up-right-dots',
        iconBg: 'bg-emerald-50 text-emerald-600',
        title: 'Provider Payouts',
        value: this.formatINR(data.providerPayouts),
      },
      {
        icon: 'fa-solid fa-chart-line',
        iconBg: 'bg-indigo-50 text-indigo-600',
        title: 'Platform Commission',
        value: this.formatINR(data.platformCommission),
      },
      {
        icon: 'fa-solid fa-receipt',
        iconBg: 'bg-purple-50 text-purple-600',
        title: 'GST Collected',
        value: this.formatINR(data.gstCollected),
      },
      {
        icon: 'fa-solid fa-arrow-rotate-left',
        iconBg: 'bg-rose-50 text-rose-600',
        title: 'Refund Issued',
        value: this.formatINR(data.refundIssued),
      },
      {
        icon: 'fa-solid fa-sack-dollar',
        iconBg: 'bg-green-50 text-green-700',
        title: 'Net Profit',
        value: this.formatINR(data.netProfit),
      },
    ];
  }

  onSearch(text: string) {
    this._debounceService.delay(text);
  }

  onDateChange(value: 'all' | 'last_six_months' | 'last_year') {
    this.filters.update(f => ({ ...f, date: value }));
  }

  onSort(value: 'newest' | 'oldest' | 'high' | 'low') {
    this.filters.update(f => ({ ...f, sort: value }));
  }

  onTypeChange(value: string) {
    this.filters.update(f => ({ ...f, type: value }));
  }

  onMethodChange(value: PaymentDirection | 'all') {
    this.filters.update(f => ({ ...f, method: value }));
  }

  pageChange(page: number) {
    this.filters.update(f => ({ ...f, page }));
  }

  copyToClipboard(value: string) {
    navigator.clipboard.writeText(value).then(() => {
      this._toastr.success('Copied to clipboard');
    });
  }

  formatINR(amount: number): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
    }).format(amount);
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
      case TransactionType.CANCELLATION_FEE:
        return 'Cancellation Fee';
      case TransactionType.GST:
        return 'GST';
      case TransactionType.PROVIDER_COMMISSION:
        return 'Provider Commission';
      case TransactionType.CUSTOMER_COMMISSION:
        return 'Customer Commission';
      default:
        return '-';
    }
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }
}
