import { Component, Input } from "@angular/core";
import { CommonModule } from "@angular/common";
import { EChartsOption } from "echarts";
import { NgxEchartsModule } from "ngx-echarts";
import { IOnTimeArrivalChartData } from "../../../../../../core/models/analytics.model";
import { AnalyticsChartCardComponent } from "../../../analytics/analytics-chart-card/analytics-chart-card.component";
import { ANALYTICS_COLORS } from "../../../analytics/analytics.tokens";

@Component({
    selector: 'app-performance-on-time-arrival',
    imports: [CommonModule, NgxEchartsModule, AnalyticsChartCardComponent],
    template: `
        <app-analytics-chart-card
            title="On-Time Arrival Rate"
            subtitle="Monthly performance metrics"
            [height]="'small'"
            [hasData]="onTimeArrivalOptionsData.length > 0"
            emptyTitle="No arrival data"
            emptyMessage="On-time arrival rate will appear here once bookings are recorded.">
            <div echarts [options]="onTimeArrivalOptions" class="h-full w-full"></div>
        </app-analytics-chart-card>
    `,
})
export class ProviderPerformanceOnTimeArrivalChartComponent {
    @Input()
    set data(value: IOnTimeArrivalChartData[]) {
        this.onTimeArrivalOptionsData = value ?? [];
        this._setOnTimeArrivalOptions();
    }

    onTimeArrivalOptions: EChartsOption = {};
    onTimeArrivalOptionsData: IOnTimeArrivalChartData[] = [];

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
                lineStyle: { width: 3, color: ANALYTICS_COLORS.provider },
                itemStyle: { color: ANALYTICS_COLORS.provider },
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