import { CommonModule } from "@angular/common";
import { Component, inject, OnInit } from "@angular/core";
import { ProviderPerformanceSummaryComponent } from "../../../../shared/components/provider/performance-analytics/summary/performance-summary.component";
import { SharedDataService } from "../../../../../core/services/public/shared-data.service";
import { ProviderPerformanceBookingChartComponent } from "../../../../shared/components/provider/performance-analytics/booking-chart/booking-chart.component";
import * as echarts from 'echarts/core';
import { BarChart, HeatmapChart, LineChart, PieChart } from "echarts/charts";
import { provideEchartsCore } from 'ngx-echarts';
import { CanvasRenderer } from "echarts/renderers";
import { GridComponent, LegendComponent, TitleComponent, ToolboxComponent, TooltipComponent, VisualMapComponent } from 'echarts/components';
import { ProviderPerformanceRatingChartComponent } from "../../../../shared/components/provider/performance-analytics/customer-ratings/customer-ratings.component";
import { ProviderPerformanceResponseTimeChartComponent } from "../../../../shared/components/provider/performance-analytics/reliability-chart/response-time-chart.component";
import { ProviderPerformanceComparisonChartComponent } from "../../../../shared/components/provider/performance-analytics/comparison-chart/comparison-chart.component";
import { ProviderPerformanceOnTimeArrivalChartComponent } from "../../../../shared/components/provider/performance-analytics/reliability-chart/on-time-arrival-chart.component";
import { ProviderPerformanceDisputesChartComponent } from "../../../../shared/components/provider/performance-analytics/reliability-chart/disputes-chart.component";
import { ProviderPerformanceComparisonOverviewComponent } from "../../../../shared/components/provider/performance-analytics/comparison-chart/comparison-overview.component";
import { AnalyticService } from "../../../../../core/services/analytics.service";
import { IPerformanceAnalyticsBundle } from "../../../../../core/models/analytics.model";
import { catchError, map, of, shareReplay, startWith } from "rxjs";



echarts.use([
    TooltipComponent,
    TitleComponent,
    GridComponent,
    LegendComponent,
    ToolboxComponent,
    VisualMapComponent,
    BarChart,
    LineChart,
    PieChart,
    HeatmapChart,
    CanvasRenderer
]);

const EMPTY_PERFORMANCE: IPerformanceAnalyticsBundle = {
    summary: { performanceAnalytics: { avgResponseTime: 0, onTimePercent: 0, avgRating: 0, completionRate: 0 } },
    bookings: { bookingOverview: [], trends: { distributions: [], reviews: [] } },
    quality: { responseTimeDistribution: [], onTimeArrival: [], monthlyDisputeStats: [] },
    comparison: {
        comparisonOverview: {
            growthRate: 0,
            monthlyTrend: { previousMonth: 0, currentMonth: 0, previousRevenue: 0, currentRevenue: 0, growthPercentage: 0 },
            providerRank: 0
        },
        comparisonStats: []
    },
};

type PerformanceVM = { status: 'loading' | 'error' | 'success'; data: IPerformanceAnalyticsBundle };
@Component({
    selector: 'app-performance-page',
    templateUrl: './performance-page.component.html',
    imports: [CommonModule,
        ProviderPerformanceSummaryComponent,
        ProviderPerformanceBookingChartComponent,
        ProviderPerformanceRatingChartComponent,
        ProviderPerformanceComparisonChartComponent,
        ProviderPerformanceResponseTimeChartComponent,
        ProviderPerformanceOnTimeArrivalChartComponent,
        ProviderPerformanceDisputesChartComponent,
        ProviderPerformanceComparisonOverviewComponent
    ],
    providers: [provideEchartsCore({ echarts })],

})
export class ProviderPerformanceLayoutComponent implements OnInit {
    private readonly _sharedService = inject(SharedDataService);
    private readonly _analyticService = inject(AnalyticService);

    vm$ = this._load();

    private _load() {
        return this._analyticService.getPerformanceBundle().pipe(
            map(res => ({ status: 'success' as const, data: res?.data ?? EMPTY_PERFORMANCE })),
            catchError(() => of({ status: 'error' as const, data: EMPTY_PERFORMANCE })),
            startWith({ status: 'loading' as const, data: EMPTY_PERFORMANCE }),
            shareReplay(1)
        );
    }

    retry(): void {
        this.vm$ = this._load();
    }

    hasData(vm: PerformanceVM): boolean {
        return vm.data.bookings.bookingOverview.length > 0
            || vm.data.bookings.trends.distributions.length > 0
            || vm.data.bookings.trends.reviews.length > 0
            || vm.data.quality.responseTimeDistribution.length > 0
            || vm.data.comparison.comparisonStats.length > 0;
    }

    ngOnInit(): void {
        this._sharedService.setProviderHeader('Performance Analytics');
    }
}
