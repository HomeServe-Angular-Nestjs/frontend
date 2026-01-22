import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EChartsOption, graphic } from 'echarts';
import { NgxEchartsModule } from 'ngx-echarts';
import { AdminService } from '../../../../../../core/services/admin.service';
import { filter, map } from 'rxjs';
import { ITopProviders } from '../../../../../../core/models/user.model';

@Component({
    selector: 'app-admin-top-earning-providers-bar-chart',
    standalone: true,
    imports: [CommonModule, NgxEchartsModule],
    templateUrl: './top-earning-providers-bar-chart.component.html',
})
export class AdminTopProvidersBarChartComponent implements OnInit {
    private readonly _adminService = inject(AdminService);

    chartOptions: EChartsOption = {};
    isLoading = true;

    ngOnInit(): void {
        this._adminService.getTopEarningProviders().pipe(
            map(res => res.data),
            filter(Boolean)
        ).subscribe({
            next: (data) => {
                this._setupChart(data);
                this.isLoading = false;
            },
            error: (err) => {
                console.error('Error fetching top earning providers:', err);
                this.isLoading = false;
            }
        })
    }

    private _setupChart(data: ITopProviders[]): void {
        const usernames = data.map(d => d.username);
        const earnings = data.map(d => d.totalEarnings / 100);

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
                        color: 'rgba(16, 185, 129, 0.05)'
                    }
                },
                formatter: (params: any) => {
                    const item = params[0];
                    return `
                        <div class="flex flex-col gap-1">
                            <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Provider</span>
                            <span class="text-sm font-bold text-slate-800 mb-1">${item.name}</span>
                            <div class="flex items-center gap-2 border-t border-slate-100 pt-2 mt-1">
                                <span class="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                                <span class="text-slate-500 font-medium">Total Earnings:</span>
                                <span class="text-emerald-600 font-black">₹${item.value.toLocaleString()}</span>
                            </div>
                        </div>
                    `;
                }
            },
            grid: {
                top: '5%',
                left: '3%',
                right: '8%',
                bottom: '5%',
                containLabel: true
            },
            xAxis: {
                type: 'value',
                splitLine: {
                    lineStyle: {
                        type: 'dashed',
                        color: '#f1f5f9'
                    }
                },
                axisLabel: {
                    color: '#94a3b8',
                    fontSize: 11,
                    formatter: (value: number) => {
                        if (value >= 1000) return `₹${value / 1000}k`;
                        return `₹${value}`;
                    }
                }
            },
            yAxis: {
                type: 'category',
                data: usernames,
                inverse: true,
                axisTick: { show: false },
                axisLine: {
                    lineStyle: {
                        color: '#f1f5f9'
                    }
                },
                axisLabel: {
                    color: '#475569',
                    fontSize: 12,
                    fontWeight: 500,
                    margin: 15,
                    formatter: (name: string) => name.length > 15 ? name.slice(0, 15) + '…' : name
                }
            },
            series: [
                {
                    name: 'Earnings',
                    type: 'bar',
                    barWidth: '45%',
                    itemStyle: {
                        borderRadius: [0, 8, 8, 0],
                        color: new graphic.LinearGradient(0, 0, 1, 0, [
                            { offset: 0, color: '#10b981' }, // emerald-500
                            { offset: 1, color: '#34d399' }  // emerald-400
                        ])
                    },
                    emphasis: {
                        itemStyle: {
                            color: new graphic.LinearGradient(0, 0, 1, 0, [
                                { offset: 0, color: '#059669' }, // emerald-600
                                { offset: 1, color: '#10b981' }  // emerald-500
                            ])
                        }
                    },
                    label: {
                        show: true,
                        position: 'right',
                        distance: 10,
                        color: '#10b981',
                        fontWeight: 700,
                        fontSize: 12,
                        formatter: '₹{c}'
                    },
                    data: earnings
                }
            ]
        };
    }
}