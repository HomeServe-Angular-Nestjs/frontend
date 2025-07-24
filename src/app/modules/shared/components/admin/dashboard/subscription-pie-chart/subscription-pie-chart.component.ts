import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxEchartsModule } from 'ngx-echarts';

@Component({
    selector: 'app-admin-subscription-pie-chart',
    imports: [CommonModule, NgxEchartsModule],
    templateUrl: './subscription-pie-chart.component.html',
})
export class SubscriptionPieChartComponent {
    subscriberData = {
        free: 1200,
        premium: {
            monthly: 600,
            yearly: 200,
        }
    };

    chartOptions: any;

    constructor() {
        const { free, premium } = this.subscriberData;
        const totalPremium = premium.monthly + premium.yearly;

        this.chartOptions = {
            title: {
                text: 'Subscription Plan Distribution',
                left: 'left',
                textStyle: {
                    paddingLeft: '20px',
                    fontSize: 16,
                    fontWeight: '600'
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
                        { value: premium.monthly, name: 'Monthly' },
                        { value: premium.yearly, name: 'Yearly' }
                    ]
                }
            ]
        };
    }
}
