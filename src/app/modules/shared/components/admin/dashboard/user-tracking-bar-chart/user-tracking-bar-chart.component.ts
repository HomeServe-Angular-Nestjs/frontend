import { Component, OnInit } from '@angular/core';
import { EChartsOption } from 'echarts';
import { NgxEchartsModule } from 'ngx-echarts';


@Component({
    selector: 'app-admin-user-tracking-bar-chart',
    templateUrl: './user-tracking-bar-chart.component.html',
    imports: [NgxEchartsModule]
})
export class UserTrackingBarChartComponent implements OnInit {
    chartOptions: EChartsOption = {};

    ngOnInit(): void {
        this.chartOptions = {
            title: {
                text: 'User Stats',
                left: 'center'
            },
            tooltip: {
                trigger: 'axis',
                axisPointer: { type: 'shadow' },
                formatter: (params: any) => {
                    const [provider, customer] = params;
                    return `
        <b>${provider.axisValue}</b><br/>
        🟦 Providers: ${provider.value}<br/>
        🟨 Customers: ${customer.value}
      `;
                }
            },
            legend: {
                data: ['Providers', 'Customers'],
                top: 30
            },
            xAxis: {
                type: 'category',
                data: ['New', 'Total', 'Active'],
                axisTick: { alignWithLabel: true }
            },
            yAxis: {
                type: 'value'
            },
            series: [
                {
                    name: 'Providers',
                    type: 'bar',
                    stack: 'total',
                    label: { show: true, position: 'inside' },
                    itemStyle: {
                        color: '#4f81bd', // blue
                        borderRadius: [0, 0, 10, 10]
                    },
                    barWidth: 50,
                    data: [30, 100, 80] // example data for providers
                },
                {
                    name: 'Customers',
                    type: 'bar',
                    stack: 'total',
                    label: { show: true, position: 'inside' },
                    itemStyle: {
                        color: '#fcd34d', // yellow
                        borderRadius: [10, 10, 0, 0]
                    },
                    barWidth: 50,
                    data: [50, 200, 150] // example data for customers
                }
            ]
        };

    }
}
