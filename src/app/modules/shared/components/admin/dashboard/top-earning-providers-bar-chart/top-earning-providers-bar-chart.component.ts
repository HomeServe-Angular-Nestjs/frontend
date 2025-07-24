import { Component, inject, OnInit } from '@angular/core';
import { EChartsOption } from 'echarts';
import { NgxEchartsModule } from 'ngx-echarts';
import { AdminService } from '../../../../../../core/services/admin.service';
import { filter, map } from 'rxjs';
import { ITopProviders } from '../../../../../../core/models/user.model';


@Component({
    selector: 'app-admin-top-earning-providers-bar-chart',
    templateUrl: './top-earning-providers-bar-chart.component.html',
    imports: [NgxEchartsModule]
})
export class AdminTopProvidersBarChartComponent implements OnInit {
    private readonly _adminService = inject(AdminService);

    chartOptions: EChartsOption = {};

    ngOnInit(): void {
        this._adminService.getTopEarningProviders().pipe(
            map(res => res.data),
            filter(Boolean)
        ).subscribe({
            next: (data) => {
                this._setupChart(data);
            },
            error: (err) => {
                console.error('Error fetching top earning providers:', err);
            }
        })
    }

    private _setupChart(data: ITopProviders[]): void {

        this.chartOptions = {
            title: {
                text: 'Top 10 Earning Providers',
                left: 'left',
                textStyle: {
                    fontSize: 14
                }
            },
            tooltip: {
                trigger: 'axis',
                axisPointer: { type: 'shadow' },
                formatter: (params: any) => {
                    const item = params[0];
                    return `
<b>${item.name}</b><br/>
💰 Earnings: ₹${item.value.toLocaleString()}
`;
                }
            },
            grid: {
                top: 40,
                left: 80,
                right: 40,
                bottom: 30,
                containLabel: true
            },
            xAxis: {
                type: 'value',
                name: 'Earnings (₹)',
                axisLabel: {
                    fontSize: 10
                }
            },
            yAxis: {
                type: 'category',
                data: [...data.map((d: ITopProviders) => d.username)],
                inverse: true,
                axisLabel: {
                    fontSize: 10,
                    formatter: (name: string) =>
                        name.length > 15 ? name.slice(0, 15) + '…' : name
                }
            },
            series: [
                {
                    name: 'Earnings',
                    type: 'bar',
                    barCategoryGap: '40%', // tighter spacing
                    label: {
                        show: true,
                        position: 'right',
                        fontSize: 10,
                        formatter: '₹{c}'
                    },
                    itemStyle: {
                        color: '#34d399', // emerald green
                        borderRadius: [0, 6, 6, 0]
                    },
                    data: [...data.map((d: ITopProviders) => d.totalEarnings)]
                }
            ]
        };
    }
}