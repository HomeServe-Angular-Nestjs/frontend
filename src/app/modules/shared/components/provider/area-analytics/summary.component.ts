import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';
import { AnalyticService } from '../../../../../core/services/analytics.service';
import { IAreaSummary, IOverviewCard } from '../../../../../core/models/analytics.model';

@Component({
  selector: 'app-area-analytics-summary',
  standalone: true,
  imports: [CommonModule],
  providers: [AnalyticService],
  template: `
    <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
      <div
        *ngFor="let card of areaKpis"
        class="group bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border border-emerald-100"
      >
        <div class="flex items-start justify-between mb-4">
          <div
            class="bg-gradient-to-br p-2 px-3 rounded-xl shadow-md flex items-center justify-center"
            [ngClass]="card.iconColor"
          >
            <i class="{{ card.icon }} text-white text-lg"></i>
          </div>

          <span
            *ngIf="card.badge"
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
            class="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-green-500 to-lime-400"
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
            <path d="M10 18a8 8 0 100-16 8 8 0 000 16z" />
          </svg>
          {{ card.description }}
        </p>
      </div>
    </div>
  `
})
export class AreaKpiComponent implements OnInit, OnDestroy {
  private _analyticService = inject(AnalyticService);
  private _destroy$ = new Subject<void>();

  areaSummary = {
    totalBookings: 0,
    topPerformingArea: 'N/A',
    underperformingArea: 'N/A',
    peakBookingHour: 'N/A'
  }

  areaKpis: IOverviewCard<IAreaSummary>[] = [
    {
      label: 'Total Bookings',
      valueKey: 'totalBookings',
      icon: 'fa-solid fa-calendar-check',
      iconColor: 'from-emerald-400 to-emerald-600', // gradient like template
      badge: 'Completed',
      badgeColor: 'bg-emerald-100 text-emerald-700',
      description: 'Total number of completed bookings this month',
    },
    {
      label: 'Top Performing Area',
      valueKey: 'topPerformingArea',
      icon: 'fa-solid fa-trophy',
      iconColor: 'from-yellow-400 to-yellow-600', // gradient
      description: 'Area generating highest revenue this month',
    },
    {
      label: 'Underperforming Area',
      valueKey: 'underperformingArea',
      icon: 'fa-solid fa-arrow-trend-down',
      iconColor: 'from-red-400 to-red-600', // gradient
      badge: 'Decline',
      badgeColor: 'bg-red-100 text-red-700',
      description: 'Area with decreased revenue compared to last month',
    },
    {
      label: 'Peak Booking Time',
      valueKey: 'peakBookingHour',
      icon: 'fa-solid fa-clock',
      iconColor: 'from-indigo-400 to-indigo-600', // gradient
      description: 'Time of day with the highest number of bookings',
    }
  ];

  ngOnInit(): void {
    this._analyticService.getAreaKpis()
      .pipe(takeUntil(this._destroy$))
      .subscribe(res => this.areaSummary = res.data ?? this.areaSummary);
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }

  getCardValue(card: IOverviewCard<IAreaSummary>): number | string {
    return this.areaSummary[card.valueKey];
  }
}
