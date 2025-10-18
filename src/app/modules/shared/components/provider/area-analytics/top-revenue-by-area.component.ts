import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxEchartsModule } from 'ngx-echarts';
import type { EChartsOption } from 'echarts';
import { AnalyticService } from '../../../../../core/services/analytics.service';
import { Subject, takeUntil } from 'rxjs';
import { ITopAreaRevenue } from '../../../../../core/models/analytics.model';

@Component({
    selector: 'app-top-areas-revenue',
    imports: [CommonModule, NgxEchartsModule],
    providers: [AnalyticService],
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
export class TopAreasRevenueComponent implements OnInit, OnDestroy {
    private readonly _analyticService = inject(AnalyticService);
    private _destroy$ = new Subject<void>();

    chartOption!: EChartsOption;

    ngOnInit(): void {
        this._analyticService.getTopAreasRevenue()
            .pipe(takeUntil(this._destroy$))
            .subscribe(res => this.chartOption = this.getChartOption(res.data ?? []));
    }

    ngOnDestroy(): void {
        this._destroy$.next();
        this._destroy$.complete();
    }

    getChartOption(data: ITopAreaRevenue[]): EChartsOption {
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
                splitLine: { lineStyle: { type: 'dashed', color: '#E5E7EB' } },


            },
            yAxis: {
                type: 'category',
                data: locations,
                inverse: true,
                axisLine: { lineStyle: { color: '#ccc' } },
                axisLabel: {
                    color: '#374151',
                    fontWeight: 500,
                    formatter: (text: string) => {
                        return text.split(',')[3] ?? text
                    }
                },
            },
            series: [
                {
                    type: 'bar',
                    data: revenues,
                    barWidth: 30,
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
