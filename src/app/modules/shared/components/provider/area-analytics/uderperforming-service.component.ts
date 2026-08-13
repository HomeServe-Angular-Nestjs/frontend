import { Component, inject, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxEchartsModule } from 'ngx-echarts';
import type { EChartsOption } from 'echarts';
import { IUnderperformingArea } from '../../../../../core/models/analytics.model';
import { InrCurrencyPipe } from '../../../../../core/pipes/inr-currency.pipe';
import { AnalyticsChartCardComponent } from '../../analytics/analytics-chart-card/analytics-chart-card.component';
import { ANALYTICS_COLORS } from '../../analytics/analytics.tokens';

@Component({
    selector: 'app-underperforming-areas',
    standalone: true,
    imports: [CommonModule, NgxEchartsModule, AnalyticsChartCardComponent],
    providers: [InrCurrencyPipe],
    template: `
        <app-analytics-chart-card
            title="Underperforming Areas"
            subtitle="Spot areas where revenue has declined compared to last month"
            [height]="'large'"
            [hasData]="underperformingData.length > 0"
            emptyTitle="No underperforming areas"
            emptyMessage="Declining areas will appear here when identified.">
            <div echarts [options]="chartOption" class="h-full w-full"></div>
        </app-analytics-chart-card>
    `,
})
export class UnderperformingAreasComponent {
    private readonly _currency = inject(InrCurrencyPipe);

    @Input()
    set data(value: IUnderperformingArea[]) {
        this.underperformingData = value ?? [];
        this.chartOption = this._getChartOption(this.underperformingData);
    }

    underperformingData: IUnderperformingArea[] = [];
    chartOption!: EChartsOption;

    private _getChartOption(data: IUnderperformingArea[]): EChartsOption {
        const locations = data.map(d => d.locationName);
        const changes = data.map(d => d.changePct);
        const colors = data.map(d => d.changePct >= 0 ? ANALYTICS_COLORS.positive : ANALYTICS_COLORS.negative);

        return {
            tooltip: {
                trigger: 'axis',
                axisPointer: { type: 'shadow' },
                formatter: (params: any) => {
                    const idx = params[0].dataIndex;
                    const d = data[idx];
                    return `<strong>${d.locationName}</strong><br/>
                  Last Month: ${this._currency.transform(d.lastMonthRevenue)}<br/>
                  Current Month: ${this._currency.transform(d.currentMonthRevenue)}<br/>
                  Change: <span style="color:${colors[idx]}">${d.changePct >= 0 ? '↑' : '↓'} ${Math.abs(d.changePct)}%</span>`;
                },
                backgroundColor: '#333',
                textStyle: { color: '#fff', fontSize: 12 },
                padding: [4, 8]
            },
            grid: { left: 120, right: 20, top: 50, bottom: 50 },
            xAxis: {
                type: 'value',
                name: '% Change',
                axisLine: { lineStyle: { color: ANALYTICS_COLORS.axis } },
                axisLabel: { color: ANALYTICS_COLORS.text, fontWeight: 500 },
                splitLine: { lineStyle: { type: 'dashed', color: ANALYTICS_COLORS.grid } }
            },
            yAxis: {
                type: 'category',
                data: locations,
                inverse: true,
                axisLine: { lineStyle: { color: ANALYTICS_COLORS.axis } },
                axisLabel: {
                    color: ANALYTICS_COLORS.text,
                    fontWeight: 500,
                    formatter: (value: string) => value.split(',')[3] ?? value
                }
            },
            series: [
                {
                    type: 'bar',
                    data: changes,
                    barWidth: 30,
                    label: {
                        show: true,
                        position: 'right',
                        formatter: (params: any) => {
                            return `${params.value >= 0 ? '↑' : '↓'} ${Math.abs(params.value)}%`;
                        },
                        color: '#111',
                        fontWeight: 600
                    },
                    itemStyle: {
                        color: (params: any) => colors[params.dataIndex],
                        borderRadius: 6,
                        shadowBlur: 10,
                        shadowColor: 'rgba(0,0,0,0.2)'
                    },
                    barCategoryGap: '40%'
                }
            ]
        };
    }
}