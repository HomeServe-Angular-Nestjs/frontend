import { Component, Input } from "@angular/core";
import { CommonModule } from "@angular/common";
import { NgxEchartsModule } from "ngx-echarts";
import { EChartsOption } from 'echarts';
import { IBookingPerformanceData } from "../../../../../../core/models/analytics.model";
import { CallbackDataParams } from "echarts/types/dist/shared";
import { AnalyticsChartCardComponent } from "../../../analytics/analytics-chart-card/analytics-chart-card.component";
import { ANALYTICS_COLORS } from "../../../analytics/analytics.tokens";

@Component({
    selector: 'app-performance-bookings',
    imports: [CommonModule, NgxEchartsModule, AnalyticsChartCardComponent],
    template: `
        <app-analytics-chart-card
            title="Bookings Overview"
            subtitle="Monthly performance metrics"
            [height]="'small'"
            [hasData]="bookingStats.length > 0"
            emptyTitle="No booking data"
            emptyMessage="Bookings overview will appear here once data is available.">
            <div echarts [options]="barChartOptions" class="h-full w-full"></div>
        </app-analytics-chart-card>
    `,
})
export class ProviderPerformanceBookingChartComponent {
    @Input()
    set data(value: IBookingPerformanceData[]) {
        this.bookingStats = value ?? [];
        this.updateChartOptions();
    }

    bookingStats: IBookingPerformanceData[] = [];
    barChartOptions: EChartsOption = {};

    private updateChartOptions(): void {
        const allMonths = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
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
                axisPointer: { type: 'shadow', shadowStyle: { color: 'rgba(16,185,129,0.08)' } },
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
                textStyle: { fontSize: 13, color: '#065f46' }
            },
            grid: { left: '3%', right: '4%', bottom: '20%', top: '3%', containLabel: true },
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
                                { offset: 0, color: ANALYTICS_COLORS.newCustomers },
                                { offset: 1, color: ANALYTICS_COLORS.providerStrong }
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
                    lineStyle: { width: 3, color: ANALYTICS_COLORS.negative },
                    itemStyle: { color: ANALYTICS_COLORS.negative },
                    symbolSize: 8,
                    symbol: 'circle'
                }
            ]
        };
    }
}