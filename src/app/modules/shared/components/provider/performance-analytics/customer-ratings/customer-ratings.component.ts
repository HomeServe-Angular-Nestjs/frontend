import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";
import { EChartsOption } from "echarts";
import { NgxEchartsModule } from 'ngx-echarts';

@Component({
    selector: 'app-performance-ratings',
    imports: [CommonModule, NgxEchartsModule],
    styles: [`
    .custom-scrollbar::-webkit-scrollbar {
      width: 6px;
    }
    .custom-scrollbar::-webkit-scrollbar-track {
      background: #f1f5f9;
      border-radius: 10px;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb {
      background: #cbd5e1;
      border-radius: 10px;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb:hover {
      background: #94a3b8;
    }
  `],
    template: `
      <div class="bg-white rounded-2xl shadow-lg p-6 border border-slate-100 hover:shadow-xl transition-shadow duration-300">
      <div class="mb-6">
        <h2 class="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <span class="text-3xl">⭐</span>
          Customer Satisfaction
        </h2>
        <p class="text-sm text-slate-500 mt-1">Rating distribution & trends</p>
      </div>
      
      <!-- Rating Distribution -->
      <div echarts [options]="barChartOptions" class="h-64 mb-4"></div>
      
      <!-- Recent Reviews -->
      <div class="mt-6 pt-6 border-t border-slate-100">
        <h3 class="text-sm font-bold text-slate-700 mb-3 uppercase tracking-wide">Recent Reviews</h3>
        <div class="space-y-2 max-h-48 overflow-y-auto custom-scrollbar">
          <div *ngFor="let review of recentReviews" 
               class="p-3 rounded-lg bg-gradient-to-r from-slate-50 to-blue-50 hover:from-blue-50 hover:to-indigo-50 transition-all duration-200 border border-slate-100">
            <div class="flex items-center justify-between mb-1">
              <span class="font-semibold text-slate-800 text-sm">{{review.name}}</span>
              <span class="text-amber-500 font-bold text-sm">{{review.rating}}★</span>
            </div>
            <p class="text-xs text-slate-600 line-clamp-2">{{review.comment}}</p>
          </div>
        </div>
      </div>
    </div>

    `
})
export class ProviderPerformanceRatingChartComponent {
    recentReviews = [
        { name: 'Alice Johnson', rating: 5, comment: 'Excellent service! Very professional and completed the job perfectly.' },
        { name: 'Bob Smith', rating: 4, comment: 'Very good experience. Arrived on time and did quality work.' },
        { name: 'Charlie Brown', rating: 5, comment: 'Absolutely loved it! Will definitely book again.' },
        { name: 'David Wilson', rating: 3, comment: 'It was okay. Could have been more thorough with the details.' },
        { name: 'Eva Martinez', rating: 2, comment: 'Not entirely satisfied. Expected better quality for the price.' }
    ];

    barChartOptions: EChartsOption = {
        tooltip: {
            trigger: 'axis',
            axisPointer: { type: 'shadow' },
            formatter: '{b}<br/>{c} reviews',
            backgroundColor: 'rgba(255,255,255,0.95)',
            borderColor: '#e5e7eb',
            borderWidth: 1,
            textStyle: { color: '#374151' }
        },
        grid: { left: '15%', right: '5%', top: '10%', bottom: '10%' },
        xAxis: {
            type: 'value',
            axisLine: { show: false },
            splitLine: { lineStyle: { color: '#f1f5f9', type: 'dashed' } },
            axisLabel: { color: '#64748b' }
        },
        yAxis: {
            type: 'category',
            data: ['5★', '4★', '3★', '2★', '1★'],
            inverse: true,
            axisLine: { show: false },
            axisTick: { show: false },
            axisLabel: { fontWeight: 'bold', fontSize: 13, color: '#475569' }
        },
        series: [{
            name: 'Reviews',
            type: 'bar',
            data: [150, 90, 60, 20, 10],
            barWidth: 18,
            label: {
                show: true,
                position: 'right',
                color: '#475569',
                fontWeight: 'bold',
                fontSize: 12,
                formatter: '{c}'
            },
            itemStyle: {
                borderRadius: [0, 10, 10, 0],
                color: (params) => {
                    const colors = [
                        {
                            type: 'linear' as const, // <-- tell TS it's the literal 'linear'
                            x: 0, y: 0, x2: 1, y2: 0,
                            colorStops: [
                                { offset: 0, color: '#10b981' },
                                { offset: 1, color: '#059669' }
                            ]
                        },
                        {
                            type: 'linear' as const,
                            x: 0, y: 0, x2: 1, y2: 0,
                            colorStops: [
                                { offset: 0, color: '#84cc16' },
                                { offset: 1, color: '#65a30d' }
                            ]
                        },
                        {
                            type: 'linear' as const,
                            x: 0, y: 0, x2: 1, y2: 0,
                            colorStops: [
                                { offset: 0, color: '#84cc16' },
                                { offset: 1, color: '#65a30d' }
                            ]
                        },
                        {
                            type: 'linear' as const,
                            x: 0, y: 0, x2: 1, y2: 0,
                            colorStops: [
                                { offset: 0, color: '#84cc16' },
                                { offset: 1, color: '#65a30d' }
                            ]
                        },
                        {
                            type: 'linear' as const,
                            x: 0, y: 0, x2: 1, y2: 0,
                            colorStops: [
                                { offset: 0, color: '#84cc16' },
                                { offset: 1, color: '#65a30d' }
                            ]
                        },
                        // ... more gradients
                    ];
                    return colors[params.dataIndex] as any; // <-- cast as any to suppress TS
                }
            }

        }]
    };

}