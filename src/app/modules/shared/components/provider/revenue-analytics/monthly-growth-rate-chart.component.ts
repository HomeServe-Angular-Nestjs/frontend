import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { EChartsOption } from 'echarts';
import { NgxEchartsModule } from 'ngx-echarts';
import { AnalyticService } from '../../../../../core/services/analytics.service';
import { Subject, takeUntil } from 'rxjs';
import { TopLevelFormatterParams } from 'echarts/types/dist/shared';
import { IRevenueMonthlyGrowthRateData } from '../../../../../core/models/analytics.model';

@Component({
    selector: 'app-revenue-earnings-forecast-chart',
    imports: [NgxEchartsModule],
    providers: [AnalyticService],
    template: `
    <div class="p-4 bg-white rounded-2xl shadow-md">
      <h2 class="text-lg font-semibold mb-3 text-gray-800">
        Monthly Revenue Growth 
      </h2>
      <div echarts [options]="chartOptions" class="h-96 w-full"></div>
    </div>
  `
})
export class RevenueEarningsForecastChartComponent implements OnInit, OnDestroy {
    private readonly _analyticService = inject(AnalyticService);
    private _destroy$ = new Subject<void>();

    chartOptions: EChartsOption = {};
    chartData: IRevenueMonthlyGrowthRateData[] = [];

    ngOnInit() {
        this._analyticService.getMonthlyRevenueGrowthRate()
            .pipe(takeUntil(this._destroy$))
            .subscribe(res => {
                this.chartData = res.data ?? [];
                this._setChartOptions();
            });
    }

    ngOnDestroy() {
        this._destroy$.next();
        this._destroy$.complete();
    }

    private _setChartOptions() {
        const months = this.chartData.map(d => d.month);
        const revenue = this.chartData.map(d => d.totalRevenue);
        const growth = this.chartData.map(d => d.growthRate);

        const primaryGreen = '#16A34A';
        const growthPositive = '#22C55E';
        const growthNegative = '#DC2626';

        this.chartOptions = {
            tooltip: {
                trigger: 'axis',
                formatter: (params: TopLevelFormatterParams) => {
                    const p = Array.isArray(params) ? params : [params];
                    const rev = p[0]?.value ?? 0;
                    const gr = p[1]?.value;
                    const axis = (p[0] as any)?.axisValue ?? '';
                    const grNum = typeof gr === 'number' ? gr : Number(gr);
                    const grColor = !isNaN(grNum) && grNum >= 0 ? growthPositive : growthNegative;

                    return `
                    <div>
                        <strong>${axis}</strong><br/>
                        Revenue: ₹${rev.toLocaleString()}<br/>
                        ${!isNaN(grNum) ? `<span style="color:${grColor}">Growth: ${grNum}%</span>` : ''}
                    </div>
                `;
                }
            },
            legend: {
                data: ['Revenue', 'Growth Rate'],
                top: 10
            },
            grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
            xAxis: { type: 'category', data: months, axisLine: { lineStyle: { color: '#ccc' } } },
            yAxis: [
                {
                    type: 'value',
                    name: 'Revenue (₹)',
                    position: 'left',
                    splitLine: { lineStyle: { type: 'dashed', color: '#eee' } }
                },
                {
                    type: 'value',
                    name: 'Growth (%)',
                    position: 'right',
                    splitLine: { lineStyle: { type: 'dashed', color: '#eee' } }
                }
            ],
            series: [
                {
                    name: 'Revenue',
                    type: 'bar',
                    data: revenue,
                    barWidth: '45%',
                    itemStyle: { color: primaryGreen, borderRadius: [6, 6, 0, 0] }
                },
                {
                    name: 'Growth Rate',
                    type: 'line',
                    yAxisIndex: 1,
                    data: growth,
                    smooth: true,
                    lineStyle: { width: 3, color: growthPositive },
                    itemStyle: {
                        color: (params: any) => (params.value >= 0 ? growthPositive : growthNegative)
                    }
                }
            ]
        };
    }
}
