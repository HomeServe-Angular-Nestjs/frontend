import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxEchartsModule } from 'ngx-echarts';
import type { EChartsOption } from 'echarts';
import { IServiceDemandData } from '../../../../../core/models/analytics.model';
import { AnalyticsChartCardComponent } from '../../analytics/analytics-chart-card/analytics-chart-card.component';

@Component({
    selector: 'app-area-service-demand-chart',
    standalone: true,
    imports: [CommonModule, NgxEchartsModule, AnalyticsChartCardComponent],
    template: `
        <app-analytics-chart-card
            title="Service Demand Heatmap"
            subtitle="Visualizes when services are most in demand throughout the week"
            [height]="'large'"
            [hasData]="serviceDemandData.length > 0"
            emptyTitle="No demand data"
            emptyMessage="Service demand will appear here once bookings are recorded.">
            <div echarts [options]="chartOption" class="h-full w-full"></div>
        </app-analytics-chart-card>
    `,
})
export class ServiceDemandHeatmapComponent {
    @Input()
    set data(value: IServiceDemandData[]) {
        this.serviceDemandData = value ?? [];
        this.setupChart(this.serviceDemandData);
    }

    serviceDemandData: IServiceDemandData[] = [];
    chartOption!: EChartsOption;

    private readonly days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    private readonly hours = Array.from({ length: 18 }, (_, i) => `${i + 6}:00`);

    private setupChart(rawData: { day: string; hour: string; count: number }[]) {
        const data = rawData.map(d => [
            this.days.indexOf(d.day),
            this.hours.indexOf(d.hour),
            d.count
        ]);

        this.chartOption = {
            tooltip: {
                position: 'top',
                backgroundColor: '#1B5E20',
                textStyle: { color: '#fff' },
                borderWidth: 0,
                formatter: ({ value }: any) =>
                    `<b>${this.days[value[0]]}, ${this.hours[value[1]]}</b><br/>Bookings: ${value[2]}`
            },
            grid: { top: 0, left: 70, right: 30, bottom: 90 },
            xAxis: {
                type: 'category',
                data: this.days,
                splitArea: { show: true },
                axisLabel: { color: '#374151', fontWeight: 600 },
                axisLine: { lineStyle: { color: '#ccc' } }
            },
            yAxis: {
                type: 'category',
                data: this.hours,
                splitArea: { show: true },
                axisLabel: { color: '#374151', fontWeight: 600 },
                axisLine: { lineStyle: { color: '#ccc' } }
            },
            visualMap: {
                min: 0,
                max: Math.max(...data.map(d => d[2]), 1),
                calculable: true,
                orient: 'horizontal',
                left: 'center',
                bottom: 20,
                text: ['Max', 'Min'],
                textGap: 12,
                textStyle: { color: '#374151', fontWeight: 600 },
                inRange: { color: ['#E8F5E9', '#1B5E20'] }
            },
            series: [{
                name: 'Service Demand',
                type: 'heatmap',
                data,
                label: { show: false },
                emphasis: {
                    itemStyle: {
                        shadowBlur: 10,
                        shadowColor: 'rgba(0, 0, 0, 0.4)'
                    }
                }
            }]
        };
    }
}