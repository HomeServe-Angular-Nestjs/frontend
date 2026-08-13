import { Component, inject, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxEchartsModule } from 'ngx-echarts';
import type { EChartsOption } from 'echarts';
import { ITopServicesByRevenue } from '../../../../../core/models/analytics.model';
import { InrCurrencyPipe } from '../../../../../core/pipes/inr-currency.pipe';
import { AnalyticsChartCardComponent } from '../../analytics/analytics-chart-card/analytics-chart-card.component';
import { ANALYTICS_COLORS } from '../../analytics/analytics.tokens';

@Component({
    selector: 'app-revenue-top-services-chart',
    imports: [CommonModule, NgxEchartsModule, AnalyticsChartCardComponent],
    providers: [InrCurrencyPipe],
    template: `
        <app-analytics-chart-card
            title="Top Services by Revenue"
            subtitle="Best performing services ranked by revenue"
            [height]="'small'"
            [hasData]="chartData.length > 0"
            emptyTitle="No service data"
            emptyMessage="Top services will appear here once bookings are recorded.">
            <div echarts [options]="chartOptions" class="h-full w-full"></div>
        </app-analytics-chart-card>
    `,
})
export class RevenueTopServicesChartComponent {
    private readonly _currency = inject(InrCurrencyPipe);

    @Input()
    set data(value: ITopServicesByRevenue[]) {
        this.chartData = value ?? [];
        this.setChartOptions();
    }

    chartOptions: EChartsOption = {};
    chartData: ITopServicesByRevenue[] = [];

    private setChartOptions() {
        this.chartOptions = {
            tooltip: {
                trigger: 'item',
                formatter: (params: any) => {
                    const service = this.chartData[params.dataIndex];
                    return `
            <div>
              <strong>${service.service}</strong><br/>
              Revenue: ${this._currency.transform(service.revenue)}<br/>
              Bookings: ${service.totalBookings}<br/>
              Avg. Value: ${this._currency.transform(service.avgRevenue)}
            </div>
          `;
                }
            },
            grid: {
                left: '3%',
                right: '10%',
                bottom: '3%',
                containLabel: true
            },
            xAxis: {
                type: 'value',
                axisLine: { lineStyle: { color: ANALYTICS_COLORS.axis } },
                splitLine: { lineStyle: { color: ANALYTICS_COLORS.grid } }
            },
            yAxis: {
                type: 'category',
                data: this.chartData.map(s => s.service),
                axisLine: { lineStyle: { color: ANALYTICS_COLORS.axis } },
                axisTick: { show: false },
                axisLabel: {
                    color: ANALYTICS_COLORS.text,
                    fontWeight: 500,
                    formatter: function (value) {
                        const maxLength = 12;
                        return value.length > maxLength ? value.substring(0, maxLength) + '…' : value;
                    }
                }
            },
            series: [
                {
                    name: 'Revenue',
                    type: 'bar',
                    data: this.chartData.map(s => s.revenue),
                    barWidth: 18,
                    itemStyle: {
                        borderRadius: [0, 8, 8, 0],
                        color: ANALYTICS_COLORS.provider
                    },
                    label: {
                        show: true,
                        position: 'right',
                        formatter: (params: any) => `${this._currency.transform(params.value)}`,
                        color: ANALYTICS_COLORS.text,
                        fontWeight: 500
                    }
                }
            ]
        };
    }
}