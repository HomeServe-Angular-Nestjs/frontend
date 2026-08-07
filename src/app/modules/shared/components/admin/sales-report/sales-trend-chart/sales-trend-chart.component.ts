import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxEchartsModule } from 'ngx-echarts';
import * as echarts from 'echarts/core';
import { GridComponent, LegendComponent, TitleComponent, TooltipComponent } from 'echarts/components';
import { BarChart, LineChart } from 'echarts/charts';
import { CanvasRenderer } from 'echarts/renderers';
import { provideEchartsCore } from 'ngx-echarts';
import { EChartsOption, graphic } from 'echarts';

import { ISalesTrendPoint } from '../../../../../../core/models/sales-report.model';
import { AdminChartCardComponent } from '../../../../partials/sections/admin/chart-card/admin-chart-card.component';

echarts.use([TitleComponent, TooltipComponent, GridComponent, LegendComponent, LineChart, BarChart, CanvasRenderer]);

@Component({
    selector: 'app-admin-sales-trend-chart',
    standalone: true,
    imports: [CommonModule, NgxEchartsModule, AdminChartCardComponent],
    providers: [provideEchartsCore({ echarts })],
    templateUrl: './sales-trend-chart.component.html',
})
export class AdminSalesTrendChartComponent {
    @Input() trend: ISalesTrendPoint[] = [];
    @Input() loading = false;

    options: EChartsOption = {};

    ngOnChanges(): void {
        this._setChart();
    }

    private _setChart(): void {
        const labels = this.trend.map((t) => t.label);
        const revenue = this.trend.map((t) => t.revenue);
        const bookings = this.trend.map((t) => t.bookings);

        this.options = {
            color: [],
            tooltip: {
                trigger: 'axis',
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                borderColor: '#e2e8f0',
                borderRadius: 12,
                axisPointer: { type: 'shadow' },
            },
            legend: { top: 0, textStyle: { color: '#64748b' } },
            grid: { top: '16%', left: '3%', right: '4%', bottom: '5%', containLabel: true },
            xAxis: {
                type: 'category',
                data: labels,
                axisTick: { show: false },
                axisLine: { lineStyle: { color: '#f1f5f9' } },
                axisLabel: { color: '#94a3b8', fontSize: 11, fontWeight: 600, margin: 15 },
            },
            yAxis: [
                {
                    type: 'value',
                    name: 'Revenue',
                    splitLine: { lineStyle: { type: 'dashed', color: '#f1f5f9' } },
                    axisLabel: {
                        color: '#94a3b8',
                        fontSize: 11,
                        formatter: (value: number) => (value >= 1000 ? `₹${value / 1000}k` : `₹${value}`),
                    },
                },
                {
                    type: 'value',
                    name: 'Bookings',
                    splitLine: { show: false },
                    axisLabel: { color: '#94a3b8', fontSize: 11 },
                },
            ],
            series: [
                {
                    name: 'Revenue',
                    type: 'line',
                    showSymbol: true,
                    symbol: 'circle',
                    symbolSize: 8,
                    smooth: true,
                    data: revenue,
                    lineStyle: { color: '#6366f1', width: 3 },
                    itemStyle: { color: '#6366f1', borderWidth: 2, borderColor: '#fff' },
                    areaStyle: {
                        color: new graphic.LinearGradient(0, 0, 0, 1, [
                            { offset: 0, color: 'rgba(99, 102, 241, 0.2)' },
                            { offset: 1, color: 'rgba(99, 102, 241, 0)' },
                        ]),
                    },
                },
                {
                    name: 'Bookings',
                    type: 'bar',
                    yAxisIndex: 1,
                    barWidth: 12,
                    itemStyle: { color: '#c7d2fe', borderRadius: [4, 4, 0, 0] },
                    data: bookings,
                },
            ],
        };
    }
}