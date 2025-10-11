import { Component, inject, OnDestroy, OnInit } from "@angular/core";
import { EChartsOption } from "echarts";
import { NgxEchartsModule } from "ngx-echarts";
import { Subject, takeUntil } from "rxjs";
import { AnalyticService } from "../../../../../../core/services/analytics.service";
import { IDisputeAnalyticsChartData } from "../../../../../../core/models/analytics.model";
import { ComplaintReason } from "../../../../../../core/enums/enums";
import { CapitalizeFirstPipe } from "../../../../../../core/pipes/capitalize-first.pipe";

@Component({
    selector: 'app-performance-disputes',
    imports: [NgxEchartsModule,],
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
        const otherData = new Array(12).fill(0)

        this.disputesOptionsData.forEach(d => {
            const monthIndex = months.findIndex(m => m === d.month);
            spamData[monthIndex] = d.spam;
            inappropriateData[monthIndex] = d.inappropriate;
            harassmentData[monthIndex] = d.harassment;
            otherData[monthIndex] = d.other;
        });

        this.disputesOptions = {
            tooltip: {
                trigger: 'axis',
                axisPointer: { type: 'shadow' },
                backgroundColor: 'rgba(255,255,255,0.95)',
                borderColor: '#e5e7eb',
                borderWidth: 1
            },
            legend: {
                data: Object.values(ComplaintReason).map(reason => this._capitalizeFirstPipe.transform(reason)),
                top: 0,
                textStyle: { fontSize: 12, color: '#64748b' }
            },
            grid: { left: '3%', right: '4%', top: '15%', bottom: '10%', containLabel: true },
            xAxis: {
                type: 'category',
                data: months,
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
                    name: 'Spam',
                    type: 'bar',
                    stack: 'total',
                    data: spamData,
                    itemStyle: {
                        color: '#ef4444', // red-500 (represents warning/danger)
                        borderRadius: [0, 0, 0, 0]
                    },
                    emphasis: {
                        itemStyle: {
                            opacity: 1,
                            shadowBlur: 6,
                            shadowColor: 'rgba(0, 0, 0, 0.2)'
                        }
                    }
                },
                {
                    name: 'Inappropriate',
                    type: 'bar',
                    stack: 'total',
                    data: inappropriateData,
                    itemStyle: {
                        color: '#f59e0b', // amber-500 (represents questionable behavior)
                        borderRadius: [0, 0, 0, 0]
                    },
                    emphasis: {
                        itemStyle: {
                            opacity: 1,
                            shadowBlur: 6,
                            shadowColor: 'rgba(0, 0, 0, 0.2)'
                        }
                    }
                },
                {
                    name: 'Harassment',
                    type: 'bar',
                    stack: 'total',
                    data: harassmentData,
                    itemStyle: {
                        color: '#8b5cf6', // violet-500 (strong visual identity, less alarming)
                        borderRadius: [0, 0, 0, 0]
                    },
                    emphasis: {
                        itemStyle: {
                            opacity: 1,
                            shadowBlur: 6,
                            shadowColor: 'rgba(0, 0, 0, 0.2)'
                        }
                    }
                },
                {
                    name: 'Other',
                    type: 'bar',
                    stack: 'total',
                    data: otherData,
                    itemStyle: {
                        color: '#22c55e', // green-500 (neutral, positive balance)
                        borderRadius: [4, 4, 0, 0]
                    },
                    emphasis: {
                        itemStyle: {
                            opacity: 1,
                            shadowBlur: 6,
                            shadowColor: 'rgba(0, 0, 0, 0.2)'
                        }
                    }
                }
            ]
        };
    }


}