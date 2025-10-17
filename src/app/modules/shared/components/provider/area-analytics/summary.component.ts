import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject } from 'rxjs';
import { AnalyticService } from '../../../../../core/services/analytics.service';

interface IAreaKpi {
    label: string;
    value: number | string;
    icon: string;
    iconColor: string;
    badge?: string;
    badgeColor?: string;
    description: string;
    isNegative?: boolean;
}

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
            {{ card.value }}
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

    areaKpis: IAreaKpi[] = [
        {
            label: 'Revenue',
            value: '₹1.2M',
            icon: 'fa-solid fa-money-bill-wave',
            iconColor: 'bg-green-500',
            badge: 'Growth',
            badgeColor: 'bg-green-100 text-green-700',
            description: 'Revenue from top area',
        },
        {
            label: 'Top Performing Area',
            value: 'Ernakulam',
            icon: 'fa-solid fa-location-dot',
            iconColor: 'bg-green-400',
            description: 'Area generating highest revenue this month'
        },
        {
            label: 'Underperforming Area',
            value: 'Thrissur',
            icon: 'fa-solid fa-location-crosshairs',
            iconColor: 'bg-red-400',
            badge: 'Decline',
            badgeColor: 'bg-red-100 text-red-700',
            description: 'Revenue dropped compared to last month',
            isNegative: true
        },
        {
            label: 'Revenue Drop',
            value: '↓ 12%',
            icon: 'fa-solid fa-arrow-down',
            iconColor: 'bg-red-500',
            badge: 'MoM',
            badgeColor: 'bg-red-100 text-red-700',
            description: 'Percentage decrease in underperforming area',
            isNegative: true
        }
    ];

    ngOnInit(): void {
        // Optional: fetch real data
        // this._analyticService.getAreaKpis().pipe(takeUntil(this._destroy$)).subscribe(res => this.areaKpis = res);
    }

    ngOnDestroy(): void {
        this._destroy$.next();
        this._destroy$.complete();
    }
}
