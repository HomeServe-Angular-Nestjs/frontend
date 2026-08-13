import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxEchartsModule } from 'ngx-echarts';
import { EChartsOption } from 'echarts';
import { IResponseTimeChartData } from '../../../../../../core/models/analytics.model';
import { AnalyticsChartCardComponent } from "../../../analytics/analytics-chart-card/analytics-chart-card.component";
import { ANALYTICS_COLORS } from '../../../analytics/analytics.tokens';

@Component({
    selector: 'app-performance-response-time',
    standalone: true,
    imports: [CommonModule, NgxEchartsModule, AnalyticsChartCardComponent],
    template: `
        <app-analytics-chart-card
            title="Response Time Distribution"
            subtitle="Monthly performance metrics"
            [height]="'small'"
            [hasData]="responseTimeData.length > 0"
            emptyTitle="No response data"
            emptyMessage="Response time distribution will appear here once requests are recorded.">
            <div echarts [options]="responseTimeOptions" class="h-full w-full"></div>
        </app-analytics-chart-card>
    `,
})
export class ProviderPerformanceResponseTimeChartComponent {
    @Input()
    set data(value: IResponseTimeChartData[]) {
        this.responseTimeData = value ?? [];
        this._setResponseTimeOptions();
    }

    responseTimeOptions: EChartsOption = {};
    responseTimeData: IResponseTimeChartData[] = [];

    private _setResponseTimeOptions() {
        const labels = ["< 1 min", "1–10 min", "10–60 min", "1–24 hrs", "> 1 day"];
        const colorMap: Record<string, string> = {
            "< 1 min": ANALYTICS_COLORS.provider,
            "1–10 min": ANALYTICS_COLORS.newCustomers,
            "10–60 min": "#a3e635",
            "1–24 hrs": "#84cc16",
            "> 1 day": ANALYTICS_COLORS.providerDeep,
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
                itemStyle: { borderRadius: 8, borderColor: '#fff', borderWidth: 3 },
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