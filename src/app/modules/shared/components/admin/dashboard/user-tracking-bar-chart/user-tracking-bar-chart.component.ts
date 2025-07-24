import { Component, inject, OnInit } from '@angular/core';
import { EChartsOption } from 'echarts';
import { NgxEchartsModule } from 'ngx-echarts';
import { AdminService } from '../../../../../../core/services/admin.service';
import { filter, map } from 'rxjs';
import { IAdminDashboardUserStats } from '../../../../../../core/models/user.model';


@Component({
    selector: 'app-admin-user-tracking-bar-chart',
    templateUrl: './user-tracking-bar-chart.component.html',
    imports: [NgxEchartsModule]
})
export class UserTrackingBarChartComponent implements OnInit {
    private readonly _adminService = inject(AdminService);

    chartOptions: EChartsOption = {};

    ngOnInit(): void {
        this._adminService.getUserStats().pipe(
            map(res => res.data),
            filter(Boolean)
        ).subscribe({
            next: (data) => {
                this._setChartData(data);
            },
            error: (err) => {
                console.error('Error fetching user stats:', err);
            }
        })

    }

    private _setChartData(data: IAdminDashboardUserStats) {
        const { customer, provider } = data;

        this.chartOptions = {
            title: {
                text: 'User Stats',
                left: 'left'
            },
            tooltip: {
                trigger: 'axis',
                axisPointer: { type: 'shadow' },
                formatter: (params: any) => {
                    const [provider, customer] = params;
                    return `
        <b>${provider.axisValue}</b><br/>
        🟦 Providers: ${provider.value}<br/>
        🟨 Customers: ${customer.value}
      `;
                }
            },
            legend: {
                data: ['Providers', 'Customers'],
                bottom: 0
            },
            xAxis: {
                type: 'category',
                data: ['New', 'Total', 'Active'],
                axisTick: { alignWithLabel: true }
            },
            yAxis: {
                type: 'value'
            },
            series: [
                {
                    name: 'Providers',
                    type: 'bar',
                    stack: 'total',
                    label: { show: true, position: 'inside' },
                    itemStyle: {
                        color: '#4f81bd', // blue
                        borderRadius: [0, 0, 10, 10]
                    },
                    barWidth: 50,
                    data: [provider.new, provider.total, provider.active]
                },
                {
                    name: 'Customers',
                    type: 'bar',
                    stack: 'total',
                    label: { show: true, position: 'inside' },
                    itemStyle: {
                        color: '#fcd34d', // yellow
                        borderRadius: [10, 10, 0, 0]
                    },
                    barWidth: 50,
                    data: [customer.new, customer.total, customer.active]
                }
            ]
        };
    }
}
