import { Component, inject, Input, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxEchartsModule } from 'ngx-echarts';
import type { EChartsOption } from 'echarts';
import { IRevenueTrendData, RevenueChartView } from '../../../../../core/models/analytics.model';
import { AnalyticService } from '../../../../../core/services/analytics.service';
import { Subject, takeUntil } from 'rxjs';
import { AnalyticsChartCardComponent } from '../../analytics/analytics-chart-card/analytics-chart-card.component';
import { ANALYTICS_COLORS } from '../../analytics/analytics.tokens';

@Component({
    selector: 'app-revenue-trend-chart',
    imports: [CommonModule, NgxEchartsModule, AnalyticsChartCardComponent],
    template: `
        <app-analytics-chart-card
            title="Revenue Trend Over Time"
            subtitle="Compare your revenue against the platform average"
            [height]="'small'"
            [isLoading]="(isLoading$ | async) === true"
            [hasData]="revenueTrendData.labels.length > 0">

            <div app-analytics-toolbar>
                <button
                    *ngFor="let view of viewOptions"
                    type="button"
                    (click)="onViewChange(view)"
                    class="rounded-md px-3 py-1 text-sm font-medium transition"
                    [class.bg-emerald-600]="currentView === view"
                    [class.text-white]="currentView === view"
                    [class.bg-slate-100]="currentView !== view"
                    [class.text-slate-600]="currentView !== view">
                    {{ view | titlecase }}
                </button>
            </div>

            <div echarts [options]="chartOptions" class="h-full w-full"></div>
        </app-analytics-chart-card>
    `,
})
export class RevenueTrendChartComponent implements OnDestroy {
    private readonly _analyticService = inject(AnalyticService);
    private readonly _destroy$ = new Subject<void>();

    @Input()
    set data(value: IRevenueTrendData) {
        this.revenueTrendData = value ?? { providerRevenue: [], platformAvg: [], labels: [] };
        this.setChartOptions();
    }

    isLoading$ = new Subject<boolean>();

    chartOptions: EChartsOption = {};
    viewOptions: RevenueChartView[] = ['monthly', 'quarterly', 'yearly'];
    currentView: RevenueChartView = 'monthly';
    revenueTrendData: IRevenueTrendData = { providerRevenue: [], platformAvg: [], labels: [] };

    onViewChange(view: RevenueChartView) {
        if (view === this.currentView) return;
        this.currentView = view;
        this.isLoading$.next(true);
        this._analyticService.getRevenueTrend(view).pipe(takeUntil(this._destroy$)).subscribe({
            next: (res) => {
                this.revenueTrendData = res?.data ?? { providerRevenue: [], platformAvg: [], labels: [] };
                this.setChartOptions();
                this.isLoading$.next(false);
            },
            error: () => {
                this.isLoading$.next(false);
            },
        });
    }

    private setChartOptions() {
        this.chartOptions = {
            tooltip: {
                trigger: 'axis',
                backgroundColor: ANALYTICS_COLORS.providerStrong,
                textStyle: { color: '#fff' },
            },
            legend: { data: ['Your Revenue', 'Platform Average'], top: 10 },
            grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
            xAxis: {
                type: 'category',
                boundaryGap: false,
                data: this.revenueTrendData.labels,
                axisLine: { lineStyle: { color: ANALYTICS_COLORS.axis } },
                axisLabel: { color: ANALYTICS_COLORS.text },
            },
            yAxis: {
                type: 'value',
                axisLine: { lineStyle: { color: ANALYTICS_COLORS.axis } },
                splitLine: { lineStyle: { color: ANALYTICS_COLORS.grid } },
            },
            series: [
                {
                    name: 'Your Revenue',
                    type: 'line',
                    data: this.revenueTrendData.providerRevenue,
                    smooth: true,
                    lineStyle: { width: 3, color: ANALYTICS_COLORS.provider },
                    areaStyle: { color: 'rgba(16,185,129,0.15)' },
                    symbol: 'circle',
                    symbolSize: 6,
                    itemStyle: { color: ANALYTICS_COLORS.provider, borderColor: '#fff', borderWidth: 2 },
                    animationDuration: 800,
                    animationEasing: 'cubicOut',
                },
                {
                    name: 'Platform Average',
                    type: 'line',
                    data: this.revenueTrendData.platformAvg,
                    smooth: true,
                    lineStyle: { width: 2, color: ANALYTICS_COLORS.platformSoft, type: 'dashed' },
                    symbol: 'none',
                    animationDuration: 800,
                    animationEasing: 'cubicOut',
                },
            ],
        };
    }

    ngOnDestroy(): void {
        this._destroy$.next();
        this._destroy$.complete();
    }
}