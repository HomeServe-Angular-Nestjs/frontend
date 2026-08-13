import { Component, inject, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EChartsOption } from 'echarts';
import { NgxEchartsModule } from 'ngx-echarts';
import { TopLevelFormatterParams } from 'echarts/types/dist/shared';
import { IRevenueMonthlyGrowthRateData } from '../../../../../core/models/analytics.model';
import { InrCurrencyPipe } from '../../../../../core/pipes/inr-currency.pipe';
import { AnalyticsChartCardComponent } from '../../analytics/analytics-chart-card/analytics-chart-card.component';
import { ANALYTICS_COLORS } from '../../analytics/analytics.tokens';

@Component({
    selector: 'app-revenue-earnings-forecast-chart',
    imports: [CommonModule, NgxEchartsModule, AnalyticsChartCardComponent],
    providers: [InrCurrencyPipe],
    template: `
        <app-analytics-chart-card
            title="Monthly Revenue Growth"
            subtitle="Revenue and month-over-month growth rate"
            [height]="'standard'"
            [hasData]="chartData.length > 0"
            emptyTitle="No growth data"
            emptyMessage="Monthly growth will appear here once data is available.">
            <div echarts [options]="chartOptions" class="h-full w-full"></div>
        </app-analytics-chart-card>
    `,
})
export class RevenueEarningsForecastChartComponent {
    private readonly _currency = inject(InrCurrencyPipe);

    @Input()
    set data(value: IRevenueMonthlyGrowthRateData[]) {
        this.chartData = value ?? [];
        this._setChartOptions();
    }

    chartOptions: EChartsOption = {};
    chartData: IRevenueMonthlyGrowthRateData[] = [];

    private _setChartOptions() {
        const months = this.chartData.map(d => d.month);
        const revenue = this.chartData.map(d => d.totalRevenue);
        const growth = this.chartData.map(d => d.growthRate);

        const primaryGreen = ANALYTICS_COLORS.provider;
        const growthPositive = ANALYTICS_COLORS.positive;
        const growthNegative = ANALYTICS_COLORS.negative;

        this.chartOptions = {
            tooltip: {
                trigger: 'axis',
                formatter: (params: TopLevelFormatterParams) => {
                    const p = Array.isArray(params) ? params : [params];
                    const rev = p[0]?.value ?? 0;
                    const gr = p[1]?.value;
                    const axis = (p[0] as any)?.axisValue ?? '';
                    const grNum = typeof gr === 'number' ? gr : Number(gr);
                    const grColor = !isNaN(grNum) && grNum >= 0 ? growthPositive : growthNegative;

                    return `
                    <div>
                        <strong>${axis}</strong><br/>
                        Revenue: ${this._currency.transform(rev)}<br/>
                        ${!isNaN(grNum) ? `<span style="color:${grColor}">Growth: ${grNum}%</span>` : ''}
                    </div>
                `;
                }
            },
            legend: { data: ['Revenue', 'Growth Rate'], top: 10 },
            grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
            xAxis: {
                type: 'category',
                data: months,
                axisLine: { lineStyle: { color: ANALYTICS_COLORS.axis } },
                axisLabel: { color: ANALYTICS_COLORS.text },
            },
            yAxis: [
                {
                    type: 'value',
                    name: 'Revenue (₹)',
                    position: 'left',
                    splitLine: { lineStyle: { type: 'dashed', color: ANALYTICS_COLORS.grid } }
                },
                {
                    type: 'value',
                    name: 'Growth (%)',
                    position: 'right',
                    splitLine: { lineStyle: { type: 'dashed', color: ANALYTICS_COLORS.grid } }
                }
            ],
            series: [
                {
                    name: 'Revenue',
                    type: 'bar',
                    data: revenue,
                    barWidth: '45%',
                    itemStyle: { color: primaryGreen, borderRadius: [6, 6, 0, 0] }
                },
                {
                    name: 'Growth Rate',
                    type: 'line',
                    yAxisIndex: 1,
                    data: growth,
                    smooth: true,
                    lineStyle: { width: 3, color: growthPositive },
                    itemStyle: {
                        color: (params: any) => (params.value >= 0 ? growthPositive : growthNegative)
                    }
                }
            ]
        };
    }
}