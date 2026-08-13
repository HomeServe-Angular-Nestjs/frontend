import { Component, inject, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxEchartsModule } from 'ngx-echarts';
import type { EChartsOption } from 'echarts';
import { ILocationRevenue } from '../../../../../core/models/analytics.model';
import { InrCurrencyPipe } from '../../../../../core/pipes/inr-currency.pipe';
import { AnalyticsChartCardComponent } from '../../analytics/analytics-chart-card/analytics-chart-card.component';
import { ANALYTICS_COLORS } from '../../analytics/analytics.tokens';

@Component({
    selector: 'app-area-by-revenue',
    standalone: true,
    imports: [CommonModule, NgxEchartsModule, AnalyticsChartCardComponent],
    providers: [InrCurrencyPipe],
    template: `
        <app-analytics-chart-card
            title="Revenue by Location"
            subtitle="Identifies where your revenue originates geographically"
            [height]="'large'"
            [hasData]="locationData.length > 0"
            emptyTitle="No location data"
            emptyMessage="Revenue by location will appear here once bookings are recorded.">
            <div echarts [options]="chartOption" class="h-full w-full"></div>
        </app-analytics-chart-card>
    `,
})
export class RevenueByLocationComponent {
    private readonly _currency = inject(InrCurrencyPipe);

    @Input()
    set data(value: ILocationRevenue[]) {
        this.locationData = value ?? [];
        if (this.locationData.length) {
            this.chartOption = this.getChartOption(this.locationData);
        }
    }

    locationData: ILocationRevenue[] = [];
    chartOption!: EChartsOption;

    getChartOption(data: ILocationRevenue[]): EChartsOption {
        const sorted = [...data];

        const locations = sorted.map(d => d.locationName);
        const revenues = sorted.map(d => d.totalRevenue);
        const growthColors = sorted.map(d => d.changePct >= 0 ? ANALYTICS_COLORS.positive : ANALYTICS_COLORS.negative);
        const growthIcons = sorted.map(d => d.changePct >= 0 ? '↑' : '↓');

        return {
            tooltip: {
                trigger: 'axis',
                axisPointer: { type: 'shadow' },
                backgroundColor: '#222',
                borderColor: '#444',
                borderWidth: 1,
                padding: [4, 8],
                textStyle: { color: '#fff', fontSize: 11 },
                formatter: (params: any) => {
                    const idx = params[0].dataIndex;
                    const d = sorted[idx];
                    return `
          <div style="line-height:1.4">
            <strong>${d.locationName.split(',')[3] ?? d.locationName}</strong><br/>
            ${this._currency.transform(d.totalRevenue)}<br/>
            <span style="color:${growthColors[idx]}">${growthIcons[idx]} ${Math.abs(d.changePct)}%</span>
          </div>
        `;
                }
            },
            grid: { left: 130, right: 20, top: 30, bottom: 50 },
            xAxis: {
                type: 'value',
                name: 'Revenue (₹)',
                axisLabel: { color: '#555', fontWeight: 500, fontSize: 11 },
                splitLine: { lineStyle: { type: 'dashed', color: '#E5E7EB' } },
                nameTextStyle: { fontSize: 11, color: '#666' }
            },
            yAxis: {
                type: 'category',
                data: locations,
                inverse: true,
                axisLabel: {
                    color: '#444',
                    fontWeight: 500,
                    fontSize: 11,
                    formatter: (name: string) => name.split(',')[3] ?? name
                },
                axisLine: { show: false },
                axisTick: { show: false }
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
                        fontWeight: 500,
                        fontSize: 11
                    },
                    itemStyle: {
                        color: (params: any) => growthColors[params.dataIndex],
                        borderRadius: [0, 12, 12, 0],
                        shadowBlur: 6,
                        shadowColor: 'rgba(0,0,0,0.15)'
                    },
                    barCategoryGap: '60%'
                }
            ]
        };
    }
}