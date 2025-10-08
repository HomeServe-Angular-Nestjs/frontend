import { Component } from "@angular/core";
import { NgxEchartsModule } from "ngx-echarts";
import { EChartsOption } from 'echarts';

@Component({
    selector: 'app-performance-bookings',
    imports: [NgxEchartsModule],
    template: `
        <div class="bg-white rounded-2xl shadow-lg p-6 border border-slate-100 hover:shadow-xl transition-shadow duration-300">
      <div class="flex items-center justify-between mb-6">
        <div>
          <h2 class="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <span class="text-3xl">📊</span>
            Bookings Overview
          </h2>
          <p class="text-sm text-slate-500 mt-1">Monthly performance tracking</p>
        </div>
        <div class="flex gap-2">
          <span class="px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">+12% vs last month</span>
        </div>
      </div>
      <div echarts [options]="barChartOptions" class="h-80"></div>
    </div> G
    `,
})
export class ProviderPerformanceBookingChartComponent {
    barChartOptions: EChartsOption = {
        tooltip: {
            trigger: 'axis',
            backgroundColor: 'rgba(255,255,255,0.95)',
            borderColor: '#e5e7eb',
            borderWidth: 1,
            textStyle: { color: '#374151' },
            axisPointer: { type: 'shadow', shadowStyle: { color: 'rgba(99, 102, 241, 0.05)' } }
        },
        legend: {
            data: ['Completed', 'Cancelled'],
            top: 0,
            textStyle: { fontSize: 13, color: '#64748b' }
        },
        grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            top: '15%',
            containLabel: true
        },
        xAxis: {
            type: 'category',
            data: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'],
            axisLine: { lineStyle: { color: '#e5e7eb' } },
            axisLabel: { color: '#64748b', fontSize: 12 }
        },
        yAxis: {
            type: 'value',
            name: 'Bookings',
            nameTextStyle: { color: '#64748b', fontSize: 12 },
            axisLine: { show: false },
            splitLine: { lineStyle: { color: '#f1f5f9', type: 'dashed' } },
            axisLabel: { color: '#64748b' }
        },
        series: [
            {
                name: 'Completed',
                type: 'bar',
                data: [25, 40, 32, 50, 44, 60, 72, 5, 8, 6, 10, 7],
                itemStyle: {
                    color: {
                        type: 'linear',
                        x: 0, y: 0, x2: 0, y2: 1,
                        colorStops: [
                            { offset: 0, color: '#10b981' },
                            { offset: 1, color: '#059669' }
                        ]
                    },
                    borderRadius: [8, 8, 0, 0]
                },
                barWidth: '40%'
            },
            {
                name: 'Cancelled',
                type: 'line',
                data: [5, 8, 6, 10, 7, 9, 12, 5, 7, 12, 7, 23],
                smooth: true,
                lineStyle: { width: 3, color: '#ef4444' },
                itemStyle: { color: '#ef4444' },
                symbolSize: 8,
                symbol: 'circle'
            }
        ]
    };


}