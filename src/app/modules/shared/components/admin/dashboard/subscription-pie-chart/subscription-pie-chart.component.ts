import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxEchartsModule } from 'ngx-echarts';
import { EChartsOption } from 'echarts';
import { AdminService } from '../../../../../../core/services/admin.service';
import { filter, map } from 'rxjs';
import { IAdminDashboardSubscription } from '../../../../../../core/models/subscription.model';

@Component({
    selector: 'app-admin-subscription-pie-chart',
    standalone: true,
    imports: [CommonModule, NgxEchartsModule],
    templateUrl: './subscription-pie-chart.component.html',
})
export class SubscriptionPieChartComponent implements OnInit {
    private readonly _adminService = inject(AdminService);

    chartOptions: EChartsOption = {};
    isLoading = true;
    totalSubscribers = 0;

    ngOnInit() {
        this._adminService.getSubscriptionData().pipe(
            map(res => res.data),
            filter(Boolean)
        ).subscribe({
            next: (data) => {
                this.totalSubscribers = data.totalProviders;
                this._setChart(data);
                this.isLoading = false;
            },
            error: (err) => {
                console.error('Error fetching subscription data:', err);
                this.isLoading = false;
            }
        });
    }

    private _setChart(subscriptionData: IAdminDashboardSubscription) {
        const { monthlyPremium, yearlyPremium } = subscriptionData;

        this.chartOptions = {
            tooltip: {
                trigger: 'item',
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                borderRadius: 12,
                padding: [10, 15],
                textStyle: {
                    color: '#1e293b',
                    fontSize: 13
                },
                formatter: (params: any) => {
                    return `
                        <div class="flex items-center gap-2">
                            <span class="w-3 h-3 rounded-full" style="background-color: ${params.color}"></span>
                            <span class="font-bold text-slate-700">${params.name}:</span>
                            <span class="text-slate-500">${params.value} (${params.percent}%)</span>
                        </div>
                    `;
                }
            },
            legend: {
                orient: 'vertical',
                right: '5%',
                top: 'middle',
                icon: 'circle',
                itemWidth: 10,
                itemHeight: 10,
                itemGap: 20,
                textStyle: {
                    color: '#64748b',
                    fontSize: 12,
                    fontWeight: 500
                }
            },
            series: [
                {
                    name: 'Subscriptions',
                    type: 'pie',
                    radius: ['55%', '85%'],
                    center: ['40%', '50%'],
                    avoidLabelOverlap: false,
                    itemStyle: {
                        borderRadius: 12,
                        borderColor: '#fff',
                        borderWidth: 3
                    },
                    label: {
                        show: false,
                        position: 'center'
                    },
                    emphasis: {
                        scale: true,
                        scaleSize: 8,
                        label: {
                            show: false
                        }
                    },
                    labelLine: {
                        show: false
                    },
                    data: [
                        {
                            value: monthlyPremium,
                            name: 'Monthly',
                            itemStyle: { color: '#6366f1' } // indigo-500
                        },
                        {
                            value: yearlyPremium,
                            name: 'Yearly',
                            itemStyle: { color: '#10b981' } // emerald-500
                        }
                    ]
                }
            ]
        };
    }
}
