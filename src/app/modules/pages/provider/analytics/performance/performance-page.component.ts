import { CommonModule } from "@angular/common";
import { Component, inject, OnInit } from "@angular/core";
import { ProviderPerformanceSummaryComponent } from "../../../../shared/components/provider/performance-analytics/summary/performance-summary.component";
import { SharedDataService } from "../../../../../core/services/public/shared-data.service";
import { AnalyticService } from "../../../../../core/services/analytics.service";
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

@Component({
    selector: 'app-performance-page',
    templateUrl: './performance-page.component.html',
    imports: [CommonModule,
    ProviderPerformanceSummaryComponent,
    ProviderPerformanceBookingChartComponent,
    ProviderPerformanceRatingChartComponent,
    ProviderPerformanceComparisonChartComponent,
    ProviderPerformanceResponseTimeChartComponent,
    ProviderPerformanceOnTimeArrivalChartComponent, ProviderPerformanceDisputesChartComponent],
    providers: [AnalyticService, provideEchartsCore({ echarts })],

})
export class ProviderPerformanceLayoutComponent implements OnInit {
    private readonly _sharedService = inject(SharedDataService);
    private readonly _analyticsService = inject(AnalyticService)

    ngOnInit(): void {
        this._sharedService.setProviderHeader('Analytics');
        this._analyticsService.getPerformanceSummary().subscribe();
    }
}