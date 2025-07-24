import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxEchartsModule } from 'ngx-echarts';
import { EChartsOption } from 'echarts';
import { AdminService } from '../../../../../../core/services/admin.service';
import { filter, map } from 'rxjs';
import { IAdminDashboardSubscription } from '../../../../../../core/models/subscription.model';

@Component({
    selector: 'app-admin-subscription-pie-chart',
    imports: [CommonModule, NgxEchartsModule],
    templateUrl: './subscription-pie-chart.component.html',
})
export class SubscriptionPieChartComponent implements OnInit {
    private readonly _adminService = inject(AdminService);

    chartOptions: EChartsOption = {};

    ngOnInit() {
        this._adminService.getSubscriptionData().pipe(
            map(res => res.data),
            filter(Boolean)
        ).subscribe({
            next: (data) => {
                this._setChart(data);
            },
            error: (err) => {
                console.error('Error fetching subscription data:', err);
            }
        });
    }

    private _setChart(subscriptionData: IAdminDashboardSubscription) {
        const { free, totalPremium, monthlyPremium, yearlyPremium } = subscriptionData;

        this.chartOptions = {
            title: {
                text: 'Subscription Plan Distribution',
                left: 'left',
                textStyle: {
                    fontSize: 16,
                    fontWeight: 600
                }
            },
            tooltip: {
                trigger: 'item',
                formatter: '{b}: {c} ({d}%)'
            },
            legend: {
                top: 'bottom'
            },
            series: [
                {
                    name: 'Subscribers',
                    type: 'pie',
                    selectedMode: 'single',
                    radius: [0, '50%'],
                    label: {
                        position: 'inner',
                        fontSize: 14
                    },
                    data: [
                        { value: free, name: 'Free' },
                        { value: totalPremium, name: 'Premium' }
                    ]
                },
                {
                    name: 'Premium Split',
                    type: 'pie',
                    radius: ['60%', '80%'],
                    label: {
                        formatter: '{b|{b}}\n{c} ({d}%)',
                        rich: {
                            b: {
                                fontSize: 14,
                                lineHeight: 20
                            }
                        }
                    },
                    data: [
                        { value: monthlyPremium, name: 'Monthly' },
                        { value: yearlyPremium, name: 'Yearly' }
                    ]
                }
            ]
        };
    }
}
