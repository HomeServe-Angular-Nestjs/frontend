import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxEchartsModule } from 'ngx-echarts';
import * as echarts from 'echarts/core';
import { LegendComponent, TitleComponent, TooltipComponent } from 'echarts/components';
import { PieChart } from 'echarts/charts';
import { CanvasRenderer } from 'echarts/renderers';
import { provideEchartsCore } from 'ngx-echarts';
import { EChartsOption } from 'echarts';

import { ISalesDistributionPoint } from '../../../../../../core/models/sales-report.model';
import { AdminChartCardComponent } from '../../../../partials/sections/admin/chart-card/admin-chart-card.component';

echarts.use([TitleComponent, TooltipComponent, LegendComponent, PieChart, CanvasRenderer]);

const PALETTE = ['#6366f1', '#a78bfa', '#f59e0b', '#10b981', '#ef4444', '#06b6d4', '#f43f5e', '#84cc16'];

@Component({
    selector: 'app-admin-sales-distribution-chart',
    standalone: true,
    imports: [CommonModule, NgxEchartsModule, AdminChartCardComponent],
    providers: [provideEchartsCore({ echarts })],
    templateUrl: './sales-distribution-chart.component.html',
})
export class AdminSalesDistributionChartComponent {
    @Input() distribution: ISalesDistributionPoint[] = [];
    @Input() loading = false;

    options: EChartsOption = {};

    ngOnChanges(): void {
        this._setChart();
    }

    private _setChart(): void {
        const data = this.distribution.map((d, i) => ({
            name: d.name,
            value: d.value,
            itemStyle: { color: PALETTE[i % PALETTE.length] },
        }));

        this.options = {
            tooltip: { trigger: 'item', backgroundColor: 'rgba(255, 255, 255, 0.9)', borderColor: '#e2e8f0', borderRadius: 12 },
            legend: {
                bottom: 0,
                type: 'scroll',
                textStyle: { color: '#64748b', fontSize: 11 },
            },
            series: [
                {
                    name: 'Sales Distribution',
                    type: 'pie',
                    radius: ['45%', '70%'],
                    center: ['50%', '45%'],
                    avoidLabelOverlap: true,
                    itemStyle: { borderRadius: 6, borderColor: '#fff', borderWidth: 2 },
                    label: {
                        show: true,
                        formatter: '{b}\n₹{c}',
                        color: '#475569',
                        fontSize: 11,
                        fontWeight: 600,
                    },
                    labelLine: { length: 12, length2: 8 },
                    data,
                },
            ],
        };
    }
}