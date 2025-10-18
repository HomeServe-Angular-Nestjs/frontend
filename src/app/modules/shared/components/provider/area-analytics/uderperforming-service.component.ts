import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxEchartsModule } from 'ngx-echarts';
import type { EChartsOption } from 'echarts';
import { AnalyticService } from '../../../../../core/services/analytics.service';
import { Subject, takeUntil } from 'rxjs';
import { IUnderperformingArea } from '../../../../../core/models/analytics.model';

@Component({
    selector: 'app-underperforming-areas',
    standalone: true,
    imports: [CommonModule, NgxEchartsModule],
    providers: [AnalyticService],
    template: `
    <section class="bg-white rounded-2xl shadow-lg p-6 w-full">
      <header class="flex items-center justify-between mb-6">
        <div>
          <h2 class="text-xl font-semibold text-gray-800">Underperforming Areas</h2>
          <p class="text-sm text-gray-500 mt-1">
                Spot areas where revenue has declined compared to last month
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
export class UnderperformingAreasComponent implements OnInit, OnDestroy {
    private readonly _analyticService = inject(AnalyticService);
    private _destroy$ = new Subject<void>();

    chartOption!: EChartsOption;

    ngOnInit(): void {
        this._analyticService.getUnderperformingAreas()
            .pipe(takeUntil(this._destroy$))
            .subscribe(res => this.chartOption = this._getChartOption(res.data ?? []));
    }

    ngOnDestroy(): void {
        this._destroy$.next();
        this._destroy$.complete();
    }

    private _getChartOption(data: IUnderperformingArea[]): EChartsOption {
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
                textStyle: { color: '#fff', fontSize: 12 },
                padding: [4, 8]
            },
            grid: { left: 120, right: 20, top: 50, bottom: 50 },
            xAxis: {
                type: 'value',
                name: '% Change',
                axisLine: { lineStyle: { color: '#ccc' } },
                axisLabel: {
                    color: '#374151',
                    fontWeight: 500,
                },
                splitLine: { lineStyle: { type: 'dashed', color: '#E5E7EB' } }
            },
            yAxis: {
                type: 'category',
                data: locations,
                inverse: true,
                axisLine: { lineStyle: { color: '#ccc' } },
                axisLabel: {
                    color: '#374151',
                    fontWeight: 500,
                    formatter: (value: string) => {
                        return value.split(',')[3] ?? value;
                    },
                }
            },
            series: [
                {
                    type: 'bar',
                    data: changes,
                    barWidth: 30,
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
