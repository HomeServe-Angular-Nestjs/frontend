import { CommonModule } from "@angular/common";
import { Component, inject, OnDestroy, OnInit } from "@angular/core";
import { EChartsOption } from "echarts";
import { NgxEchartsModule } from 'ngx-echarts';
import { Subject, takeUntil } from "rxjs";
import { AnalyticService } from "../../../../../../core/services/analytics.service";
import { IDisputeAnalyticsChartData } from "../../../../../../core/models/analytics.model";
import { ComplaintReason } from "../../../../../../core/enums/enums";
import { CapitalizeFirstPipe } from "../../../../../../core/pipes/capitalize-first.pipe";

@Component({
    selector: 'app-performance-disputes',
    imports: [CommonModule, NgxEchartsModule],
    providers: [AnalyticService, CapitalizeFirstPipe],
    template: `
        <div class="bg-white rounded-lg shadow-md p-6 border border-slate-100">
            <div class="flex items-center justify-between mb-6">
                <div>
                    <h2 class="text-2xl font-semibold text-slate-900">Disputes</h2>
                    <p class="text-sm text-slate-500 mt-1">Disputes by Type (Last 10 Days)</p>
                </div>
            </div>
            <div echarts [options]="disputesOptions" class="h-80"></div>
        </div>
    `
})
export class ProviderPerformanceDisputesChartComponent implements OnInit, OnDestroy {
    private readonly _analyticService = inject(AnalyticService);
    private readonly _capitalizeFirstPipe = inject(CapitalizeFirstPipe);
    private _destroy$ = new Subject<void>();

    disputesOptions: EChartsOption = {};
    disputesOptionsData: IDisputeAnalyticsChartData[] = [];

    ngOnInit(): void {
        this._analyticService.getMonthlyDisputeStats()
            .pipe(takeUntil(this._destroy$))
            .subscribe(res => {
                this.disputesOptionsData = res.data ?? [];
                this._setDisputesOptions();
            });
    }

    ngOnDestroy(): void {
        this._destroy$.next();
        this._destroy$.complete();
    }

    private _setDisputesOptions() {
        const months: string[] = [
            "Jan", "Feb", "Mar", "Apr", "May", "Jun",
            "Jul", "Aug", "Sept", "Oct", "Nov", "Dec"
        ];

        const spamData = new Array(12).fill(0);
        const inappropriateData = new Array(12).fill(0);
        const harassmentData = new Array(12).fill(0);
        const otherData = new Array(12).fill(0);

        this.disputesOptionsData.forEach(d => {
            const monthIndex = months.findIndex(m => m === d.month);
            spamData[monthIndex] = d.spam;
            inappropriateData[monthIndex] = d.inappropriate;
            harassmentData[monthIndex] = d.harassment;
            otherData[monthIndex] = d.other;
        });

        // Distinct greenish tones for each category
        const greenShades = [
            { start: '#166534', end: '#14532d' }, 
            { start: '#22c55e', end: '#16a34a' }, 
            { start: '#a3e635', end: '#84cc16' }, 
            { start: '#2dd4bf', end: '#0d9488' }  
        ];

        const seriesData = [
            { name: 'Spam', data: spamData },
            { name: 'Inappropriate', data: inappropriateData },
            { name: 'Harassment', data: harassmentData },
            { name: 'Other', data: otherData }
        ];

        this.disputesOptions = {
            tooltip: {
                trigger: 'axis',
                axisPointer: { type: 'shadow' },
                backgroundColor: 'rgba(255,255,255,0.95)',
                borderColor: '#e5e7eb',
                borderWidth: 1,
            },
            legend: {
                data: Object.values(ComplaintReason).map(reason => this._capitalizeFirstPipe.transform(reason)),
                top: 0,
                textStyle: { fontSize: 12, color: '#15803d' }
            },
            grid: { left: '3%', right: '4%', top: '15%', bottom: '10%', containLabel: true },
            xAxis: {
                type: 'category',
                data: months,
                axisLine: { lineStyle: { color: '#15803d' } },
                axisLabel: { color: '#15803d', fontSize: 12 }
            },
            yAxis: {
                type: 'value',
                axisLine: { show: false },
                splitLine: { lineStyle: { color: '#d1fae5', type: 'dashed' } },
                axisLabel: { color: '#15803d' }
            },
            series: seriesData.map((s, i) => ({
                name: s.name,
                type: 'bar',
                stack: 'total',
                data: s.data,
                barGap: 0,
                barWidth: 22,
                itemStyle: {
                    borderRadius: [4, 4, 0, 0],
                    color: {
                        type: 'linear',
                        x: 0, y: 0, x2: 0, y2: 1,
                        colorStops: [
                            { offset: 0, color: greenShades[i].start },
                            { offset: 1, color: greenShades[i].end }
                        ]
                    }
                },
                emphasis: {
                    itemStyle: {
                        opacity: 1,
                        shadowBlur: 6,
                        shadowColor: 'rgba(0, 0, 0, 0.2)'
                    }
                }
            }))
        };
    }

}
