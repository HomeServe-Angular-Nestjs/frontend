import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EChartsOption } from 'echarts';
import { NgxEchartsModule } from 'ngx-echarts';
import { AdminService } from '../../../../../../core/services/admin.service';
import { filter, map } from 'rxjs';
import { IAdminDashboardUserStats } from '../../../../../../core/models/user.model';

@Component({
    selector: 'app-admin-user-tracking-bar-chart',
    standalone: true,
    imports: [CommonModule, NgxEchartsModule],
    templateUrl: './user-tracking-bar-chart.component.html',
})
export class UserTrackingBarChartComponent implements OnInit {
    private readonly _adminService = inject(AdminService);

    chartOptions: EChartsOption = {};
    isLoading = true;

    ngOnInit(): void {
        this._adminService.getUserStats().pipe(
            map(res => res.data),
            filter(Boolean)
        ).subscribe({
            next: (data) => {
                this._setChartData(data);
                this.isLoading = false;
            },
            error: (err) => {
                console.error('Error fetching user stats:', err);
                this.isLoading = false;
            }
        });
    }

    private _setChartData(data: IAdminDashboardUserStats) {
        const { customer, provider } = data;

        this.chartOptions = {
            tooltip: {
                trigger: 'axis',
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                borderRadius: 12,
                padding: [10, 15],
                textStyle: {
                    color: '#1e293b',
                    fontSize: 13
                },
                axisPointer: {
                    type: 'shadow',
                    shadowStyle: {
                        color: 'rgba(79, 129, 189, 0.05)'
                    }
                },
                formatter: (params: any) => {
                    let html = `<div class="font-bold text-slate-700 mb-2 border-b border-slate-100 pb-1">${params[0].axisValue}</div>`;
                    params.forEach((item: any) => {
                        html += `
                            <div class="flex items-center justify-between gap-4 py-1">
                                <div class="flex items-center gap-2">
                                    <span class="w-2.5 h-2.5 rounded-full" style="background-color: ${item.color}"></span>
                                    <span class="text-slate-500 font-medium">${item.seriesName}:</span>
                                </div>
                                <span class="text-slate-800 font-bold">${item.value}</span>
                            </div>
                        `;
                    });
                    return html;
                }
            },
            legend: {
                show: true,
                top: 0,
                right: 0,
                icon: 'circle',
                itemWidth: 10,
                itemHeight: 10,
                textStyle: {
                    color: '#64748b',
                    fontSize: 12,
                    fontWeight: 500
                }
            },
            grid: {
                left: '2%',
                right: '2%',
                bottom: '3%',
                top: '15%',
                containLabel: true
            },
            xAxis: {
                type: 'category',
                data: ['New Users', 'Total Base', 'Active Status'],
                axisTick: { show: false },
                axisLine: {
                    lineStyle: {
                        color: '#f1f5f9'
                    }
                },
                axisLabel: {
                    color: '#94a3b8',
                    fontSize: 11,
                    fontWeight: 600,
                    margin: 15
                }
            },
            yAxis: {
                type: 'value',
                splitLine: {
                    lineStyle: {
                        type: 'dashed',
                        color: '#f1f5f9'
                    }
                },
                axisLabel: {
                    color: '#94a3b8',
                    fontSize: 11
                }
            },
            series: [
                {
                    name: 'Providers',
                    type: 'bar',
                    barWidth: '25%',
                    itemStyle: {
                        color: '#6366f1', // indigo-500
                        borderRadius: [6, 6, 0, 0]
                    },
                    emphasis: {
                        itemStyle: {
                            color: '#4f46e5' // indigo-600
                        }
                    },
                    data: [provider.new, provider.total, provider.active]
                },
                {
                    name: 'Customers',
                    type: 'bar',
                    barWidth: '25%',
                    itemStyle: {
                        color: '#10b981', // emerald-500
                        borderRadius: [6, 6, 0, 0]
                    },
                    emphasis: {
                        itemStyle: {
                            color: '#059669' // emerald-600
                        }
                    },
                    data: [customer.new, customer.total, customer.active]
                }
            ]
        };
    }
}
