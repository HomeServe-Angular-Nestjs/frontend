import { Component, OnInit } from '@angular/core';
import { EChartsOption } from 'echarts';
import { NgxEchartsModule } from 'ngx-echarts';


@Component({
    selector: 'app-admin-top-earning-providers-bar-chart',
    templateUrl: './top-earning-providers-bar-chart.component.html',
    imports: [NgxEchartsModule]
})
export class AdminTopProvidersBarChartComponent implements OnInit {
    chartOptions: EChartsOption = {};

    ngOnInit(): void {
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
                data: [
                    'Provider A', 'Provider B', 'Provider C', 'Provider D', 'Provider E',
                    'Provider F', 'Provider G', 'Provider H', 'Provider I', 'Provider J'
                ],
                
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
                    data: [92000, 87000, 83000, 79000, 76000, 74000, 72000, 69000, 67000, 65000]
                }
            ]
        };

    }
}