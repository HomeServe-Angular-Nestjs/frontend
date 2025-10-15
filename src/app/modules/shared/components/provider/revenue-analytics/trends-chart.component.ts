import { Component, OnInit, inject, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxEchartsModule } from 'ngx-echarts';
import type { EChartsOption } from 'echarts';
import { AnalyticService } from '../../../../../core/services/analytics.service';
import { IRevenueTrendData, RevenueChartView } from '../../../../../core/models/analytics.model';
import { Subject, takeUntil } from 'rxjs';

@Component({
    selector: 'app-revenue-trend-chart',
    imports: [CommonModule, NgxEchartsModule],
    providers: [AnalyticService],
    template: `
    <div class="p-4 bg-white rounded-2xl shadow-md">
        <div class="flex items-center justify-between mb-3">
            <h2 class="text-lg font-semibold text-gray-800">
                Revenue Trend Over Time
            </h2>
            <div class="flex justify-end mt-3 space-x-2">
                <button
                *ngFor="let view of viewOptions"
                (click)="onViewChange(view)"
                class="px-3 py-1 rounded-md border text-sm transition"
                [class.bg-green-600]="currentView === view"
                [class.text-white]="currentView === view"
                [class.border-gray-300]="currentView !== view"
                [class.text-gray-700]="currentView !== view"
                [class.hover\\:bg-green-100]="currentView !== view"
                >
                {{ view | titlecase}}
                </button>
            </div>
        </div>

      <div echarts [options]="chartOptions" class="h-80 w-full"></div>

    </div>
  `,
})
export class RevenueTrendChartComponent implements OnInit, OnDestroy {
    private readonly _analyticService = inject(AnalyticService);

    private _destroy$ = new Subject<void>();

    chartOptions: EChartsOption = {};
    viewOptions: RevenueChartView[] = ['monthly', 'quarterly', 'yearly'];
    currentView: RevenueChartView = 'monthly';
    revenueTrendData: IRevenueTrendData = { providerRevenue: [], platformAvg: [], labels: [] };

    ngOnInit() {
        this.updateChartData();
    }

    ngOnDestroy() {
        this._destroy$.next();
        this._destroy$.complete();
    }

    onViewChange(view: RevenueChartView) {
        this.currentView = view;
        this.updateChartData();
    }

    private updateChartData() {
        this._analyticService.getRevenueTrendOverTime(this.currentView)
            .pipe(takeUntil(this._destroy$))
            .subscribe(res => {
                this.revenueTrendData = res.data || this.revenueTrendData;
                this.setChartOptions();
            });
    }

    private setChartOptions() {
        this.chartOptions = {
            tooltip: {
                trigger: 'axis',
                backgroundColor: 'rgba(16,185,129,0.9)',
                textStyle: { color: '#fff' },
            },
            legend: {
                data: ['Your Revenue', 'Platform Average'],
                top: 10,
            },
            grid: {
                left: '3%',
                right: '4%',
                bottom: '3%',
                containLabel: true,
            },
            xAxis: {
                type: 'category',
                boundaryGap: false,
                data: this.revenueTrendData.labels,
                axisLine: { lineStyle: { color: '#ccc' } },
            },
            yAxis: {
                type: 'value',
                axisLine: { lineStyle: { color: '#ccc' } },
                splitLine: { lineStyle: { color: '#eee' } },
            },
            series: [
                {
                    name: 'Your Revenue',
                    type: 'line',
                    data: this.revenueTrendData.providerRevenue,
                    smooth: true,
                    lineStyle: { width: 3, color: '#16A34A' },
                    areaStyle: {
                        color: 'rgba(22,163,74,0.15)',
                    },
                    symbol: 'circle',
                    symbolSize: 6,
                    itemStyle: {
                        color: '#16A34A',
                        borderColor: '#fff',
                        borderWidth: 2,
                    },
                    animationDuration: 800,
                    animationEasing: 'cubicOut',
                },
                {
                    name: 'Platform Average',
                    type: 'line',
                    data: this.revenueTrendData.platformAvg,
                    smooth: true,
                    lineStyle: { width: 2, color: '#6EE7B7', type: 'dashed' },
                    symbol: 'none',
                    animationDuration: 800,
                    animationEasing: 'cubicOut',
                },
            ],
        };
    }
}
