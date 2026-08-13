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
import { AnalyticsPageComponent } from "../../../../shared/components/analytics/analytics-page/analytics-page.component";
import { AnalyticsSectionHeaderComponent } from "../../../../shared/components/analytics/analytics-section-header/analytics-section-header.component";
import { AnalyticsInsightCardComponent, InsightTone } from "../../../../shared/components/analytics/analytics-insight-card/analytics-insight-card.component";

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

interface InsightVM { text: string; icon: string; tone: InsightTone; }

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
        RevenueEarningsForecastChartComponent,
        AnalyticsPageComponent,
        AnalyticsSectionHeaderComponent,
        AnalyticsInsightCardComponent
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
        this.vm$ = this._load('monthly');
    }

    hasData(vm: RevenueVM | null): boolean {
        if (!vm) return true;
        return vm.data.summary.revenueOverview.totalRevenue > 0
            || vm.data.trends.trend.providerRevenue.length > 0
            || vm.data.growth.monthlyGrowth.length > 0
            || vm.data.growth.composition.length > 0
            || vm.data.growth.topServices.length > 0
            || vm.data.clients.newAndReturning.length > 0;
    }

    buildInsights(bundle: IRevenueAnalyticsBundle): InsightVM[] {
        const o = bundle.summary.revenueOverview;
        const insights: InsightVM[] = [];

        if (o.totalRevenue > 0) {
            insights.push({
                text: `Total revenue of ₹${this._format(o.totalRevenue.toFixed(0))} this month reflects healthy demand for your services.`,
                icon: 'fa-solid fa-money-bill-wave',
                tone: 'info'
            });
        }

        if (o.revenueGrowth > 0) {
            insights.push({ text: `Revenue grew ${o.revenueGrowth}% — great momentum to build on.`, icon: 'fa-solid fa-chart-line', tone: 'positive' });
        } else if (o.revenueGrowth < 0) {
            insights.push({ text: `Revenue declined ${Math.abs(o.revenueGrowth)}%. Consider promos or expanding service areas.`, icon: 'fa-solid fa-chart-line', tone: 'negative' });
        }

        if (o.avgTransactionValue > 0 && o.avgTransactionValue >= 1000) {
            insights.push({ text: `Your average transaction value of ₹${o.avgTransactionValue.toFixed(0)} is strong — consider premium add-ons.`, icon: 'fa-solid fa-coins', tone: 'positive' });
        }

        return insights;
    }

    private _format(n: string): string {
        return n.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    }

    ngOnInit(): void {
        this._sharedService.setProviderHeader('Revenue Analytics');
    }
}