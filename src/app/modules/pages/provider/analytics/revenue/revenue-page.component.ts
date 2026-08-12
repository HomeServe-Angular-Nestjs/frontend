import { CommonModule } from "@angular/common";
import { Component, inject, OnInit } from "@angular/core";
import { RevenueOverviewComponent } from "../../../../shared/components/provider/revenue-analytics/overview.component";
import { RevenueTrendChartComponent } from "../../../../shared/components/provider/revenue-analytics/trends-chart.component";
import * as echarts from 'echarts/core';
import { GridComponent, LegendComponent, TitleComponent, ToolboxComponent, TooltipComponent, VisualMapComponent } from 'echarts/components';
import { BarChart, HeatmapChart, LineChart, PieChart } from "echarts/charts";
import { provideEchartsCore } from "ngx-echarts";
import { CanvasRenderer } from "echarts/renderers";
import { RevenueCompositionChartsComponent } from "../../../../shared/components/provider/revenue-analytics/composition.component";
import { RevenueTopServicesChartComponent } from "../../../../shared/components/provider/revenue-analytics/top-services-chart.component";
import { RevenueRepeatVsNewCustomersChartComponent } from "../../../../shared/components/provider/revenue-analytics/repeat-vs-new-customers-chart.component";
import { RevenueEarningsForecastChartComponent } from "../../../../shared/components/provider/revenue-analytics/monthly-growth-rate-chart.component";
import { SharedDataService } from "../../../../../core/services/public/shared-data.service";
import { AnalyticService } from "../../../../../core/services/analytics.service";
import { IRevenueAnalyticsBundle, RevenueChartView } from "../../../../../core/models/analytics.model";
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

const EMPTY_REVENUE: IRevenueAnalyticsBundle = {
    summary: { revenueOverview: { totalRevenue: 0, revenueGrowth: 0, completedTransactions: 0, avgTransactionValue: 0 } },
    trends: { trend: { labels: [], providerRevenue: [], platformAvg: [] } },
    growth: { monthlyGrowth: [], composition: [], topServices: [] },
    clients: { newAndReturning: [] },
};

type RevenueVM = { status: 'loading' | 'error' | 'success'; data: IRevenueAnalyticsBundle };

@Component({
    selector: 'app-revenue-analytics-page',
    templateUrl: './revenue-page.component.html',
    imports: [
        CommonModule,
        RevenueOverviewComponent,
        RevenueTrendChartComponent,
        RevenueCompositionChartsComponent,
        RevenueTopServicesChartComponent,
        RevenueRepeatVsNewCustomersChartComponent,
        RevenueEarningsForecastChartComponent
    ],
    providers: [provideEchartsCore({ echarts })]
})
export class ProviderRevenueAnalyticsComponent implements OnInit {
    private readonly _sharedService = inject(SharedDataService);
    private readonly _analyticService = inject(AnalyticService);

    vm$ = this._load('monthly');

    private _load(view: RevenueChartView) {
        return this._analyticService.getRevenueBundle(view).pipe(
            map(res => ({ status: 'success' as const, data: res?.data ?? EMPTY_REVENUE })),
            catchError(() => of({ status: 'error' as const, data: EMPTY_REVENUE })),
            startWith({ status: 'loading' as const, data: EMPTY_REVENUE }),
            shareReplay(1)
        );
    }

    retry(): void {
        this.vm$ = this._load(this._currentView);
    }

    private _currentView: RevenueChartView = 'monthly';

    hasData(vm: RevenueVM): boolean {
        return vm.data.summary.revenueOverview.totalRevenue > 0
            || vm.data.trends.trend.providerRevenue.length > 0
            || vm.data.growth.monthlyGrowth.length > 0
            || vm.data.growth.composition.length > 0
            || vm.data.growth.topServices.length > 0
            || vm.data.clients.newAndReturning.length > 0;
    }

    ngOnInit(): void {
        this._sharedService.setProviderHeader('Revenue Analytics');
    }

    onViewChange(view: RevenueChartView) {
        this._currentView = view;
        this.vm$ = this._load(view);
    }
}
