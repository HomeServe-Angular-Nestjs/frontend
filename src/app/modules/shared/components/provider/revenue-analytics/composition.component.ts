import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxEchartsModule } from 'ngx-echarts';
import type { EChartsOption } from 'echarts';

@Component({
    selector: 'app-revenue-composition-chart',
    standalone: true,
    imports: [CommonModule, NgxEchartsModule],
    template: `
      <div class="p-4 bg-white rounded-2xl shadow-md">
        <h2 class="text-lg font-semibold mb-3 text-gray-800">
          Revenue Composition
        </h2>
        <div echarts [options]="compositionOptions" class="h-80 w-full"></div>
      </div>
  `
})
export class RevenueCompositionChartsComponent {
    compositionOptions: EChartsOption = {};


    constructor() {
        this.setRevenueCompositionChart();
    }

    // 🥧 Donut Chart — Revenue Composition
    private setRevenueCompositionChart() {
        const data = [
            { name: 'Consulting', value: 40000 },
            { name: 'Maintenance', value: 30000 },
            { name: 'Support', value: 20000 },
            { name: 'Training', value: 10000 }
        ];

        this.compositionOptions = {
            tooltip: {
                trigger: 'item',
                formatter: '{b}: ₹{c} ({d}%)'
            },
            legend: {
                orient: 'vertical',
                left: 'left',
                textStyle: { color: '#374151' } // gray-700
            },
            series: [
                {
                    name: 'Revenue Source',
                    type: 'pie',
                    radius: ['45%', '70%'],
                    avoidLabelOverlap: false,
                    itemStyle: {
                        borderRadius: 10,
                        borderColor: '#fff',
                        borderWidth: 2
                    },
                    label: { show: false, position: 'center' },
                    emphasis: {
                        label: {
                            show: true,
                            fontSize: 16,
                            fontWeight: 'bold'
                        }
                    },
                    labelLine: { show: false },
                    data,
                    color: [
                        '#16A34A', // primary green
                        '#22C55E',
                        '#4ADE80',
                        '#86EFAC',
                        '#BBF7D0'
                    ]
                }
            ]
        };
    }


}
