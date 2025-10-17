import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxEchartsModule } from 'ngx-echarts';
import type { EChartsOption } from 'echarts';
import { Subject, takeUntil } from 'rxjs';
import { AnalyticService } from '../../../../../core/services/analytics.service';

@Component({
    selector: 'app-area-by-revenue',
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
export class RevenueByLocationComponent implements OnInit {
    private readonly _analyticService = inject(AnalyticService);
    private _destroy$ = new Subject<void>();

    chartOption!: EChartsOption;

    ngOnInit(): void {
        this._analyticService.getServiceDemandByLocation()
            .pipe(takeUntil(this._destroy$))
            .subscribe((data: any) => {
                this.chartOption = this.getChartOption(data);
            });
    }

    getChartOption(data: any): EChartsOption {
        // Sort locations alphabetically or by revenue
        const locations = data.map((d: any) => d.location);

        // Determine bubble sizes
        const maxRevenue = Math.max(...data.map((d: any) => d.revenue ?? d.demand));
        const minSize = 20;
        const maxSize = 80;

        const seriesData = data.map((d: any) => {
            const size = minSize + ((d.revenue ?? d.demand) / maxRevenue) * (maxSize - minSize);
            return {
                name: d.location,
                value: [d.location, d.demand, d.revenue ?? d.demand],
                symbolSize: size
            };
        });

        return {
            tooltip: {
                trigger: 'item',
                formatter: (params: any) =>
                    `<strong>${params.data.name}</strong><br/>Demand: ${params.data.value[1]}<br/>Revenue: ${params.data.value[2]}`,
                backgroundColor: '#333',
                textStyle: { color: '#fff' },
                padding: [8, 12]
            },
            xAxis: {
                type: 'category',
                data: locations,
                name: 'Location',
                axisLabel: { rotate: 30, fontWeight: 500, color: '#374151' },
                axisLine: { lineStyle: { color: '#ccc' } },
                nameLocation: 'middle',
                nameGap: 30
            },
            yAxis: {
                type: 'value',
                name: 'Demand',
                axisLine: { lineStyle: { color: '#ccc' } },
                axisLabel: { color: '#374151', fontWeight: 500 },
                splitLine: { lineStyle: { type: 'dashed', color: '#E5E7EB' } }
            },
            series: [
                {
                    type: 'scatter',
                    data: seriesData,
                    label: {
                        show: true,
                        formatter: '{b}',
                        position: 'top',
                        color: '#111',
                        fontWeight: 600
                    },
                    itemStyle: {
                        color: '#16A34A',
                        shadowBlur: 15,
                        shadowColor: 'rgba(0,0,0,0.3)',
                        borderColor: '#fff',
                        borderWidth: 1
                    }
                }
            ],
            grid: { left: 50, right: 20, top: 60, bottom: 60 }
        };
    }


    ngOnDestroy(): void {
        this._destroy$.next();
        this._destroy$.complete();
    }
}
