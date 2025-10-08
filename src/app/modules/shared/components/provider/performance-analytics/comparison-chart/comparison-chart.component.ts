import { Component } from '@angular/core';
import { EChartsOption } from 'echarts';
import { NgxEchartsModule } from 'ngx-echarts';


@Component({
    selector: 'app-performance-comparison',
    imports: [NgxEchartsModule],
    template: `
   <div class="bg-white rounded-2xl shadow-lg p-6 border border-slate-100 hover:shadow-xl transition-shadow duration-300">
      <div class="mb-6">
        <h2 class="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <span class="text-3xl">📈</span>
          Performance Comparison
        </h2>
        <p class="text-sm text-slate-500 mt-1">Your performance vs platform average</p>
      </div>

      <!-- Insights Cards -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div class="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200">
          <div class="flex items-center justify-between mb-2">
            <span class="text-xs font-bold text-green-700 uppercase tracking-wide">Growth Rate</span>
            <svg class="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clip-rule="evenodd"/>
            </svg>
          </div>
          <div class="text-3xl font-black text-green-700">+33%</div>
          <p class="text-xs text-green-600 mt-1">Above platform avg</p>
        </div>

        <div class="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200">
          <div class="flex items-center justify-between mb-2">
            <span class="text-xs font-bold text-blue-700 uppercase tracking-wide">Monthly Trend</span>
            <svg class="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z"/>
            </svg>
          </div>
          <div class="text-3xl font-black text-blue-700">↗ 50%</div>
          <p class="text-xs text-blue-600 mt-1">Apr to May increase</p>
        </div>

        <div class="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-200">
          <div class="flex items-center justify-between mb-2">
            <span class="text-xs font-bold text-purple-700 uppercase tracking-wide">Ranking</span>
            <svg class="w-5 h-5 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
            </svg>
          </div>
          <div class="text-3xl font-black text-purple-700">Top 15%</div>
          <p class="text-xs text-purple-600 mt-1">Of all providers</p>
        </div>
      </div>

      <!-- Main Chart -->
      <div class="bg-gradient-to-br from-slate-50 to-indigo-50 rounded-xl p-4 border border-slate-100">
        <div echarts [options]="monthTrendLine" class="h-96"></div>
      </div>

      <!-- Performance Tips -->
      <div class="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <div class="flex items-start gap-3">
            <div class="bg-amber-500 rounded-lg p-2">
              <svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"/>
              </svg>
            </div>
            <div>
              <h4 class="font-bold text-amber-900 text-sm mb-1">Pro Tip</h4>
              <p class="text-xs text-amber-800">Maintain your current response time to stay competitive. Faster responses lead to higher conversion rates.</p>
            </div>
          </div>
        </div>

        <div class="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div class="flex items-start gap-3">
            <div class="bg-blue-500 rounded-lg p-2">
              <svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"/>
                <path fill-rule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm9.707 5.707a1 1 0 00-1.414-1.414L9 12.586l-1.293-1.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
              </svg>
            </div>
            <div>
              <h4 class="font-bold text-blue-900 text-sm mb-1">Next Goal</h4>
              <p class="text-xs text-blue-800">Reach 100 completed bookings this month to unlock Premium Provider status and increased visibility.</p>
            </div>
          </div>
        </div>
      </div>

    </div>
  `
})
export class ProviderPerformanceComparisonChartComponent {

    monthTrendLine: EChartsOption = {
        tooltip: {
            trigger: 'axis',
            backgroundColor: 'rgba(255,255,255,0.95)',
            borderColor: '#e5e7eb',
            borderWidth: 1,
            textStyle: { color: '#374151' },
            formatter: function (params: any) {
                let tooltipText = `<div style="font-weight: bold; margin-bottom: 8px;">${params[0].axisValue}</div>`;
                params.forEach((item: any) => {
                    const trend = item.dataIndex > 0 && params[0].data ?
                        (item.data > params[0].data[item.dataIndex - 1] ? '📈 +' : '📉 ') : '';
                    tooltipText += `
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
              <span style="display: inline-block; width: 10px; height: 10px; border-radius: 50%; background: ${item.color};"></span>
              <span style="font-weight: 600;">${item.seriesName}:</span>
              <span style="font-weight: bold;">${item.data}</span>
              <span style="font-size: 11px; color: #6b7280;">${trend}</span>
            </div>`;
                });
                return tooltipText;
            }
        },
        legend: {
            data: ['Your Performance', 'Platform Average'],
            top: 10,
            textStyle: { fontSize: 13, color: '#475569', fontWeight: 600 },
            itemGap: 20
        },
        grid: {
            top: 60,
            left: 60,
            right: 40,
            bottom: 50
        },
        xAxis: {
            type: 'category',
            data: ['January', 'February', 'March', 'April', 'May'],
            axisLine: { lineStyle: { color: '#e5e7eb', width: 2 } },
            axisLabel: {
                fontSize: 12,
                color: '#64748b',
                fontWeight: 500
            },
            axisTick: { show: false }
        },
        yAxis: {
            type: 'value',
            name: 'Bookings',
            nameTextStyle: {
                color: '#64748b',
                fontSize: 13,
                fontWeight: 600,
                padding: [0, 0, 0, 0]
            },
            axisLine: { show: true, lineStyle: { color: '#e5e7eb', width: 2 } },
            splitLine: { lineStyle: { color: '#f1f5f9', type: 'dashed' } },
            axisLabel: {
                color: '#64748b',
                fontSize: 12,
                fontWeight: 500
            }
        },
        series: [
            {
                name: 'Your Performance',
                type: 'line',
                data: [30, 45, 50, 40, 60],
                smooth: true,
                lineStyle: {
                    color: '#8b5cf6',
                    width: 4,
                    shadowColor: 'rgba(139, 92, 246, 0.3)',
                    shadowBlur: 10,
                    shadowOffsetY: 5
                },
                symbol: 'circle',
                symbolSize: 10,
                itemStyle: {
                    color: '#8b5cf6',
                    borderColor: '#fff',
                    borderWidth: 3,
                    shadowColor: 'rgba(139, 92, 246, 0.5)',
                    shadowBlur: 8
                },
                emphasis: {
                    scale: true,
                    focus: 'series',
                },
                areaStyle: {
                    color: {
                        type: 'linear',
                        x: 0, y: 0, x2: 0, y2: 1,
                        colorStops: [
                            { offset: 0, color: 'rgba(139, 92, 246, 0.25)' },
                            { offset: 1, color: 'rgba(139, 92, 246, 0.02)' }
                        ]
                    }
                },
                label: {
                    show: true,
                    position: 'top',
                    formatter: '{c}',
                    fontSize: 11,
                    fontWeight: 'bold',
                    color: '#7c3aed',
                    backgroundColor: '#f5f3ff',
                    padding: [4, 8],
                    borderRadius: 6,
                    borderColor: '#ddd6fe',
                    borderWidth: 1
                }
            },
            {
                name: 'Platform Average',
                type: 'line',
                data: [25, 40, 45, 35, 45],
                smooth: true,
                lineStyle: {
                    type: 'dashed',
                    color: '#94a3b8',
                    width: 3
                },
                symbol: 'circle',
                symbolSize: 7,
                itemStyle: {
                    color: '#cbd5e1',
                    borderColor: '#fff',
                    borderWidth: 2
                },
                emphasis: {
                    scale: true,
                },
                label: {
                    show: false
                }
            }
        ]
    };


}
