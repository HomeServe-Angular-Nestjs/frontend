import { Component } from "@angular/core";
import { EChartsOption } from "echarts";
import { NgxEchartsModule } from "ngx-echarts";

@Component({
    selector: "app-revenue-monthly-growth-rate-chart",
    imports: [NgxEchartsModule],
    providers: [],
    template: `
      <div class="p-4 bg-white rounded-2xl shadow-md">
        <h2 class="text-lg font-semibold mb-3 text-gray-800">
          Monthly Growth Rate
        </h2>
        <div echarts [options]="growthOptions" class="h-80 w-full"></div>
      </div>
    `
})
export class RevenueMonthlyGrowthRateChartComponent {
    growthOptions: EChartsOption = {};
    constructor() {
        this.setGrowthRateChart();

    }
    private setGrowthRateChart() {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
        const revenue = [10000, 12000, 15000, 13000, 17000, 19000];
        const growth = [0, 20, 25, -13, 31, 12];

        this.growthOptions = {
            tooltip: {
                trigger: 'axis',
                formatter: (params: any) => {
                    const rev = params[0]?.value;
                    const gr = params[1]?.value;
                    const grColor = gr >= 0 ? '#16A34A' : '#DC2626';
                    return `
            <div>
              <strong>${params[0].axisValue}</strong><br/>
              Revenue: ₹${rev}<br/>
              <span style="color:${grColor}">Growth: ${gr}%</span>
            </div>
          `;
                }
            },
            legend: {
                data: ['Revenue', 'Growth Rate'],
                top: 10
            },
            grid: {
                left: '3%',
                right: '4%',
                bottom: '3%',
                containLabel: true
            },
            xAxis: [
                {
                    type: 'category',
                    data: months,
                    axisLine: { lineStyle: { color: '#ccc' } }
                }
            ],
            yAxis: [
                {
                    type: 'value',
                    name: 'Revenue (₹)',
                    position: 'left'
                },
                {
                    type: 'value',
                    name: 'Growth (%)',
                    position: 'right'
                }
            ],
            series: [
                {
                    name: 'Revenue',
                    type: 'bar',
                    data: revenue,
                    barWidth: '45%',
                    itemStyle: {
                        color: '#16A34A',
                        borderRadius: [6, 6, 0, 0]
                    }
                },
                {
                    name: 'Growth Rate',
                    type: 'line',
                    yAxisIndex: 1,
                    data: growth,
                    smooth: true,
                    lineStyle: { width: 3, color: '#4ADE80' },
                    itemStyle: {
                        color: (params: any) => (params.value >= 0 ? '#16A34A' : '#DC2626')
                    }
                }
            ]
        };
    }
}