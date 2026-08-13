import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxEchartsModule } from 'ngx-echarts';
import type { EChartsOption } from 'echarts';
import { IPeakServiceTime } from '../../../../../core/models/analytics.model';
import { AnalyticsChartCardComponent } from '../../analytics/analytics-chart-card/analytics-chart-card.component';

@Component({
    selector: 'app-peak-service-times',
    standalone: true,
    imports: [CommonModule, NgxEchartsModule, AnalyticsChartCardComponent],
    template: `
        <app-analytics-chart-card
            title="Peak Service Times"
            subtitle="Shows when your services are most in demand"
            [height]="'large'"
            [hasData]="peakServiceData.length > 0"
            emptyTitle="No demand data"
            emptyMessage="Peak service times will appear here once bookings are recorded.">
            <div echarts [options]="chartOption" class="h-full w-full"></div>
        </app-analytics-chart-card>
    `,
})
export class PeakServiceTimesComponent {
    @Input()
    set data(value: IPeakServiceTime[]) {
        this.peakServiceData = value ?? [];
        this.chartOption = this._getChartOption(this.peakServiceData);
    }

    peakServiceData: IPeakServiceTime[] = [];
    chartOption!: EChartsOption;

    private readonly hours = Array.from({ length: 18 }, (_, i) => `${i + 6}:00`);

    private _getChartOption(data: IPeakServiceTime[]): EChartsOption {
        const hours = data.map(d => `${d.hour}:00`);
        const weekdayData = data.map(d => d.weekdayBookings);
        const weekendData = data.map(d => d.weekendBookings);

        return {
            tooltip: {
                trigger: 'axis',
                formatter: (params: any) => {
                    const d = params[0].dataIndex;
                    return `<strong>${hours[d]}</strong><br/>
                            Weekday Bookings: ${weekdayData[d]}<br/>
                            Weekend Bookings: ${weekendData[d]}`;
                },
                backgroundColor: '#333',
                textStyle: { color: '#fff' },
                padding: [8, 12]
            },
            legend: { data: ['Weekday', 'Weekend'], textStyle: { color: '#374151', fontWeight: 500 }, top: 10 },
            grid: { left: 50, right: 20, top: 60, bottom: 50 },
            xAxis: {
                type: 'category',
                data: this.hours,
                axisLabel: { color: '#374151', fontWeight: 500, rotate: 45 },
                axisLine: { lineStyle: { color: '#ccc' } }
            },
            yAxis: {
                type: 'value',
                name: 'Bookings',
                axisLabel: { color: '#374151', fontWeight: 500 },
                axisLine: { lineStyle: { color: '#ccc' } },
                splitLine: { lineStyle: { type: 'dashed', color: '#E5E7EB' } }
            },
            series: [
                {
                    name: 'Weekday',
                    type: 'line',
                    data: weekdayData,
                    smooth: true,
                    symbol: 'circle',
                    symbolSize: 6,
                    lineStyle: { color: '#3B82F6', width: 2 },
                    itemStyle: { color: '#3B82F6' }
                },
                {
                    name: 'Weekend',
                    type: 'line',
                    data: weekendData,
                    smooth: true,
                    symbol: 'circle',
                    symbolSize: 6,
                    lineStyle: { color: '#F59E0B', width: 2 },
                    itemStyle: { color: '#F59E0B' }
                }
            ]
        };
    }
}