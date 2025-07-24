import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxEchartsModule } from 'ngx-echarts';
import { AdminService } from '../../../../../../core/services/admin.service';
import { EChartsOption } from 'echarts';


@Component({
    selector: 'app-admin-dashboard-revenue-chart',
    templateUrl: './revenue-chart.component.html',
    styles: [`
    :host {
        display: block;
    }
    `],
    imports: [CommonModule, NgxEchartsModule],
})
export class AdminRevenueChartComponent implements OnInit {
    options: EChartsOption = {};
    updateOptions: EChartsOption = {};

    private oneDay = 24 * 3600 * 1000;
    private now!: Date;
    private value!: number;
    private data!: [string, number][];
    private timer: any;

    ngOnInit(): void {
        this.data = [];
        this.now = new Date(2024, 0, 1); // Starting date
        this.value = Math.random() * 10000;

        for (let i = 0; i < 100; i++) {
            this.data.push(this.randomData());
        }

        this.options = {
            title: {
                text: 'Revenue Analysis',
                left: 'left',
                textStyle: {
                    fontSize: 16,
                    fontWeight: 600,
                    color: '#333',
                },
            },
            tooltip: {
                trigger: 'axis',
                formatter: (params: any) => {
                    const p = params[0];
                    const date = new Date(p.value[0]).toLocaleString();
                    const amount = p.value[1];
                    return `📅 Date: ${date}<br/>💰 Amount: ₹${amount.toLocaleString()}`;
                },
                axisPointer: {
                    animation: false,
                },
            },
            xAxis: {
                type: 'time',
                name: 'Date & Time',
                axisLabel: {
                    formatter: (value: any) => new Date(value).toLocaleDateString(),
                },
                splitLine: { show: false },
            },
            yAxis: {
                type: 'value',
                name: 'Amount (₹)',
                boundaryGap: [0, '10%'],
                splitLine: { show: true },
            },
            series: [
                {
                    name: 'Revenue',
                    type: 'line',
                    showSymbol: false,
                    smooth: true,
                    symbolSize: 6,
                    data: this.data,
                    lineStyle: {
                        color: '#556B2F',
                        width: 2,
                    },
                    itemStyle: {
                        color: '#8FBC8F',
                    },
                    areaStyle: {
                        color: 'rgba(143, 188, 143, 0.2)',
                    },
                },
            ],
        };

        this.timer = setInterval(() => {
            for (let i = 0; i < 2; i++) {
                this.data.shift();
                this.data.push(this.randomData());
            }

            this.updateOptions = {
                series: [{ data: this.data }],
            };
        }, 1000);
    }

    ngOnDestroy(): void {
        clearInterval(this.timer);
    }

    randomData(): [string, number] {
        this.now = new Date(this.now.getTime() + this.oneDay);
        this.value = this.value + Math.random() * 1000 - 500;
        return [
            this.now.toISOString(),
            Math.max(0, Math.round(this.value)),
        ];
    }
}