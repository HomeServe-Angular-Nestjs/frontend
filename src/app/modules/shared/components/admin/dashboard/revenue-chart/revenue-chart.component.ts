import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxEchartsModule } from 'ngx-echarts';
import { EChartsOption, graphic } from 'echarts';
import { AdminService } from '../../../../../../core/services/admin.service';
import { filter, map } from 'rxjs';

@Component({
    selector: 'app-admin-dashboard-revenue-chart',
    standalone: true,
    imports: [CommonModule, NgxEchartsModule],
    templateUrl: './revenue-chart.component.html',
})
export class AdminRevenueChartComponent implements OnInit {
    private readonly _adminService = inject(AdminService);

    options: EChartsOption = {};
    isLoading = true;

    ngOnInit(): void {
        this._fetchRevenueData();
    }

    private _fetchRevenueData(): void {
        this._adminService.getDashboardRevenueData().pipe(
            map(res => res.data),
            filter(Boolean)
        ).subscribe({
            next: (data) => {
                this._setupChart(data);
                this.isLoading = false;
            },
            error: (err) => {
                console.error('Error fetching revenue data:', err);
                this.isLoading = false;
            }
        });
    }

    private _setupChart(data: { date: string, amount: number }[]): void {
        const dates = data.map(item => new Date(item.date).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short'
        }));
        const amounts = data.map(item => item.amount);

        this.options = {
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
                    lineStyle: {
                        color: '#6366f1',
                        width: 2,
                        type: 'dashed'
                    }
                },
                formatter: (params: any) => {
                    const p = params[0];
                    return `
                        <div class="flex flex-col gap-1">
                            <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">${p.name}</span>
                            <div class="flex items-center gap-2 pt-1">
                                <span class="w-2.5 h-2.5 rounded-full bg-indigo-500"></span>
                                <span class="text-slate-500 font-medium">Revenue:</span>
                                <span class="text-indigo-600 font-black">₹${p.value.toLocaleString()}</span>
                            </div>
                        </div>
                    `;
                }
            },
            grid: {
                top: '5%',
                left: '3%',
                right: '4%',
                bottom: '5%',
                containLabel: true
            },
            xAxis: {
                type: 'category',
                data: dates,
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
                    fontSize: 11,
                    formatter: (value: number) => {
                        if (value >= 1000) return `₹${value / 1000}k`;
                        return `₹${value}`;
                    }
                }
            },
            series: [
                {
                    name: 'Revenue',
                    type: 'line',
                    showSymbol: true,
                    symbol: 'circle',
                    symbolSize: 8,
                    smooth: true,
                    data: amounts,
                    lineStyle: {
                        color: '#6366f1',
                        width: 3
                    },
                    itemStyle: {
                        color: '#6366f1',
                        borderWidth: 2,
                        borderColor: '#fff'
                    },
                    areaStyle: {
                        color: new graphic.LinearGradient(0, 0, 0, 1, [
                            { offset: 0, color: 'rgba(99, 102, 241, 0.2)' },
                            { offset: 1, color: 'rgba(99, 102, 241, 0)' }
                        ])
                    },
                    // emphasis: {
                    //     itemStyle: {
                    //         // scale: true,
                    //         // size: 10
                    //     }
                    // }
                }
            ]
        };
    }
}