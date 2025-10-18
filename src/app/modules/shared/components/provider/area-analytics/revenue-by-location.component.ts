import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxEchartsModule } from 'ngx-echarts';
import type { EChartsOption } from 'echarts';
import { Subject, takeUntil } from 'rxjs';
import { AnalyticService } from '../../../../../core/services/analytics.service';

@Component({
    selector: 'app-area-by-revenue',
    standalone: true,
    imports: [CommonModule, NgxEchartsModule],
    providers: [AnalyticService],
    template: `
    <section class="bg-white rounded-2xl shadow-lg p-6 w-full">
      <header class="flex items-center justify-between mb-6">
        <div>
          <h2 class="text-xl font-semibold text-gray-800">Revenue by Location</h2>
          <p class="text-sm text-gray-500 mt-1">
            Identifies where your revenue originates geographically.
          </p>
        </div>
      </header>

      <div *ngIf="chartOption" echarts [options]="chartOption" class="h-[550px] w-full"></div>

      <div *ngIf="!chartOption" class="flex items-center justify-center h-[550px] text-gray-400 text-sm">
        Loading map data...
      </div>
    </section>
  `
})
export class RevenueByLocationComponent implements OnInit, OnDestroy {
    private readonly _analyticService = inject(AnalyticService);
    private _destroy$ = new Subject<void>();
    chartOption!: EChartsOption;

    ngOnInit(): void {
        this._analyticService.getServiceDemandByLocation()
            .pipe(takeUntil(this._destroy$))
            .subscribe((res) => {
                if (res?.data?.length) {
                    this.chartOption = this.getChartOption(res.data);
                }
            });
    }

    getChartOption(data: any[]): EChartsOption {
        const sorted = [...data];

        const locations = sorted.map(d => d.locationName);
        const revenues = sorted.map(d => d.totalRevenue);
        const growthColors = sorted.map(d => d.changePct >= 0 ? '#16A34A' : '#DC2626');
        const growthIcons = sorted.map(d => d.changePct >= 0 ? '↑' : '↓');

        return {
            tooltip: {
                trigger: 'axis',
                axisPointer: { type: 'shadow' },
                backgroundColor: '#222',
                borderColor: '#444',
                borderWidth: 1,
                padding: [4, 8],
                textStyle: { color: '#fff', fontSize: 11 },
                formatter: (params: any) => {
                    const idx = params[0].dataIndex;
                    const d = sorted[idx];
                    return `
          <div style="line-height:1.4">
            <strong>${d.locationName.split(',')[3] ?? d.locationName}</strong><br/>
            ₹${d.totalRevenue.toLocaleString()}<br/>
            <span style="color:${growthColors[idx]}">${growthIcons[idx]} ${Math.abs(d.changePct)}%</span>
          </div>
        `;
                }
            },
            grid: { left: 130, right: 20, top: 30, bottom: 50 },
            xAxis: {
                type: 'value',
                name: 'Revenue (₹)',
                axisLabel: { color: '#555', fontWeight: 500, fontSize: 11 },
                splitLine: { lineStyle: { type: 'dashed', color: '#E5E7EB' } },
                nameTextStyle: { fontSize: 11, color: '#666' }
            },
            yAxis: {
                type: 'category',
                data: locations,
                inverse: true,
                axisLabel: {
                    color: '#444',
                    fontWeight: 500,
                    fontSize: 11,
                    formatter: (name: string) => name.split(',')[3] ?? name
                },
                axisLine: { show: false },
                axisTick: { show: false }
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
                        fontWeight: 500,
                        fontSize: 11
                    },
                    itemStyle: {
                        color: (params: any) => growthColors[params.dataIndex],
                        borderRadius: [0, 12, 12, 0],
                        shadowBlur: 6,
                        shadowColor: 'rgba(0,0,0,0.15)'
                    },
                    barCategoryGap: '60%'
                }
            ]
        };
    }

    ngOnDestroy(): void {
        this._destroy$.next();
        this._destroy$.complete();
    }
}
