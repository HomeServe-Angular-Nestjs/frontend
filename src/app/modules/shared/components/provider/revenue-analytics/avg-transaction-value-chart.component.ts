import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxEchartsModule } from 'ngx-echarts';
import type { EChartsOption } from 'echarts';

@Component({
    selector: 'app-revenue-top-sources-chart',
    imports: [CommonModule, NgxEchartsModule],
    providers: [],
    template: `
    <div class="bg-white p-5 rounded-2xl shadow-md">
      <h2 class="text-lg font-semibold mb-3 text-gray-800">
        Top Services by Revenue
      </h2>
      <div echarts [options]="chartOptions" class="h-80 w-full"></div>
    </div>
  `
})
export class RevenueTopSourcesChartComponent {
    chartOptions: EChartsOption = {};
    services = [
        { name: 'Consulting', revenue: 48000, bookings: 120, avgValue: 400 },
        { name: 'Maintenance', revenue: 42000, bookings: 150, avgValue: 280 },
        { name: 'Support', revenue: 36000, bookings: 200, avgValue: 180 },
        { name: 'Training', revenue: 27000, bookings: 90, avgValue: 300 },
        { name: 'Implementation', revenue: 23000, bookings: 70, avgValue: 328 }
    ];
    constructor() {
        this.setChartOptions();
    }

    private setChartOptions() {

        this.chartOptions = {
            tooltip: {
                trigger: 'item',
                formatter: (params: any) => {
                    const service = this.services[params.dataIndex];
                    return `
            <div>
              <strong>${service.name}</strong><br/>
              Revenue: ₹${service.revenue.toLocaleString()}<br/>
              Bookings: ${service.bookings}<br/>
              Avg. Value: ₹${service.avgValue}
            </div>
          `;
                }
            },
            grid: {
                left: '3%',
                right: '5%',
                bottom: '3%',
                containLabel: true
            },
            xAxis: {
                type: 'value',
                axisLine: { lineStyle: { color: '#ccc' } },
                splitLine: { lineStyle: { color: '#eee' } }
            },
            yAxis: {
                type: 'category',
                data: this.services.map(s => s.name),
                axisLine: { lineStyle: { color: '#ccc' } },
                axisTick: { show: false },
                axisLabel: { color: '#374151', fontWeight: 500 }
            },
            series: [
                {
                    name: 'Revenue',
                    type: 'bar',
                    data: this.services.map(s => s.revenue),
                    barWidth: 18,
                    itemStyle: {
                        borderRadius: [0, 8, 8, 0],
                        color: '#16A34A'
                    },
                    label: {
                        show: true,
                        position: 'right',
                        formatter: (params: any) => `₹${params.value.toLocaleString()}`,
                        color: '#374151',
                        fontWeight: 500
                    }
                }
            ]
        };
    }
}
