import { Component, OnInit } from '@angular/core';
import * as echarts from 'echarts';
import { NgxEchartsModule } from 'ngx-echarts';

@Component({
    selector: 'app-revenue-repeat-vs-new-customers-chart',
    imports: [NgxEchartsModule],
    providers: [],
    template: `
     <div class="p-4 bg-white rounded-2xl shadow-md">
        <h2 class="text-lg font-semibold mb-3 text-gray-800">
          Monthly Growth Rate
        </h2>
        <div echarts [options]="chartOption" class="h-80 w-full"></div>
      </div>
    `
})
export class RevenueRepeatVsNewCustomersChartComponent implements OnInit {
    chartOption: echarts.EChartsOption = {};

    ngOnInit(): void {
        this._setChartOptions();
    }

    private _setChartOptions() {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
        const newClients = [120, 150, 180, 130, 160, 200];
        const returningClients = [80, 100, 110, 90, 120, 140];

        this.chartOption = {
            title: {
                text: 'Repeat vs New Customers',
                left: 'center',
                top: 10,
                textStyle: { fontSize: 16, fontWeight: 'bold' }
            },
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
                icon: 'roundRect'
            },
            grid: {
                top: 60,
                left: '3%',
                right: '4%',
                bottom: '10%',
                containLabel: true
            },
            xAxis: {
                type: 'category',
                data: months,
                axisTick: { alignWithLabel: true },
                axisLine: { lineStyle: { color: '#ccc' } }
            },
            yAxis: {
                type: 'value',
                name: 'Customers',
                axisLine: { show: false },
                splitLine: { lineStyle: { color: '#eee' } }
            },
            series: [
                {
                    name: 'New Clients',
                    type: 'bar',
                    stack: 'total',
                    emphasis: { focus: 'series' },
                    itemStyle: { color: '#00bcd4', borderRadius: [4, 4, 0, 0] },
                    data: newClients
                },
                {
                    name: 'Returning Clients',
                    type: 'bar',
                    stack: 'total',
                    emphasis: { focus: 'series' },
                    itemStyle: { color: '#8bc34a', borderRadius: [4, 4, 0, 0] },
                    data: returningClients
                }
            ]
        };
    }
}
