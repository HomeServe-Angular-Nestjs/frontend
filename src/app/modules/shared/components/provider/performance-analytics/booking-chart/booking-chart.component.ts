import { Component, inject, OnDestroy, OnInit } from "@angular/core";
import { NgxEchartsModule } from "ngx-echarts";
import { EChartsOption } from 'echarts';
import { AnalyticService } from "../../../../../../core/services/analytics.service";
import { Subject, takeUntil } from "rxjs";
import { IBookingPerformanceData } from "../../../../../../core/models/analytics.model";
import { CallbackDataParams } from "echarts/types/dist/shared";

@Component({
    selector: 'app-performance-bookings',
    imports: [NgxEchartsModule],
    providers: [AnalyticService],
    template: `
      <div class="bg-white rounded-2xl shadow-md p-6 border border-slate-100">
        <div class="flex items-center justify-between mb-6">
          <div>
            <h2 class="text-2xl font-semibold text-slate-900">
              Bookings Overview
            </h2>
            <p class="text-sm text-slate-500 mt-1">
              Monthly performance metrics
            </p>
          </div>
        </div>
        <div echarts [options]="barChartOptions" class="h-80"></div>
      </div>
    `,
})
export class ProviderPerformanceBookingChartComponent implements OnInit, OnDestroy {
    private readonly _analyticService = inject(AnalyticService);
    private _destroy$ = new Subject<void>();

    bookingStats: IBookingPerformanceData[] = [];
    barChartOptions: EChartsOption = {};

    ngOnInit(): void {
        this._analyticService.getPerformanceBookingOverview()
            .pipe(takeUntil(this._destroy$))
            .subscribe(res => {
                this.bookingStats = res.data ?? [];
                this.updateChartOptions();
            });
    }

    ngOnDestroy(): void {
        this._destroy$.next();
        this._destroy$.complete();
    }

    private updateChartOptions(): void {
        const allMonths = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sept", "Oct", "Nov", "Dec"];
        const dataMap = new Map(this.bookingStats.map(s => [s.month, s]));

        const months: string[] = [];
        const completedData: number[] = [];
        const cancelledData: number[] = [];

        allMonths.forEach(m => {
            months.push(m);
            const stat = dataMap.get(m);
            completedData.push(stat?.completed ?? 0);
            cancelledData.push(stat?.cancelled ?? 0);
        });

        this.barChartOptions = {
            tooltip: {
                trigger: 'axis',
                backgroundColor: 'rgba(255,255,255,0.95)',
                borderColor: '#d1fae5',
                borderWidth: 1,
                textStyle: { color: '#065f46' },
                axisPointer: {
                    type: 'shadow',
                    shadowStyle: { color: 'rgba(16,185,129,0.08)' }
                },
                formatter: (params: CallbackDataParams[] | any) => {
                    const paramArr = Array.isArray(params) ? params : [params];
                    const completed = paramArr.find((p: CallbackDataParams) => p.seriesName === 'Completed')?.value ?? 0;
                    const cancelled = paramArr.find((p: CallbackDataParams) => p.seriesName === 'Cancelled')?.value ?? 0;
                    const total = completed + cancelled;

                    let tooltipText = `<strong>${paramArr[0].axisValue}</strong><br/>`;
                    tooltipText += `Total: ${total}<br/>`;
                    paramArr.forEach((p: CallbackDataParams) => {
                        tooltipText += `${p.seriesName}: ${p.value}<br/>`;
                    });
                    return tooltipText;
                }
            },
            legend: {
                data: ['Completed', 'Cancelled'],
                bottom: 0,
                textStyle: { fontSize: 13, color: '#065f46' },
            },
            grid: {
                left: '3%',
                right: '4%',
                bottom: '15%',
                top: '3%',
                containLabel: true
            },
            xAxis: {
                type: 'category',
                data: months,
                axisLine: { lineStyle: { color: '#bbf7d0' } },
                axisLabel: { color: '#047857', fontSize: 12 }
            },
            yAxis: {
                type: 'value',
                name: 'Bookings',
                nameTextStyle: { color: '#047857', fontSize: 12 },
                axisLine: { show: false },
                splitLine: { lineStyle: { color: '#d1fae5', type: 'dashed' } },
                axisLabel: { color: '#047857' }
            },
            series: [
                {
                    name: 'Completed',
                    type: 'bar',
                    data: completedData,
                    itemStyle: {
                        color: {
                            type: 'linear',
                            x: 0, y: 0, x2: 0, y2: 1,
                            colorStops: [
                                { offset: 0, color: '#34d399' },
                                { offset: 1, color: '#059669' }
                            ]
                        },
                        borderRadius: [8, 8, 0, 0]
                    },
                    barWidth: '40%'
                },
                {
                    name: 'Cancelled',
                    type: 'line',
                    data: cancelledData,
                    smooth: true,
                    lineStyle: { width: 3, color: '#ef4444' },
                    itemStyle: { color: '#ef4444' },
                    symbolSize: 8,
                    symbol: 'circle'
                }
            ]
        };
    }
}
