import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxEchartsModule } from 'ngx-echarts';
import type { EChartsOption } from 'echarts';
import { AnalyticService } from '../../../../../core/services/analytics.service';
import { Subject, takeUntil } from 'rxjs';
import { ITopServicesByRevenue } from '../../../../../core/models/analytics.model';

@Component({
    selector: 'app-revenue-top-services-chart',
    imports: [CommonModule, NgxEchartsModule],
    providers: [AnalyticService],
    template: `
    <div class="bg-white p-5 rounded-2xl shadow-md">
      <h2 class="text-lg font-semibold mb-3 text-gray-800">
        Top Services by Revenue
      </h2>
      <div echarts [options]="chartOptions" class="h-80 w-full"></div>
    </div>
  `
})
export class RevenueTopServicesChartComponent implements OnInit, OnDestroy {
    private readonly _analyticService = inject(AnalyticService);
    private _destroy$ = new Subject<void>();

    chartOptions: EChartsOption = {};
    chartData: ITopServicesByRevenue[] = [];

    ngOnInit(): void {
        this._analyticService.getTopServicesByRevenue()
            .pipe(takeUntil(this._destroy$))
            .subscribe(res => {
                this.chartData = res.data ?? [];
                this.setChartOptions();
            });
    }

    ngOnDestroy(): void {
        this._destroy$.next();
        this._destroy$.complete();
    }

    private setChartOptions() {

        this.chartOptions = {
            tooltip: {
                trigger: 'item',
                formatter: (params: any) => {
                    const service = this.chartData[params.dataIndex];
                    return `
            <div>
              <strong>${service.service}</strong><br/>
              Revenue: ₹${service.revenue.toLocaleString()}<br/>
              Bookings: ${service.totalBookings}<br/>
              Avg. Value: ₹${service.avgRevenue}
            </div>
          `;
                }
            },
            grid: {
                left: '3%',
                right: '5%',
                bottom: '3%',
                containLabel: true
            },
            xAxis: {
                type: 'value',
                axisLine: { lineStyle: { color: '#ccc' } },
                splitLine: { lineStyle: { color: '#eee' } }
            },
            yAxis: {
                type: 'category',
                data: this.chartData.map(s => s.service),
                axisLine: { lineStyle: { color: '#ccc' } },
                axisTick: { show: false },
                axisLabel: {
                    color: '#374151',
                    fontWeight: 500,
                    formatter: function (value) {
                        const maxLength = 12;
                        return value.length > maxLength ? value.substring(0, maxLength) + '…' : value;
                    }
                }
            },
            series: [
                {
                    name: 'Revenue',
                    type: 'bar',
                    data: this.chartData.map(s => s.revenue),
                    barWidth: 18,
                    itemStyle: {
                        borderRadius: [0, 8, 8, 0],
                        color: '#16A34A'
                    },
                    label: {
                        show: true,
                        position: 'right',
                        formatter: (params: any) => `₹${params.value.toLocaleString()}`,
                        color: '#374151',
                        fontWeight: 500
                    }
                }
            ]
        };
    }
}
