import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { NgxEchartsModule } from 'ngx-echarts';
import { EChartsOption } from 'echarts';
import { AnalyticService } from '../../../../../../core/services/analytics.service';
import { Subject, takeUntil } from 'rxjs';
import { IResponseTimeChartData } from '../../../../../../core/models/analytics.model';

@Component({
    selector: 'app-performance-response-time',
    standalone: true,
    imports: [NgxEchartsModule],
    providers: [AnalyticService],
    template: `
           <div class="bg-white rounded-lg shadow-md p-6 border border-slate-100 ">
                <div class="flex items-center justify-between mb-6">
                    <div>
                        <h2 class="text-2xl font-semibold text-slate-900">Response Time Distribution</h2>
                        <p class="text-sm text-slate-500 mt-1">Monthly performance metrics</p>
                    </div>
                </div>
                <div echarts [options]="responseTimeOptions" class="h-80"></div>
            </div>
  `
})
export class ProviderPerformanceResponseTimeChartComponent implements OnInit, OnDestroy {
    private readonly _analyticService = inject(AnalyticService);
    private _destroy$ = new Subject<void>();

    responseTimeOptions: EChartsOption = {};
    responseTimeData: IResponseTimeChartData[] = [];

    ngOnInit(): void {
        this._analyticService.getResponseTimeDistributionData()
            .pipe(takeUntil(this._destroy$))
            .subscribe(res => {
                this.responseTimeData = res.data ?? []
                this._setResponseTimeOptions();
            });
    }

    ngOnDestroy(): void {
        this._destroy$.next();
        this._destroy$.complete();
    }

    private _setResponseTimeOptions() {
        const labels = ["< 1 min", "1–10 min", "10–60 min", "1–24 hrs", "> 1 day"];
        const colorMap: Record<string, string> = {
            "< 1 min": "#10b981",
            "1–10 min": "#22c55e",
            "10–60 min": "#a3e635",
            "1–24 hrs": "#84cc16",
            "> 1 day": "#166534",
        };

        const dataMap = Object.fromEntries(this.responseTimeData.map(d => [d.name, d.count]));

        const chartData = labels.map(label => ({
            name: label,
            value: dataMap[label] ?? 0,
            itemStyle: { color: colorMap[label] }
        }));

        this.responseTimeOptions = {
            tooltip: {
                trigger: 'item',
                formatter: '{b}: {c} responses ({d}%)',
                backgroundColor: 'rgba(255,255,255,0.95)',
                borderColor: '#e5e7eb',
                borderWidth: 1
            },
            legend: {
                orient: 'vertical',
                right: 10,
                top: 'center',
                data: labels,
                textStyle: { fontSize: 12, color: '#64748b' }
            },
            series: [{
                name: 'Responses',
                type: 'pie',
                radius: ['45%', '75%'],
                center: ['40%', '50%'],
                avoidLabelOverlap: this.responseTimeData.length === 5,
                itemStyle: {
                    borderRadius: 8,
                    borderColor: '#fff',
                    borderWidth: 3
                },
                label: {
                    show: true,
                    position: 'outside',
                    formatter: '{b}\n{d}%',
                    fontSize: 11,
                    color: '#475569',
                    fontWeight: 'bold'
                },
                emphasis: {
                    itemStyle: {
                        shadowBlur: 15,
                        shadowOffsetX: 0,
                        shadowColor: 'rgba(0,0,0,0.3)'
                    }
                },
                data: chartData
            }]
        };
    }
}
