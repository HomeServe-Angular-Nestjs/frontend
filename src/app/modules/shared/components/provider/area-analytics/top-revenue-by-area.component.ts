import { Component, inject, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxEchartsModule } from 'ngx-echarts';
import type { EChartsOption } from 'echarts';
import { ITopAreaRevenue } from '../../../../../core/models/analytics.model';
import { InrCurrencyPipe } from '../../../../../core/pipes/inr-currency.pipe';
import { AnalyticsChartCardComponent } from '../../analytics/analytics-chart-card/analytics-chart-card.component';
import { ANALYTICS_COLORS } from '../../analytics/analytics.tokens';

@Component({
    selector: 'app-top-areas-revenue',
    imports: [CommonModule, NgxEchartsModule, AnalyticsChartCardComponent],
    providers: [InrCurrencyPipe],
    template: `
        <app-analytics-chart-card
            title="Top Performing Areas"
            subtitle="Ranked by total revenue for quick decision-making"
            [height]="'large'"
            [hasData]="topAreaData.length > 0"
            emptyTitle="No area data"
            emptyMessage="Top performing areas will appear here once bookings are recorded.">
            <div echarts [options]="chartOption" class="h-full w-full"></div>
        </app-analytics-chart-card>
    `,
})
export class TopAreasRevenueComponent {
    private readonly _currency = inject(InrCurrencyPipe);

    @Input()
    set data(value: ITopAreaRevenue[]) {
        this.topAreaData = value ?? [];
        this.chartOption = this.getChartOption(this.topAreaData);
    }

    topAreaData: ITopAreaRevenue[] = [];
    chartOption!: EChartsOption;

    getChartOption(data: ITopAreaRevenue[]): EChartsOption {
        const locations = data.map(d => d.locationName);
        const revenues = data.map(d => d.totalRevenue);
        const growthIcons = data.map(d => d.changePct >= 0 ? '↑' : '↓');
        const growthColors = data.map(d => d.changePct >= 0 ? ANALYTICS_COLORS.positive : ANALYTICS_COLORS.negative);

        return {
            tooltip: {
                trigger: 'axis',
                axisPointer: { type: 'shadow' },
                formatter: (params: any) => {
                    const idx = params[0].dataIndex;
                    return `<strong>${locations[idx]}</strong><br/>
                  Revenue: ${this._currency.transform(revenues[idx])}<br/>
                  Change: <span style="color:${growthColors[idx]}">${growthIcons[idx]} ${Math.abs(data[idx].changePct)}%</span>`;
                },
                backgroundColor: '#333',
                textStyle: { color: '#fff', fontSize: 12 },
                padding: [4, 8]
            },
            grid: { left: 120, right: 20, top: 50, bottom: 50 },
            xAxis: {
                type: 'value',
                name: 'Revenue (₹)',
                axisLine: { lineStyle: { color: ANALYTICS_COLORS.axis } },
                axisLabel: { color: ANALYTICS_COLORS.text, fontWeight: 500 },
                splitLine: { lineStyle: { type: 'dashed', color: ANALYTICS_COLORS.grid } },
            },
            yAxis: {
                type: 'category',
                data: locations,
                inverse: true,
                axisLine: { lineStyle: { color: ANALYTICS_COLORS.axis } },
                axisLabel: {
                    color: ANALYTICS_COLORS.text,
                    fontWeight: 500,
                    formatter: (text: string) => text.split(',')[3] ?? text
                },
            },
            series: [
                {
                    type: 'bar',
                    data: revenues,
                    barWidth: 30,
                    label: {
                        show: true,
                        position: 'right',
                        formatter: (params: any) => {
                            const idx = params.dataIndex;
                            return `${this._currency.transform(params.value)} ${growthIcons[idx]}`;
                        },
                        color: '#111',
                        fontWeight: 600
                    },
                    itemStyle: {
                        color: (params: any) => growthColors[params.dataIndex],
                        borderRadius: 6,
                        shadowBlur: 10,
                        shadowColor: 'rgba(0,0,0,0.2)'
                    },
                    barCategoryGap: '40%'
                }
            ]
        };
    }
}