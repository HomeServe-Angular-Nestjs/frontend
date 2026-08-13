import { Component, inject, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxEchartsModule } from 'ngx-echarts';
import type { EChartsOption } from 'echarts';
import { IRevenueCompositionData } from '../../../../../core/models/analytics.model';
import { InrCurrencyPipe } from '../../../../../core/pipes/inr-currency.pipe';
import { AnalyticsChartCardComponent } from '../../analytics/analytics-chart-card/analytics-chart-card.component';
import { ANALYTICS_SERIES } from '../../analytics/analytics.tokens';

@Component({
    selector: 'app-revenue-composition-chart',
    imports: [CommonModule, NgxEchartsModule, AnalyticsChartCardComponent],
    providers: [InrCurrencyPipe],
    template: `
        <app-analytics-chart-card
            title="Revenue Composition"
            subtitle="Revenue split by service category"
            [height]="'standard'"
            [hasData]="compositionChartData.length > 0"
            emptyTitle="No composition data"
            emptyMessage="Revenue composition will appear here once transactions are recorded.">
            <div echarts [options]="compositionOptions" class="h-full w-full"></div>
        </app-analytics-chart-card>
    `,
})
export class RevenueCompositionChartsComponent {
    private readonly _currency = inject(InrCurrencyPipe);

    @Input()
    set data(value: IRevenueCompositionData[]) {
        this.compositionChartData = value ?? [];
        this.setRevenueCompositionChart();
    }

    compositionOptions: EChartsOption = {};
    compositionChartData: IRevenueCompositionData[] = [];

    private setRevenueCompositionChart() {
        const data = this.compositionChartData.map(item => ({
            name: item.category,
            value: item.totalRevenue
        }));

        this.compositionOptions = {
            tooltip: {
                trigger: 'item',
                formatter: (params) => {
                    const item = Array.isArray(params) ? params[0] : params;
                    return `${(item as any)?.name ?? ''}: ${this._currency.transform((item as any)?.value ?? 0)}`;
                },
                textStyle: { fontSize: 12 }
            },
            legend: {
                orient: 'vertical',
                left: 'left',
                textStyle: { color: '#374151' }
            },
            series: [
                {
                    name: 'Revenue Source',
                    type: 'pie',
                    radius: ['45%', '70%'],
                    avoidLabelOverlap: false,
                    itemStyle: { borderRadius: 10, borderColor: '#fff', borderWidth: 2 },
                    label: { show: false, position: 'center' },
                    emphasis: {
                        label: { show: true, fontSize: 16, fontWeight: 'bold' }
                    },
                    labelLine: { show: false },
                    data,
                    color: ANALYTICS_SERIES
                }
            ],
            emphasis: {
                itemStyle: {
                    shadowBlur: 10,
                    shadowOffsetX: 0,
                    shadowColor: 'rgba(0,0,0,0.3)'
                },
                label: { show: true, fontSize: 14, fontWeight: 'bold' }
            },
            label: {
                show: true,
                formatter: (params: any) => `${params.name}: ${this._currency.transform(params.value)}\n(${params.percent}%)`,
                fontSize: 12,
                color: '#374151'
            },
            labelLine: { show: true }
        };
    }
}