import { Component, inject, OnDestroy, OnInit } from "@angular/core";
import { EChartsOption } from "echarts";
import { NgxEchartsModule } from "ngx-echarts";
import { AnalyticService } from "../../../../../core/services/analytics.service";
import { Subject, takeUntil } from "rxjs";
import { IRevenueMonthlyGrowthRateData } from "../../../../../core/models/analytics.model";
import { TopLevelFormatterParams } from "echarts/types/dist/shared";

@Component({
    selector: "app-revenue-monthly-growth-rate-chart",
    imports: [NgxEchartsModule],
    providers: [AnalyticService],
    template: `
      <div class="p-4 bg-white rounded-2xl shadow-md">
        <h2 class="text-lg font-semibold mb-3 text-gray-800">
          Monthly Growth Rate
        </h2>
        <div echarts [options]="growthOptions" class="h-80 w-full"></div>
      </div>
    `
})
export class RevenueMonthlyGrowthRateChartComponent implements OnInit, OnDestroy {
    private readonly _analyticService = inject(AnalyticService);
    private _destroy$ = new Subject<void>();

    growthOptions: EChartsOption = {};
    growthChartData: IRevenueMonthlyGrowthRateData[] = [];

    ngOnInit() {
        this._analyticService.getMonthlyRevenueGrowthRate()
            .pipe(takeUntil(this._destroy$))
            .subscribe(res => {
                this.growthChartData = res.data || this.growthChartData;
                this.setGrowthRateChart();
            });
    }

    ngOnDestroy() {
        this._destroy$.next();
        this._destroy$.complete();
    }

    private setGrowthRateChart() {
        const months: string[] = [];
        const revenue: number[] = [];
        const growth: number[] = [];

        this.growthChartData.forEach(item => {
            months.push(item.month);
            revenue.push(item.totalRevenue);
            growth.push(item.growthRate);
        });

        this.growthOptions = {
            tooltip: {
                trigger: 'axis',
                formatter: (params: TopLevelFormatterParams) => {
                    const p = Array.isArray(params) ? params : [params];
                    const rev = (p[0]?.value as number) ?? 0;
                    const gr = p[1]?.value;
                    const axis = (p[0] as any)?.axisValue ?? '';

                    const grNum = typeof gr === 'number' ? gr : Number(gr);
                    const grColor = !isNaN(grNum) && grNum >= 0 ? '#16A34A' : '#DC2626';

                    return `
                        <div>
                            <strong>${axis}</strong><br/>
                            Revenue: ₹${rev}
                            ${!isNaN(grNum) ? `<br/><span style="color:${grColor}">Growth: ${grNum}%</span>` : ''}
                        </div>
                        `;
                }
            },
            legend: {
                data: ['Revenue', 'Growth Rate'],
                top: 10
            },
            grid: {
                left: '3%',
                right: '4%',
                bottom: '3%',
                containLabel: true
            },
            xAxis: [
                {
                    type: 'category',
                    data: months,
                    axisLine: { lineStyle: { color: '#ccc' } }
                }
            ],
            yAxis: [
                {
                    type: 'value',
                    name: 'Revenue (₹)',
                    position: 'left',
                    splitLine: {
                        show: true,
                        lineStyle: { type: 'dashed', color: '#eee' }
                    }
                },
                {
                    type: 'value',
                    name: 'Growth (%)',
                    position: 'right',
                    splitLine: {
                        show: true,
                        lineStyle: { type: 'dashed', color: '#eee' }
                    }
                }
            ],
            series: [
                {
                    name: 'Revenue',
                    type: 'bar',
                    data: revenue,
                    barWidth: '45%',
                    itemStyle: {
                        color: '#16A34A',
                        borderRadius: [6, 6, 0, 0]
                    }
                },
                {
                    name: 'Growth Rate',
                    type: 'line',
                    yAxisIndex: 1,
                    data: growth,
                    smooth: true,
                    lineStyle: { width: 3, color: '#4ADE80' },
                    itemStyle: {
                        color: (params: any) => (params.value >= 0 ? '#16A34A' : '#DC2626')
                    }
                }
            ]
        };
    }
}