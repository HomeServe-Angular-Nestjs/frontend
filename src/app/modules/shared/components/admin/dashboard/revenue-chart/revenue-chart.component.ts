import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxEchartsModule } from 'ngx-echarts';
import { AdminService } from '../../../../../../core/services/admin.service';


@Component({
    selector: 'app-admin-dashboard-revenue-chart',
    imports: [CommonModule, NgxEchartsModule],
    template: `
    <div echarts 
         [options]="chartOptions" 
         class="w-full h-96 border rounded-xl shadow-sm bg-white p-4">
    </div>
  `,
    styles: [`
    :host {
      display: block;
    }
  `]
})
export class AdminRevenueChartComponent implements OnInit {
    private readonly _adminService = inject(AdminService);

    chartOptions: any;

    // Simulated data array from your DB
    transactionData = [
        {
            amount: 71906,
            createdAt: '2025-07-14T14:59:39.169Z'
        },
        {
            amount: 50230,
            createdAt: '2025-07-15T10:22:11.000Z'
        },
        {
            amount: 81200,
            createdAt: '2025-07-16T17:45:00.000Z'
        }
    ];

    ngOnInit() {
        let formattedData = [];
        this._adminService.getDashboardRevenueData().subscribe(res => {
            if (res.data) {
                formattedData = res.data
            }
        });

        formattedData = this.transactionData.map(tx => {
            return [new Date(tx.createdAt).getTime(), tx.amount];
        });

        this.chartOptions = {
            title: {
                text: 'Revenue Analysis',
                left: 'left',
                textStyle: {
                    fontSize: 16,
                    fontWeight: '600',
                    color: '#333',
                    marginBottom: '10px'
                }
            },
            tooltip: {
                trigger: 'axis',
                formatter: (params: any) => {
                    const date = new Date(params[0].value[0]).toLocaleString();
                    const amount = params[0].value[1];
                    return `Date: ${date}<br/>Amount: ₹${amount}`;
                }
            },
            xAxis: {
                type: 'time',
                name: 'Date & Time',
                axisLabel: {
                    formatter: (value: any) => new Date(value).toLocaleDateString()
                }
            },
            yAxis: {
                type: 'value',
                name: 'Amount (₹)'
            },
            series: [
                {
                    data: formattedData,
                    type: 'line',
                    smooth: true,
                    symbol: 'circle',
                    symbolSize: 8,
                    lineStyle: {
                        color: '#556B2F',
                        width: 2
                    },
                    itemStyle: {
                        color: '#8FBC8F'
                    },
                    areaStyle: {
                        color: 'rgba(143, 188, 143, 0.2)'
                    }
                }
            ]
        };
    }
}