import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxEchartsModule } from 'ngx-echarts';
import type { EChartsOption } from 'echarts';
import { AnalyticService } from '../../../../../core/services/analytics.service';
import { Subject, takeUntil } from 'rxjs';
import { IRevenueCompositionData } from '../../../../../core/models/analytics.model';
import { CallbackDataParams } from 'echarts/types/dist/shared';

@Component({
    selector: 'app-revenue-composition-chart',
    imports: [CommonModule, NgxEchartsModule],
    providers: [AnalyticService],
    template: `
      <div class="p-4 bg-white rounded-2xl shadow-md">
        <h2 class="text-lg font-semibold mb-3 text-gray-800">
          Revenue Composition
        </h2>
        <div echarts [options]="compositionOptions" class="h-80 w-full"></div>
      </div>
  `
})
export class RevenueCompositionChartsComponent implements OnInit, OnDestroy {
    private readonly _analyticService = inject(AnalyticService);
    private _destroy$ = new Subject<void>();

    compositionOptions: EChartsOption = {};
    compositionChartData: IRevenueCompositionData[] = [];

    ngOnInit(): void {
        this._analyticService.getRevenueCompositionChartData()
            .pipe(takeUntil(this._destroy$))
            .subscribe(res => {
                this.compositionChartData = res.data ?? [];
                this.setRevenueCompositionChart();
            });
    }

    ngOnDestroy(): void {
        this._destroy$.next();
        this._destroy$.complete();
    }

    private setRevenueCompositionChart() {
        const data = this.compositionChartData.map(item => ({
            name: item.category,
            value: item.totalRevenue
        }));

        this.compositionOptions = {
            tooltip: {
                trigger: 'item',
                formatter: (params) => {
                    const item = Array.isArray(params) ? params[0] : params;
                    return `${(item as any).name ?? ''}: ₹${(item as any).value ?? ''}`;
                },
                textStyle: { fontSize: 12 }
            },
            legend: {
                orient: 'vertical',
                left: 'left',
                textStyle: { color: '#374151' }
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
                    color: this._getColorPalette()
                }
            ],
            emphasis: {
                itemStyle: {
                    shadowBlur: 10,
                    shadowOffsetX: 0,
                    shadowColor: 'rgba(0,0,0,0.3)'
                },
                label: {
                    show: true,
                    fontSize: 14,
                    fontWeight: 'bold'
                }
            },
            label: {
                show: true,
                formatter: '{b}: ₹{c}\n({d}%)',
                fontSize: 12,
                color: '#374151'
            },
            labelLine: { show: true }
        };
    }

    private _getColorPalette(): string[] {
        return this.compositionChartData.map((_, index) => {
            const hue = 120; // green
            const lightness = 40 + index * 10; // adjust brightness per slice
            return `hsl(${hue}, 70%, ${lightness}%)`;
        });
    }
}
