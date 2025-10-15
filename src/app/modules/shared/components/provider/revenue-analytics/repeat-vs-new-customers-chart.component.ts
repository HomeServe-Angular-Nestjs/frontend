import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { NgxEchartsModule } from 'ngx-echarts';
import { AnalyticService } from '../../../../../core/services/analytics.service';
import { Subject, takeUntil } from 'rxjs';
import { EChartsOption } from 'echarts';
import { INewOrReturningClientData } from '../../../../../core/models/analytics.model';

@Component({
    selector: 'app-revenue-repeat-vs-new-customers-chart',
    imports: [NgxEchartsModule],
    providers: [AnalyticService],
    template: `
     <div class="p-4 bg-white rounded-2xl shadow-md">
        <h2 class="text-lg font-semibold mb-3 text-gray-800">
          Monthly Growth Rate
        </h2>
        <div echarts [options]="chartOption" class="h-80 w-full"></div>
      </div>
    `
})
export class RevenueRepeatVsNewCustomersChartComponent implements OnInit, OnDestroy {
    private readonly _analyticService = inject(AnalyticService);
    private _destroy$ = new Subject<void>();

    chartOption: EChartsOption = {};
    chartData: INewOrReturningClientData[] = [];

    ngOnInit(): void {
        this._analyticService.getNewAndReturningClientData()
            .pipe(takeUntil(this._destroy$))
            .subscribe(res => {
                this.chartData = res.data ?? [];
                this._setChartOptions();
            });
    }

    ngOnDestroy(): void {
        this._destroy$.next();
        this._destroy$.complete();
    }

    private _setChartOptions() {
        const m = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const months: string[] = [];
        const newClients: number[] = [];
        const returningClients: number[] = [];

        m.forEach(mth=> {
            const monthData = this.chartData.find(d => d.month === mth);
            months.push(mth);
            newClients.push(monthData?.newClients ?? 0);
            returningClients.push(monthData?.returningClients ?? 0);    
        });

        this.chartOption = {
            title: {
                text: 'Repeat vs New Customers',
                left: 'center',
                top: 10,
                textStyle: { fontSize: 16, fontWeight: 'bold' }
            },
            tooltip: {
                trigger: 'axis',
                axisPointer: { type: 'shadow' },
                formatter: (params: any) => {
                    const newC = params.find((p: any) => p.seriesName === 'New Clients');
                    const repeatC = params.find((p: any) => p.seriesName === 'Returning Clients');
                    const total = (newC?.value || 0) + (repeatC?.value || 0);
                    return `
            <strong>${params[0].name}</strong><br>
            New Clients: ${newC?.value}<br>
            Returning Clients: ${repeatC?.value}<br>
            <strong>Total: ${total}</strong>
          `;
                }
            },
            legend: {
                data: ['New Clients', 'Returning Clients'],
                bottom: 0,
                icon: 'roundRect'
            },
            grid: {
                top: 60,
                left: '3%',
                right: '4%',
                bottom: '10%',
                containLabel: true
            },
            xAxis: {
                type: 'category',
                data: months,
                axisTick: { alignWithLabel: true },
                axisLine: { lineStyle: { color: '#ccc' } }
            },
            yAxis: {
                type: 'value',
                name: 'Customers',
                axisLine: { show: false },
                splitLine: { lineStyle: { color: '#eee' } }
            },
            series: [
                {
                    name: 'New Clients',
                    type: 'bar',
                    stack: 'total',
                    emphasis: { focus: 'series' },
                    itemStyle: { color: '#00bcd4', borderRadius: [4, 4, 0, 0] },
                    data: newClients
                },
                {
                    name: 'Returning Clients',
                    type: 'bar',
                    stack: 'total',
                    emphasis: { focus: 'series' },
                    itemStyle: { color: '#8bc34a', borderRadius: [4, 4, 0, 0] },
                    data: returningClients
                }
            ]
        };
    }
}
