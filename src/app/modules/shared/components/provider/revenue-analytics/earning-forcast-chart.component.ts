import { Component, OnInit } from '@angular/core';
import * as echarts from 'echarts';
import { NgxEchartsModule } from 'ngx-echarts';

@Component({
    selector: 'app-revenue-earnings-forecast-chart',
    imports: [NgxEchartsModule],
    providers: [],
    template: `
     <div class="p-4 bg-white rounded-2xl shadow-md">
        <h2 class="text-lg font-semibold mb-3 text-gray-800">
          Monthly Growth Rate
        </h2>
        <div echarts  [options]="chartOption" class="h-80 w-full"></div>
      </div>
    `
})
export class RevenueEarningsForecastChartComponent implements OnInit {
    chartOption: echarts.EChartsOption = {};

    ngOnInit(): void {
        this._setChartOptions();
    }

    private _setChartOptions() {
        const months = ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const historical = [12000, 15000, 18000, 20000, 23000, 25000];
        const lastThreeAvg = (historical.slice(-3).reduce((a, b) => a + b, 0) / 3);
        const forecast = [
            lastThreeAvg * 1.05, // slight growth
            lastThreeAvg * 1.08,
            lastThreeAvg * 1.12
        ];

        const allRevenue = [...historical, ...forecast];
        const forecastStartIndex = historical.length - 1;

        this.chartOption = {
            title: {
                text: 'Earnings Forecast',
                left: 'center',
                top: 10,
                textStyle: { fontSize: 16, fontWeight: 'bold' }
            },
            tooltip: {
                trigger: 'axis',
                formatter: (params: any) => {
                    const data = params[0];
                    const isForecast = data.dataIndex >= forecastStartIndex;
                    return `
            <strong>${data.name}</strong><br/>
            Revenue: ₹${data.value.toLocaleString()}<br/>
            ${isForecast ? '<span style="color:#888">(Forecasted)</span>' : ''}
          `;
                },
                backgroundColor: 'rgba(255,255,255,0.9)',
                borderColor: '#ddd',
                borderWidth: 1,
                textStyle: { color: '#333' }
            },
            grid: {
                top: 60,
                left: '5%',
                right: '5%',
                bottom: '10%',
                containLabel: true
            },
            xAxis: {
                type: 'category',
                boundaryGap: false,
                data: months,
                axisLine: { lineStyle: { color: '#ccc' } },
                axisLabel: { color: '#666' }
            },
            yAxis: {
                type: 'value',
                axisLine: { show: false },
                splitLine: { lineStyle: { color: '#eee' } },
                axisLabel: { formatter: '₹{value}' }
            },
            series: [
                {
                    name: 'Revenue',
                    type: 'line',
                    smooth: true,
                    data: allRevenue,
                    symbol: 'circle',
                    symbolSize: 6,
                    lineStyle: {
                        color: '#4f46e5',
                        width: 3,
                        type: 'solid'
                    },
                    areaStyle: {
                        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                            { offset: 0, color: 'rgba(79,70,229,0.3)' },
                            { offset: 1, color: 'rgba(79,70,229,0)' }
                        ])
                    },
                    markArea: {
                        data: [
                            [
                                { name: 'Forecast Period', xAxis: months[forecastStartIndex] },
                                { xAxis: months[months.length - 1] }
                            ]
                        ],
                        itemStyle: {
                            color: 'rgba(200,200,200,0.15)'
                        },
                        label: { color: '#555' }
                    }
                }
            ]
        };
    }
}
