import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxEchartsModule } from 'ngx-echarts';
import type { EChartsOption } from 'echarts';

@Component({
    selector: 'app-revenue-trend-chart',
    standalone: true,
    imports: [CommonModule, NgxEchartsModule],
    template: `
    <div class="p-4 bg-white rounded-2xl shadow-md">
      <h2 class="text-lg font-semibold mb-3 text-gray-800">
        Revenue Trend Over Time
      </h2>

      <div echarts [options]="chartOptions" class="h-80 w-full"></div>

      <div class="flex justify-end mt-3 space-x-2">
        <button
          *ngFor="let view of ['Monthly', 'Quarterly', 'Yearly']"
          (click)="onViewChange(view)"
          class="px-3 py-1 rounded-md border text-sm transition"
          [class.bg-green-600]="currentView === view"
          [class.text-white]="currentView === view"
          [class.border-gray-300]="currentView !== view"
          [class.text-gray-700]="currentView !== view"
          [class.hover\\:bg-green-100]="currentView !== view"
        >
          {{ view }}
        </button>
      </div>
    </div>
  `,
})
export class RevenueTrendChartComponent implements OnChanges {
    @Input() userRevenue: number[] = [];
    @Input() platformAvg: number[] = [];
    @Input() months: string[] = [];

    chartOptions: EChartsOption = {};
    currentView = 'Monthly';

    revenueData: any = {
        Monthly: {
            labels: [
                'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
            ],
            user: [1200, 1450, 1600, 2100, 2500, 2300, 2800, 3000, 3400, 3200, 3700, 4000],
            avg: [1000, 1200, 1400, 1800, 2000, 2100, 2300, 2600, 2900, 3100, 3300, 3500]
        },
        Quarterly: {
            labels: ['Q1', 'Q2', 'Q3', 'Q4'],
            user: [4250, 6900, 9200, 10900],
            avg: [3600, 6000, 8500, 9700]
        },
        Yearly: {
            labels: ['2022', '2023', '2024', '2025'],
            user: [25000, 31000, 38500, 42000],
            avg: [23000, 29000, 35000, 39000]
        }
    };

    ngOnChanges(changes: SimpleChanges) {
        if (changes['userRevenue'] || changes['platformAvg'] || changes['months']) {
            this.setChartOptions();
        }
    }

    ngOnInit() {
        this.updateChartData('Monthly');
    }

    onViewChange(view: string) {
        this.currentView = view;
        this.updateChartData(view);
    }

    private updateChartData(view: string) {
        const selected = this.revenueData[view];
        this.months = selected.labels;
        this.userRevenue = selected.user;
        this.platformAvg = selected.avg;
        this.setChartOptions();
    }

    private setChartOptions() {
        this.chartOptions = {
            tooltip: {
                trigger: 'axis',
                backgroundColor: 'rgba(16,185,129,0.9)', // green tooltip
                textStyle: { color: '#fff' },
            },
            legend: {
                data: ['Your Revenue', 'Platform Average'],
                top: 10,
            },
            grid: {
                left: '3%',
                right: '4%',
                bottom: '3%',
                containLabel: true,
            },
            xAxis: {
                type: 'category',
                boundaryGap: false,
                data: this.months,
                axisLine: { lineStyle: { color: '#ccc' } },
            },
            yAxis: {
                type: 'value',
                axisLine: { lineStyle: { color: '#ccc' } },
                splitLine: { lineStyle: { color: '#eee' } },
            },
            series: [
                {
                    name: 'Your Revenue',
                    type: 'line',
                    data: this.userRevenue,
                    smooth: true,
                    lineStyle: { width: 3, color: '#16A34A' }, // emerald-600
                    areaStyle: {
                        color: 'rgba(22,163,74,0.15)', // soft green fill
                    },
                    symbol: 'circle',
                    symbolSize: 6,
                    itemStyle: {
                        color: '#16A34A',
                        borderColor: '#fff',
                        borderWidth: 2,
                    },
                    animationDuration: 800,
                    animationEasing: 'cubicOut',
                },
                {
                    name: 'Platform Average',
                    type: 'line',
                    data: this.platformAvg,
                    smooth: true,
                    lineStyle: { width: 2, color: '#6EE7B7', type: 'dashed' }, // mint green
                    symbol: 'none',
                    animationDuration: 800,
                    animationEasing: 'cubicOut',
                },
            ],
        };
    }
}
