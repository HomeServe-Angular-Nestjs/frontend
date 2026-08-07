import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxEchartsModule } from 'ngx-echarts';
import * as echarts from 'echarts/core';
import { GridComponent, LegendComponent, TitleComponent, TooltipComponent } from 'echarts/components';
import { BarChart } from 'echarts/charts';
import { CanvasRenderer } from 'echarts/renderers';
import { provideEchartsCore } from 'ngx-echarts';
import { EChartsOption, graphic } from 'echarts';

import { INamedMetric } from '../../../../../../core/models/sales-report.model';
import { AdminChartCardComponent } from '../../../../partials/sections/admin/chart-card/admin-chart-card.component';

echarts.use([TitleComponent, TooltipComponent, GridComponent, LegendComponent, BarChart, CanvasRenderer]);

@Component({
    selector: 'app-admin-sales-categories-chart',
    standalone: true,
    imports: [CommonModule, NgxEchartsModule, AdminChartCardComponent],
    providers: [provideEchartsCore({ echarts })],
    templateUrl: './sales-categories-chart.component.html',
    styleUrls: ['./sales-categories-chart.component.css'],
})
export class AdminSalesCategoriesChartComponent {
    @Input() professions: INamedMetric[] = [];
    @Input() categories: INamedMetric[] = [];
    @Input() loading = false;

    view: 'professions' | 'categories' = 'professions';

    options: EChartsOption = {};

    ngOnChanges(): void {
        this._setChart();
    }

    setView(view: 'professions' | 'categories'): void {
        this.view = view;
        this._setChart();
    }

    private _setChart(): void {
        const data = this.view === 'professions' ? this.professions : this.categories;
        const names = data.map((d) => d.name);
        const bookings = data.map((d) => d.bookings);
        const revenue = data.map((d) => d.revenue);

        this.options = {
            tooltip: { trigger: 'axis', backgroundColor: 'rgba(255, 255, 255, 0.9)', borderColor: '#e2e8f0', borderRadius: 12 },
            legend: { top: 0, textStyle: { color: '#64748b' } },
            grid: { top: '16%', left: '3%', right: '4%', bottom: '5%', containLabel: true },
            xAxis: {
                type: 'category',
                data: names,
                axisTick: { show: false },
                axisLine: { lineStyle: { color: '#f1f5f9' } },
                axisLabel: { color: '#94a3b8', fontSize: 11, fontWeight: 600, margin: 15, interval: 0, rotate: data.length > 4 ? 20 : 0 },
            },
            yAxis: [
                {
                    type: 'value',
                    name: 'Bookings',
                    splitLine: { lineStyle: { type: 'dashed', color: '#f1f5f9' } },
                    axisLabel: { color: '#94a3b8', fontSize: 11 },
                },
                {
                    type: 'value',
                    name: 'Revenue',
                    splitLine: { show: false },
                    axisLabel: {
                        color: '#94a3b8', fontSize: 11,
                        formatter: (value: number) => (value >= 1000 ? `₹${value / 1000}k` : `₹${value}`),
                    },
                },
            ],
            series: [
                {
                    name: 'Bookings',
                    type: 'bar',
                    barWidth: 18,
                    itemStyle: { color: '#6366f1', borderRadius: [6, 6, 0, 0] },
                    data: bookings,
                },
                {
                    name: 'Revenue',
                    type: 'bar',
                    yAxisIndex: 1,
                    barWidth: 18,
                    itemStyle: {
                        color: new graphic.LinearGradient(0, 0, 0, 1, [
                            { offset: 0, color: '#a78bfa' },
                            { offset: 1, color: '#ddd6fe' },
                        ]),
                        borderRadius: [6, 6, 0, 0],
                    },
                    data: revenue,
                },
            ],
        };
    }
}