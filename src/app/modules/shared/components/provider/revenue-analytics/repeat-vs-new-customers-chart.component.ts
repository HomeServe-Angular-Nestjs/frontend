import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxEchartsModule } from 'ngx-echarts';
import { EChartsOption } from 'echarts';
import { INewOrReturningClientData } from '../../../../../core/models/analytics.model';
import { AnalyticsChartCardComponent } from '../../analytics/analytics-chart-card/analytics-chart-card.component';
import { ANALYTICS_COLORS } from '../../analytics/analytics.tokens';

@Component({
    selector: 'app-revenue-repeat-vs-new-customers-chart',
    imports: [CommonModule, NgxEchartsModule, AnalyticsChartCardComponent],
    template: `
        <app-analytics-chart-card
            title="Repeat vs New Customers"
            subtitle="Monthly split of new and returning clients"
            [height]="'small'"
            [hasData]="chartData.length > 0"
            emptyTitle="No customer data"
            emptyMessage="Customer breakdown will appear here once bookings are recorded.">
            <div echarts [options]="chartOption" class="h-full w-full"></div>
        </app-analytics-chart-card>
    `,
})
export class RevenueRepeatVsNewCustomersChartComponent {
    @Input()
    set data(value: INewOrReturningClientData[]) {
        this.chartData = value ?? [];
        this._setChartOptions();
    }

    chartOption: EChartsOption = {};
    chartData: INewOrReturningClientData[] = [];

    private _setChartOptions() {
        const m = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const months: string[] = [];
        const newClients: number[] = [];
        const returningClients: number[] = [];

        m.forEach(mth => {
            const monthData = this.chartData.find(d => d.month === mth);
            months.push(mth);
            newClients.push(monthData?.newClients ?? 0);
            returningClients.push(monthData?.returningClients ?? 0);
        });

        this.chartOption = {
            tooltip: {
                trigger: 'axis',
                axisPointer: { type: 'shadow' },
                formatter: (params: any) => {
                    const newC = params.find((p: any) => p.seriesName === 'New Clients');
                    const repeatC = params.find((p: any) => p.seriesName === 'Returning Clients');
                    const total = (newC?.value || 0) + (repeatC?.value || 0);
                    return `
            <strong>${params[0].name}</strong><br>
            New Clients: ${newC?.value}<br>
            Returning Clients: ${repeatC?.value}<br>
            <strong>Total: ${total}</strong>
          `;
                }
            },
            legend: {
                data: ['New Clients', 'Returning Clients'],
                bottom: 0,
                icon: 'roundRect',
                textStyle: { color: ANALYTICS_COLORS.text }
            },
            grid: {
                top: 20,
                left: '3%',
                right: '4%',
                bottom: '15%',
                containLabel: true
            },
            xAxis: {
                type: 'category',
                data: months,
                axisTick: { alignWithLabel: true },
                axisLine: { lineStyle: { color: ANALYTICS_COLORS.axis } },
                axisLabel: { color: ANALYTICS_COLORS.text },
            },
            yAxis: {
                type: 'value',
                name: 'Customers',
                axisLine: { show: false },
                splitLine: { lineStyle: { color: ANALYTICS_COLORS.grid } }
            },
            series: [
                {
                    name: 'New Clients',
                    type: 'bar',
                    stack: 'total',
                    emphasis: { focus: 'series' },
                    itemStyle: { color: ANALYTICS_COLORS.newCustomers, borderRadius: [4, 4, 0, 0] },
                    data: newClients
                },
                {
                    name: 'Returning Clients',
                    type: 'bar',
                    stack: 'total',
                    emphasis: { focus: 'series' },
                    itemStyle: { color: ANALYTICS_COLORS.returning, borderRadius: [4, 4, 0, 0] },
                    data: returningClients
                }
            ]
        };
    }
}