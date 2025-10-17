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
    <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
      <div
        *ngFor="let card of areaKpis"
        class="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-200 border"
        [ngClass]="card.isNegative ? 'border-red-200' : 'border-gray-200'"
      >
        <div class="flex items-center justify-between mb-3">
          <div
            class="p-2 rounded-lg flex items-center justify-center"
            [ngClass]="card.iconColor"
          >
            <i class="{{ card.icon }} text-white text-base"></i>
          </div>
          <span
            *ngIf="card.badge"
            class="text-xs font-medium px-2 py-0.5 rounded-full"
            [ngClass]="card.badgeColor"
          >
            {{ card.badge }}
          </span>
        </div>

        <h4 class="text-gray-700 text-sm font-semibold mb-1">
          {{ card.label }}
        </h4>

        <div class="flex items-baseline gap-1 mb-2">
          <span
            class="text-2xl font-semibold"
            [ngClass]="card.isNegative ? 'text-red-500' : 'text-green-600'"
          >
            {{getCardValue(card)}}
          </span>
        </div>

        <p class="text-xs text-gray-500">
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
            iconColor: 'bg-emerald-500',
            badge: 'Completed',
            badgeColor: 'bg-emerald-100 text-emerald-700',
            description: 'Total number of completed bookings this month',
        },
        {
            label: 'Top Performing Area',
            valueKey: 'topPerformingArea',
            icon: 'fa-solid fa-trophy',
            iconColor: 'bg-yellow-500',
            description: 'Area generating highest revenue this month',
        },
        {
            label: 'Underperforming Area',
            valueKey: 'underperformingArea',
            icon: 'fa-solid fa-arrow-trend-down',
            iconColor: 'bg-red-500',
            badge: 'Decline',
            badgeColor: 'bg-red-100 text-red-700',
            description: 'Area with decreased revenue compared to last month',
        },
        {
            label: 'Peak Booking Time',
            valueKey: 'peakBookingHour',
            icon: 'fa-solid fa-clock',
            iconColor: 'bg-indigo-500',
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
