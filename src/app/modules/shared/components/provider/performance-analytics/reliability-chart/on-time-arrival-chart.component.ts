import { Component, inject, OnDestroy, OnInit } from "@angular/core";
import { EChartsOption } from "echarts";
import { NgxEchartsModule } from "ngx-echarts";
import { Subject, takeUntil } from "rxjs";
import { AnalyticService } from "../../../../../../core/services/analytics.service";
import { IOnTimeArrivalChartData } from "../../../../../../core/models/analytics.model";

@Component({
    selector: 'app-performance-on-time-arrival',
    imports: [NgxEchartsModule],
    providers: [AnalyticService],
    template: `
           <div class="bg-white rounded-lg shadow-md p-6 border border-slate-100">
                <div class="flex items-center justify-between mb-6">
                    <div>
                        <h2 class="text-2xl font-semibold text-slate-900">On-Time Arrival Rate</h2>
                        <p class="text-sm text-slate-500 mt-1">Monthly performance metrics</p>
                    </div>
                </div>
                <div echarts [options]="onTimeArrivalOptions" class="h-80"></div>
            </div>
    `
})
export class ProviderPerformanceOnTimeArrivalChartComponent implements OnInit, OnDestroy {
    private readonly _analyticService = inject(AnalyticService);
    private _destroy$ = new Subject<void>();

    onTimeArrivalOptions: EChartsOption = {};
    onTimeArrivalOptionsData: IOnTimeArrivalChartData[] = [];

    ngOnInit(): void {
        this._analyticService.getOnTimeArrivalData()
            .pipe(takeUntil(this._destroy$))
            .subscribe(res => {
                this.onTimeArrivalOptionsData = res.data ?? [];
                this._setOnTimeArrivalOptions();
            });
    }

    ngOnDestroy(): void {
        this._destroy$.next();
        this._destroy$.complete();
    }

    private _setOnTimeArrivalOptions() {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

        const dataMap: Record<string, number> = {};
        this.onTimeArrivalOptionsData.forEach(d => dataMap[d.month] = d.percentage);

        const seriesData = months.map(m => dataMap[m] ?? 0);

        this.onTimeArrivalOptions = {
            tooltip: {
                trigger: 'axis',
                formatter: '{b}: {c}%',
                backgroundColor: 'rgba(255,255,255,0.95)',
                borderColor: '#e5e7eb',
                borderWidth: 1
            },
            grid: { left: '10%', right: '10%', top: '15%', bottom: '15%' },
            xAxis: {
                type: 'category',
                data: months,
                axisLine: { lineStyle: { color: '#e5e7eb' } },
                axisLabel: { color: '#64748b', fontSize: 11 }
            },
            yAxis: {
                type: 'value',
                max: 100,
                axisLine: { show: false },
                splitLine: { lineStyle: { color: '#f1f5f9', type: 'dashed' } },
                axisLabel: { color: '#64748b', formatter: '{value}%' }
            },
            series: [{
                name: 'On-Time Arrival',
                type: 'line',
                smooth: true,
                data: seriesData,
                lineStyle: { width: 3, color: '#10b981' },
                itemStyle: { color: '#10b981' },
                areaStyle: {
                    color: {
                        type: 'linear',
                        x: 0, y: 0, x2: 0, y2: 1,
                        colorStops: [
                            { offset: 0, color: 'rgba(16, 185, 129, 0.3)' },
                            { offset: 1, color: 'rgba(16, 185, 129, 0.05)' }
                        ]
                    }
                },
                symbolSize: 8
            }]
        };
    }


}