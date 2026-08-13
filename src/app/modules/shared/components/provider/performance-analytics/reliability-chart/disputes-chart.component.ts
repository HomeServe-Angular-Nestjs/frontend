import { CommonModule } from "@angular/common";
import { Component, inject, Input } from "@angular/core";
import { EChartsOption } from "echarts";
import { NgxEchartsModule } from 'ngx-echarts';
import { IDisputeAnalyticsChartData } from "../../../../../../core/models/analytics.model";
import { ComplaintReason } from "../../../../../../core/enums/enums";
import { CapitalizeFirstPipe } from "../../../../../../core/pipes/capitalize-first.pipe";
import { AnalyticsChartCardComponent } from "../../../analytics/analytics-chart-card/analytics-chart-card.component";
import { ANALYTICS_COLORS } from "../../../analytics/analytics.tokens";

@Component({
    selector: 'app-performance-disputes',
    imports: [CommonModule, NgxEchartsModule, AnalyticsChartCardComponent],
    providers: [CapitalizeFirstPipe],
    template: `
        <app-analytics-chart-card
            title="Disputes"
            subtitle="Disputes by type, monthly"
            [height]="'small'"
            [hasData]="disputesOptionsData.length > 0"
            emptyTitle="No dispute data"
            emptyMessage="Dispute analytics will appear here once disputes are recorded.">
            <div echarts [options]="disputesOptions" class="h-full w-full"></div>
        </app-analytics-chart-card>
    `,
})
export class ProviderPerformanceDisputesChartComponent {
    private readonly _capitalizeFirstPipe = inject(CapitalizeFirstPipe);

    @Input()
    set data(value: IDisputeAnalyticsChartData[]) {
        this.disputesOptionsData = value ?? [];
        this._setDisputesOptions();
    }

    disputesOptions: EChartsOption = {};
    disputesOptionsData: IDisputeAnalyticsChartData[] = [];

    private _setDisputesOptions() {
        const months: string[] = [
            "Jan", "Feb", "Mar", "Apr", "May", "Jun",
            "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
        ];

        const seriesData = [
            { name: 'Spam', data: new Array(12).fill(0) as number[] },
            { name: 'Inappropriate', data: new Array(12).fill(0) as number[] },
            { name: 'Harassment', data: new Array(12).fill(0) as number[] },
            { name: 'Other', data: new Array(12).fill(0) as number[] }
        ];

        this.disputesOptionsData.forEach(d => {
            const monthIndex = months.findIndex(m => m === d.month);
            seriesData[0].data[monthIndex] = d.spam;
            seriesData[1].data[monthIndex] = d.inappropriate;
            seriesData[2].data[monthIndex] = d.harassment;
            seriesData[3].data[monthIndex] = d.other;
        });

        const greenShades = [
            { start: ANALYTICS_COLORS.providerDeep, end: '#14532d' },
            { start: ANALYTICS_COLORS.provider, end: ANALYTICS_COLORS.providerStrong },
            { start: '#a3e635', end: '#84cc16' },
            { start: '#2dd4bf', end: '#0d9488' }
        ];

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
                    itemStyle: { opacity: 1, shadowBlur: 6, shadowColor: 'rgba(0, 0, 0, 0.2)' }
                }
            }))
        };
    }
}