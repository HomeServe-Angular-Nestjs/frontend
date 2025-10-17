import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxEchartsModule } from 'ngx-echarts';
import type { EChartsOption } from 'echarts';

interface LocationRevenue {
    locationName: string;
    totalRevenue: number;
    changePct: number; // % change vs previous month
}

@Component({
    selector: 'app-top-areas-revenue',
    imports: [CommonModule, NgxEchartsModule],
    template: `
    <section class="bg-white rounded-2xl shadow-lg p-6 w-full">
      <header class="flex items-center justify-between mb-6">
        <div>
          <h2 class="text-xl font-semibold text-gray-800">Top Performing Areas</h2>
          <p class="text-sm text-gray-500 mt-1">
            Ranked by total revenue for quick decision-making.
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
export class TopAreasRevenueComponent implements OnInit {
    chartOption!: EChartsOption;

    private dummyData: LocationRevenue[] = [
        { locationName: 'Ernakulam', totalRevenue: 1200000, changePct: 18 },
        { locationName: 'Kochi', totalRevenue: 950000, changePct: 5 },
        { locationName: 'Thiruvananthapuram', totalRevenue: 870000, changePct: -3 },
        { locationName: 'Kozhikode', totalRevenue: 650000, changePct: -12 },
        { locationName: 'Alappuzha', totalRevenue: 540000, changePct: 7 },
        { locationName: 'Kannur', totalRevenue: 430000, changePct: 2 },
        { locationName: 'Palakkad', totalRevenue: 390000, changePct: -5 }
    ];

    ngOnInit(): void {
        // Sort descending by totalRevenue
        this.dummyData.sort((a, b) => b.totalRevenue - a.totalRevenue);
        this.chartOption = this.getChartOption(this.dummyData);
    }

    getChartOption(data: LocationRevenue[]): EChartsOption {
        const locations = data.map(d => d.locationName);
        const revenues = data.map(d => d.totalRevenue);
        const growthIcons = data.map(d => d.changePct >= 0 ? '↑' : '↓');
        const growthColors = data.map(d => d.changePct >= 0 ? '#16A34A' : '#DC2626');

        return {
            tooltip: {
                trigger: 'axis',
                axisPointer: { type: 'shadow' },
                formatter: (params: any) => {
                    const idx = params[0].dataIndex;
                    return `<strong>${locations[idx]}</strong><br/>
                  Revenue: ₹${revenues[idx].toLocaleString()}<br/>
                  Change: <span style="color:${growthColors[idx]}">${growthIcons[idx]} ${Math.abs(data[idx].changePct)}%</span>`;
                },
                backgroundColor: '#333',
                textStyle: { color: '#fff' },
                padding: [8, 12]
            },
            grid: { left: 120, right: 20, top: 50, bottom: 50 },
            xAxis: {
                type: 'value',
                name: 'Revenue (₹)',
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
                    data: revenues,
                    label: {
                        show: true,
                        position: 'right',
                        formatter: (params: any) => {
                            const idx = params.dataIndex;
                            return `₹${params.value.toLocaleString()} ${growthIcons[idx]}`;
                        },
                        color: '#111',
                        fontWeight: 600
                    },
                    itemStyle: {
                        color: (params: any) => growthColors[params.dataIndex],
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
