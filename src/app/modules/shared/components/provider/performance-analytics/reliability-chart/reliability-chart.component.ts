import { Component } from '@angular/core';
import { NgxEchartsModule } from 'ngx-echarts';
import { EChartsOption } from 'echarts';

@Component({
    selector: 'app-provider-reliability',
    standalone: true,
    imports: [NgxEchartsModule],
    template: `
    <div class="bg-white rounded-2xl shadow-lg p-6 border border-slate-100 hover:shadow-xl transition-shadow duration-300">
      <div class="mb-6">
        <h2 class="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <span class="text-3xl">🎯</span>
          Reliability Metrics
        </h2>
        <p class="text-sm text-slate-500 mt-1">Service quality & punctuality indicators</p>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        <!-- Response Time Breakdown -->
        <div class="bg-gradient-to-br from-slate-50 to-blue-50 rounded-xl p-4 border border-slate-100">
          <h3 class="text-sm font-bold text-slate-700 mb-3 uppercase tracking-wide flex items-center gap-2">
            <span class="w-2 h-2 rounded-full bg-blue-500"></span>
            Response Time Distribution
          </h3>
          <div echarts [options]="responseTimeOptions" class="h-64"></div>
        </div>

        <!-- On-Time Arrival -->
        <div class="bg-gradient-to-br from-slate-50 to-green-50 rounded-xl p-4 border border-slate-100">
          <h3 class="text-sm font-bold text-slate-700 mb-3 uppercase tracking-wide flex items-center gap-2">
            <span class="w-2 h-2 rounded-full bg-green-500"></span>
            On-Time Arrival Rate
          </h3>
          <div echarts [options]="onTimeArrivalOptions" class="h-64"></div>
        </div>

        <!-- Disputes Breakdown -->
        <div class="lg:col-span-2 bg-gradient-to-br from-slate-50 to-orange-50 rounded-xl p-4 border border-slate-100">
          <h3 class="text-sm font-bold text-slate-700 mb-3 uppercase tracking-wide flex items-center gap-2">
            <span class="w-2 h-2 rounded-full bg-orange-500"></span>
            Disputes by Type (Last 10 Days)
          </h3>
          <div echarts [options]="disputesOptions" class="h-72"></div>
        </div>

      </div>
    </div>
  `
})
export class ProviderPerformanceReliabilityChartComponent {

    /** Response Time Breakdown */
    responseTimeOptions: EChartsOption = {
        tooltip: {
            trigger: 'item',
            formatter: '{b}: {c} responses ({d}%)',
            backgroundColor: 'rgba(255,255,255,0.95)',
            borderColor: '#e5e7eb',
            borderWidth: 1
        },
        legend: {
            orient: 'horizontal',
            bottom: 0,
            data: ['< 1 min', '< 10 min', '> 1 hr'],
            textStyle: { fontSize: 12, color: '#64748b' }
        },
        series: [{
            name: 'Responses',
            type: 'pie',
            radius: ['45%', '75%'],
            center: ['50%', '45%'],
            avoidLabelOverlap: false,
            itemStyle: {
                borderRadius: 8,
                borderColor: '#fff',
                borderWidth: 3
            },
            label: {
                show: true,
                position: 'outside',
                formatter: '{b}\n{d}%',
                fontSize: 11,
                color: '#475569',
                fontWeight: 'bold'
            },
            emphasis: {
                itemStyle: {
                    shadowBlur: 15,
                    shadowOffsetX: 0,
                    shadowColor: 'rgba(0,0,0,0.3)'
                }
            },
            data: [
                { value: 120, name: '< 1 min', itemStyle: { color: '#10b981' } },
                { value: 80, name: '< 10 min', itemStyle: { color: '#3b82f6' } },
                { value: 20, name: '> 1 hr', itemStyle: { color: '#ef4444' } }
            ]
        }]
    };

    /** On-Time Arrival Rate */
    onTimeArrivalOptions: EChartsOption = {
        tooltip: {
            trigger: 'axis',
            formatter: '{b}: {c}%',
            backgroundColor: 'rgba(255,255,255,0.95)',
            borderColor: '#e5e7eb',
            borderWidth: 1
        },
        grid: { left: '10%', right: '10%', top: '15%', bottom: '15%' },
        xAxis: {
            type: 'category',
            data: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            axisLine: { lineStyle: { color: '#e5e7eb' } },
            axisLabel: { color: '#64748b', fontSize: 11 }
        },
        yAxis: {
            type: 'value',
            max: 100,
            axisLine: { show: false },
            splitLine: { lineStyle: { color: '#f1f5f9', type: 'dashed' } },
            axisLabel: { color: '#64748b', formatter: '{value}%' }
        },
        series: [{
            name: 'On-Time Arrival',
            type: 'line',
            smooth: true,
            data: [92, 88, 95, 85, 97, 90],
            lineStyle: { width: 3, color: '#10b981' },
            itemStyle: { color: '#10b981' },
            areaStyle: {
                color: {
                    type: 'linear',
                    x: 0, y: 0, x2: 0, y2: 1,
                    colorStops: [
                        { offset: 0, color: 'rgba(16, 185, 129, 0.3)' },
                        { offset: 1, color: 'rgba(16, 185, 129, 0.05)' }
                    ]
                }
            },
            symbolSize: 8
        }]
    };

    /** Disputes / Complaints Heatmap (Calendar) */
    disputesOptions: EChartsOption = {
        tooltip: {
            trigger: 'axis',
            axisPointer: { type: 'shadow' },
            backgroundColor: 'rgba(255,255,255,0.95)',
            borderColor: '#e5e7eb',
            borderWidth: 1
        },
        legend: {
            data: ['Late Service', 'Quality Issue', 'Other'],
            top: 0,
            textStyle: { fontSize: 12, color: '#64748b' }
        },
        grid: { left: '3%', right: '4%', top: '15%', bottom: '10%', containLabel: true },
        xAxis: {
            type: 'category',
            data: ['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5', 'Day 6', 'Day 7', 'Day 8', 'Day 9', 'Day 10'],
            axisLine: { lineStyle: { color: '#e5e7eb' } },
            axisLabel: { color: '#64748b', fontSize: 11, rotate: 0 }
        },
        yAxis: {
            type: 'value',
            axisLine: { show: false },
            splitLine: { lineStyle: { color: '#f1f5f9', type: 'dashed' } },
            axisLabel: { color: '#64748b' }
        },
        series: [
            {
                name: 'Late Service',
                type: 'bar',
                stack: 'total',
                data: [1, 2, 0, 1, 2, 3, 0, 2, 1, 2],
                itemStyle: {
                    color: '#ef4444',
                    borderRadius: [0, 0, 0, 0]
                }
            },
            {
                name: 'Quality Issue',
                type: 'bar',
                stack: 'total',
                data: [1, 2, 1, 1, 1, 3, 0, 2, 1, 2],
                itemStyle: {
                    color: '#f97316',
                    borderRadius: [0, 0, 0, 0]
                }
            },
            {
                name: 'Other',
                type: 'bar',
                stack: 'total',
                data: [0, 1, 0, 1, 1, 1, 0, 2, 0, 1],
                itemStyle: {
                    color: '#eab308',
                    borderRadius: [4, 4, 0, 0]
                }
            }
        ]
    };


}
