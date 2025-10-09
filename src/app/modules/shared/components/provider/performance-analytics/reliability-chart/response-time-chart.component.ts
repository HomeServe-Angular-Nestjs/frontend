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
           <div class="bg-white rounded-2xl shadow-lg p-6 border border-slate-100 hover:shadow-xl transition-shadow duration-300">
                <div class="flex items-center justify-between mb-6">
                    <div>
                        <h2 class="text-2xl font-semibold text-slate-900">Response Time Distribution</h2>
                        <p class="text-sm text-slate-500 mt-1">Monthly performance metrics</p>
                    </div>
                </div>
                <div echarts [options]="responseTimeOptions" class="h-80"></div>
            </div>

        <!-- On-Time Arrival
        

        Disputes Breakdown
        <div class="lg:col-span-2 bg-gradient-to-br from-slate-50 to-orange-50 rounded-xl p-4 border border-slate-100">
          <h3 class="text-sm font-bold text-slate-700 mb-3 uppercase tracking-wide flex items-center gap-2">
            <span class="w-2 h-2 rounded-full bg-orange-500"></span>
            Disputes by Type (Last 10 Days)
          </h3>
          <div echarts [options]="disputesOptions" class="h-72"></div>
        </div> -->

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
            "1–10 min": "#3b82f6",
            "10–60 min": "#f59e0b",
            "1–24 hrs": "#8b5cf6",
            "> 1 day": "#ef4444",
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



    /** On-Time Arrival Rate */


    /** Disputes / Complaints Heatmap (Calendar) */
    disputesOptions: EChartsOption = {
        tooltip: {
            trigger: 'axis',
            axisPointer: { type: 'shadow' },
            backgroundColor: 'rgba(255,255,255,0.95)',
            borderColor: '#e5e7eb',
            borderWidth: 1
        },
        legend: {
            data: ['Late Service', 'Quality Issue', 'Other'],
            top: 0,
            textStyle: { fontSize: 12, color: '#64748b' }
        },
        grid: { left: '3%', right: '4%', top: '15%', bottom: '10%', containLabel: true },
        xAxis: {
            type: 'category',
            data: ['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5', 'Day 6', 'Day 7', 'Day 8', 'Day 9', 'Day 10'],
            axisLine: { lineStyle: { color: '#e5e7eb' } },
            axisLabel: { color: '#64748b', fontSize: 11, rotate: 0 }
        },
        yAxis: {
            type: 'value',
            axisLine: { show: false },
            splitLine: { lineStyle: { color: '#f1f5f9', type: 'dashed' } },
            axisLabel: { color: '#64748b' }
        },
        series: [
            {
                name: 'Late Service',
                type: 'bar',
                stack: 'total',
                data: [1, 2, 0, 1, 2, 3, 0, 2, 1, 2],
                itemStyle: {
                    color: '#ef4444',
                    borderRadius: [0, 0, 0, 0]
                }
            },
            {
                name: 'Quality Issue',
                type: 'bar',
                stack: 'total',
                data: [1, 2, 1, 1, 1, 3, 0, 2, 1, 2],
                itemStyle: {
                    color: '#f97316',
                    borderRadius: [0, 0, 0, 0]
                }
            },
            {
                name: 'Other',
                type: 'bar',
                stack: 'total',
                data: [0, 1, 0, 1, 1, 1, 0, 2, 0, 1],
                itemStyle: {
                    color: '#eab308',
                    borderRadius: [4, 4, 0, 0]
                }
            }
        ]
    };


}
