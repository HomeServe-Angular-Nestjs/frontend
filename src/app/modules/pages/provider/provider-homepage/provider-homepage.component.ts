import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedDataService } from '../../../../core/services/public/shared-data.service';
import { ProviderOverviewCardsComponent } from '../../../shared/partials/sections/provider/overview-cards/overview-cards.component';
import { IProviderDashboardOverview, OverviewCardData } from '../../../../core/models/dashboard.model';
import { ProviderService } from '../../../../core/services/provider.service';
import { Subject, takeUntil } from 'rxjs';
import { provideEchartsCore } from 'ngx-echarts';
import * as echarts from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import { GridComponent, LegendComponent, TooltipComponent } from 'echarts/components';
import { RevenueTrendChartComponent } from '../../../shared/components/provider/revenue-analytics/trends-chart.component';
import { BarChart, LineChart } from 'echarts/charts';
import { ProviderPerformanceBookingChartComponent } from '../../../shared/components/provider/performance-analytics/booking-chart/booking-chart.component';
import { ProviderBookingRecentComponent } from '../../../shared/components/provider/bookings/bookings-recent/booking-recent.component';

echarts.use([
  CanvasRenderer,
  TooltipComponent,
  LegendComponent,
  GridComponent,
  LineChart,
  BarChart
]);

@Component({
  selector: 'app-provider-homepage',
  templateUrl: './provider-homepage.component.html',
  imports: [
    CommonModule,
    ProviderOverviewCardsComponent,
    RevenueTrendChartComponent,
    ProviderPerformanceBookingChartComponent,
    ProviderBookingRecentComponent
  ],
  providers: [provideEchartsCore({ echarts })]
})
export class ProviderHomepageComponent implements OnInit, OnDestroy {
  private readonly _sharedService = inject(SharedDataService);
  private readonly _providerService = inject(ProviderService);

  private _destroy$ = new Subject<void>();

  overviewCards: OverviewCardData[] = [];

  ngOnInit(): void {
    this._sharedService.setProviderHeader('Dashboard');

    this._providerService.getDashboardOverview()
      .pipe(takeUntil(this._destroy$))
      .subscribe({
        next: (res) => {
          this.overviewCards = this._buildOverviewCards(res.data);
        },
        error: (err) => {
          console.error('Error fetching dashboard overview:', err);
        },
      });
  }

  private _buildOverviewCards(data: IProviderDashboardOverview): OverviewCardData[] {
    return [
      {
        heading: 'Earnings Overview',
        boxes: [
          {
            title: 'Total Earnings',
            icon: 'fa-dollar-sign',
            iconColorClass: 'text-green-600',
            value: data.revenue.totalEarnings,
            valueColorClass: 'text-gray-800',
            bgColorClass: 'bg-green-50',
            borderColorClass: 'border-green-100',
          },
          {
            title: 'Pending',
            icon: 'fa-clock',
            iconColorClass: 'text-orange-600',
            value: data.revenue.pendingCount,
            valueColorClass: 'text-orange-600',
            bgColorClass: 'bg-orange-50',
            borderColorClass: 'border-orange-100',
          },
          {
            title: 'Completed',
            icon: 'fa-check',
            iconColorClass: 'text-blue-600',
            value: data.revenue.completedCount,
            valueColorClass: 'text-blue-600',
            bgColorClass: 'bg-blue-50',
            borderColorClass: 'border-blue-100',
          },
        ],
        detailsText: 'View Details',
        detailsLinkOrCallback: '/earnings/details',
      },
      {
        heading: 'Bookings Overview',
        boxes: [
          {
            title: 'Total Bookings',
            icon: 'fa-calendar-alt',
            iconColorClass: 'text-green-700',
            value: data.bookings.totalBookings,
            valueColorClass: 'text-gray-800',
            bgColorClass: 'bg-green-50',
            borderColorClass: 'border-green-100',
          },
          {
            title: 'Upcoming',
            icon: 'fa-hourglass-half',
            iconColorClass: 'text-yellow-500',
            value: data.bookings.upcomingBookings,
            valueColorClass: 'text-yellow-600',
            bgColorClass: 'bg-yellow-50',
            borderColorClass: 'border-yellow-100',
          },
          {
            title: 'Cancelled',
            icon: 'fa-times-circle',
            iconColorClass: 'text-red-600',
            value: data.bookings.cancelledBookings,
            valueColorClass: 'text-red-600',
            bgColorClass: 'bg-red-50',
            borderColorClass: 'border-red-100',
          },
        ],
        detailsText: 'View All',
        detailsLinkOrCallback: '/bookings/details',
      },
      {
        heading: 'Performance Overview',
        boxes: [
          {
            title: 'Average Rating',
            icon: 'fa-star',
            iconColorClass: 'text-yellow-500',
            value: data.avgRating,
            valueColorClass: 'text-yellow-600',
            bgColorClass: 'bg-yellow-50',
            borderColorClass: 'border-yellow-100',
          },
          {
            title: 'Completion Rate',
            icon: 'fa-chart-line',
            iconColorClass: 'text-blue-600',
            value: data.completionRate.toFixed(2) + '%',
            valueColorClass: 'text-blue-600',
            bgColorClass: 'bg-blue-50',
            borderColorClass: 'border-blue-100',
          },
        ],
        detailsText: 'View Details',
        detailsLinkOrCallback: '/reviews',
      },
      {
        heading: 'Availability Overview',
        boxes: [
          {
            title: 'Next Available Slot',
            icon: 'fa-bell',
            iconColorClass: 'text-purple-600',
            value: this._formatNextSlot(data.nextAvailableSlot),
            valueColorClass: 'text-purple-600',
            bgColorClass: 'bg-purple-50',
            borderColorClass: 'border-purple-100',
          },
          {
            title: 'Working Hours',
            icon: 'fa-clock',
            iconColorClass: 'text-green-600',
            value: `${data.availability.time.from} - ${data.availability.time.to}`,
            valueColorClass: 'text-gray-800',
            bgColorClass: 'bg-green-50',
            borderColorClass: 'border-green-100',
          },
          {
            title: 'Active Services',
            icon: 'fa-briefcase',
            iconColorClass: 'text-blue-600',
            value: `${data.activeServiceCount || 0} Active`,
            valueColorClass: 'text-blue-600',
            bgColorClass: 'bg-blue-50',
            borderColorClass: 'border-blue-100',
          },
        ],
        detailsText: 'Manage All',
        detailsLinkOrCallback: '/availability',
      },

    ];
  }

  private _formatNextSlot(slot: { from: string; to: string }): string {
    if (!slot?.from || !slot?.to) return 'No upcoming slot';
    const from = new Date(slot.from);
    const to = new Date(slot.to);

    const isToday = new Date().toDateString() === from.toDateString();
    const dayLabel = isToday
      ? 'Today'
      : from.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

    const fromTime = from.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const toTime = to.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    return `${dayLabel}, ${fromTime} - ${toTime}`;
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }
}
