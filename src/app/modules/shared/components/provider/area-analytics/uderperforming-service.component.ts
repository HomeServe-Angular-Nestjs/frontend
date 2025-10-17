import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxEchartsModule } from 'ngx-echarts';
import type { EChartsOption } from 'echarts';

interface UnderperformingArea {
    locationName: string;
    lastMonthRevenue: number;
    currentMonthRevenue: number;
    changePct: number;
}

@Component({
    selector: 'app-underperforming-areas',
    standalone: true,
    imports: [CommonModule, NgxEchartsModule],
    template: `
    <section class="bg-white rounded-2xl shadow-lg p-6 w-full">
      <header class="flex items-center justify-between mb-6">
        <div>
          <h2 class="text-xl font-semibold text-gray-800">Underperforming Areas</h2>
          <p class="text-sm text-gray-500 mt-1">
            Highlights areas with declining revenue to take early action.
          </p>
        </div>
      </header>

      <div *ngIf="chartOption" echarts [options]="chartOption" class="h-[500px] w-full"></div>

      <div *ngIf="!chartOption" class="flex items-center justify-center h-[500px] text-gray-400 text-sm">
        Loading chart data...
      </div>
    </section>
  `
})
export class UnderperformingAreasComponent implements OnInit {
    chartOption!: EChartsOption;

    private dummyData: UnderperformingArea[] = [
        { locationName: 'Thrissur', lastMonthRevenue: 800000, currentMonthRevenue: 704000, changePct: -12 },
        { locationName: 'Kozhikode', lastMonthRevenue: 900000, currentMonthRevenue: 810000, changePct: -10 },
        { locationName: 'Palakkad', lastMonthRevenue: 600000, currentMonthRevenue: 570000, changePct: -5 },
        { locationName: 'Ernakulam', lastMonthRevenue: 1200000, currentMonthRevenue: 1260000, changePct: 5 },
        { locationName: 'Alappuzha', lastMonthRevenue: 550000, currentMonthRevenue: 561000, changePct: 2 }
    ];

    ngOnInit(): void {
        // Sort descending by negative % change
        this.dummyData.sort((a, b) => a.changePct - b.changePct);
        this.chartOption = this.getChartOption(this.dummyData);
    }

    getChartOption(data: UnderperformingArea[]): EChartsOption {
        const locations = data.map(d => d.locationName);
        const changes = data.map(d => d.changePct);
        const colors = data.map(d => d.changePct >= 0 ? '#16A34A' : '#DC2626'); // green/red

        return {
            tooltip: {
                trigger: 'axis',
                axisPointer: { type: 'shadow' },
                formatter: (params: any) => {
                    const idx = params[0].dataIndex;
                    const d = data[idx];
                    return `<strong>${d.locationName}</strong><br/>
                  Last Month: ₹${d.lastMonthRevenue.toLocaleString()}<br/>
                  Current Month: ₹${d.currentMonthRevenue.toLocaleString()}<br/>
                  Change: <span style="color:${colors[idx]}">${d.changePct >= 0 ? '↑' : '↓'} ${Math.abs(d.changePct)}%</span>`;
                },
                backgroundColor: '#333',
                textStyle: { color: '#fff' },
                padding: [8, 12]
            },
            grid: { left: 120, right: 20, top: 50, bottom: 50 },
            xAxis: {
                type: 'value',
                name: '% Change',
                axisLine: { lineStyle: { color: '#ccc' } },
                axisLabel: { color: '#374151', fontWeight: 500 },
                splitLine: { lineStyle: { type: 'dashed', color: '#E5E7EB' } }
            },
            yAxis: {
                type: 'category',
                data: locations,
                inverse: true,
                axisLine: { lineStyle: { color: '#ccc' } },
                axisLabel: { color: '#374151', fontWeight: 500 }
            },
            series: [
                {
                    type: 'bar',
                    data: changes,
                    label: {
                        show: true,
                        position: 'right',
                        formatter: (params: any) => {
                            const idx = params.dataIndex;
                            return `${params.value >= 0 ? '↑' : '↓'} ${Math.abs(params.value)}%`;
                        },
                        color: '#111',
                        fontWeight: 600
                    },
                    itemStyle: {
                        color: (params: any) => colors[params.dataIndex],
                        borderRadius: 6,
                        shadowBlur: 10,
                        shadowColor: 'rgba(0,0,0,0.2)'
                    },
                    barCategoryGap: '40%'
                }
            ]
        };
    }
}
