import { Component, inject, OnDestroy, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { IOverviewCard, IProviderRevenueOverview } from "../../../../../core/models/analytics.model";
import { Subject, takeUntil } from "rxjs";
import { AnalyticService } from "../../../../../core/services/analytics.service";

@Component({
    selector: 'app-revenue-overview',
    imports: [CommonModule],
    providers: [AnalyticService],
    template: `
  <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
    <div
      *ngFor="let card of overviewCards"
      class="group bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border border-emerald-100"
    >
      <div class="flex items-start justify-between mb-4">
        <div
          class="bg-gradient-to-br p-3 rounded-xl shadow-md flex items-center justify-center"
          [ngClass]="card.iconColor"
        >
          <i class="{{ card.icon }} text-white text-lg"></i>
        </div>

        <span
          class="text-xs font-semibold px-2.5 py-1 rounded-full"
          [ngClass]="card.badgeColor"
        >
          {{ card.badge }}
        </span>
      </div>

      <h3
        class="text-emerald-700 text-sm font-semibold mb-2 uppercase tracking-wide"
      >
        {{ card.label }}
      </h3>

      <div class="flex items-baseline gap-2 mb-3">
        <span
          class="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-green-500 to-lime-400"
        >
          {{ getCardValue(card) }}
        </span>
        <span
          class="text-3xl font-bold text-emerald-700"
          *ngIf="card.unit"
        >
          {{ card.unit }}
        </span>
      </div>

      <p class="text-xs text-gray-500 flex items-center gap-1">
        <svg
          class="w-4 h-4 text-emerald-500"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            d="M10 18a8 8 0 100-16 8 8 0 000 16z"
          />
        </svg>
        {{ card.description }}
      </p>
    </div>
  </div>
  `,
})
export class RevenueOverviewComponent implements OnInit, OnDestroy {
    private readonly _analyticService = inject(AnalyticService);
    private _destroy$ = new Subject<void>();

    revenueStats: IProviderRevenueOverview = {
        totalRevenue: 0,
        revenueGrowth: 0,
        completedTransactions: 0,
        avgTransactionValue: 0,
    };

    overviewCards: IOverviewCard<IProviderRevenueOverview>[] = [
        {
            label: "Total Revenue",
            valueKey: "totalRevenue",
            icon: "fa-solid fa-money-bill-wave",
            iconColor: "from-emerald-400 to-emerald-600",
            badge: "Monthly",
            badgeColor: "bg-emerald-100 text-emerald-700",
            unit: "₹",
            description: "Total revenue earned this month",
        },
        {
            label: "Revenue Growth",
            valueKey: "revenueGrowth",
            icon: "fa-solid fa-chart-line",
            iconColor: "from-green-400 to-lime-600",
            badge: "YoY",
            badgeColor: "bg-green-100 text-green-700",
            unit: "%",
            description: "Revenue increase compared to last month",
        },
        {
            label: "Completed Transactions",
            valueKey: "completedTransactions",
            icon: "fa-solid fa-check-circle",
            iconColor: "from-lime-400 to-emerald-600",
            badge: "Stable",
            badgeColor: "bg-lime-100 text-lime-700",
            description: "Number of successfully completed transactions",
        },
        {
            label: "Avg Transaction Value",
            valueKey: "avgTransactionValue",
            icon: "fa-solid fa-coins",
            iconColor: "from-teal-400 to-emerald-600",
            badge: "High",
            badgeColor: "bg-teal-100 text-teal-700",
            unit: "₹",
            description: "Average value per transaction",
        },
    ];

    ngOnInit(): void {
        this._analyticService
            .getRevenueOverview()
            .pipe(takeUntil(this._destroy$))
            .subscribe(
                (res) => (this.revenueStats = res.data || this.revenueStats)
            );
    }

    ngOnDestroy(): void {
        this._destroy$.next();
        this._destroy$.complete();
    }

    getCardValue(card: IOverviewCard<IProviderRevenueOverview>): number | string {
        return this.revenueStats[card.valueKey];
    }
}
