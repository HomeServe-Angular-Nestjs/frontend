import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxEchartsModule } from 'ngx-echarts';
import type { EChartsOption } from 'echarts';

interface PeakHourData {
    hour: number;           // 0–23
    weekdayBookings: number;
    weekendBookings: number;
}

@Component({
    selector: 'app-peak-service-times',
    standalone: true,
    imports: [CommonModule, NgxEchartsModule],
    template: `
    <section class="bg-white rounded-2xl shadow-lg p-6 w-full">
      <header class="flex items-center justify-between mb-6">
        <div>
          <h2 class="text-xl font-semibold text-gray-800">Peak Service Times</h2>
          <p class="text-sm text-gray-500 mt-1">
            Shows when your services are most in demand.
          </p>
        </div>
      </header>

      <div *ngIf="chartOption" echarts [options]="chartOption" class="h-[500px] w-full"></div>

      <div *ngIf="!chartOption" class="flex items-center justify-center h-[500px] text-gray-400 text-sm">
        Loading chart data...
      </div>
    </section>
  `
})
export class PeakServiceTimesComponent implements OnInit {
    chartOption!: EChartsOption;

    private dummyData: PeakHourData[] = Array.from({ length: 24 }, (_, i) => ({
        hour: i,
        weekdayBookings: Math.floor(Math.random() * 50) + 20,
        weekendBookings: Math.floor(Math.random() * 50) + 10
    }));

    ngOnInit(): void {
        const hours = this.dummyData.map(d => `${d.hour}:00`);
        const weekdayData = this.dummyData.map(d => d.weekdayBookings);
        const weekendData = this.dummyData.map(d => d.weekendBookings);

        this.chartOption = {
            tooltip: {
                trigger: 'axis',
                formatter: (params: any) => {
                    const d = params[0].dataIndex;
                    return `<strong>${hours[d]}</strong><br/>
                  Weekday Bookings: ${weekdayData[d]}<br/>
                  Weekend Bookings: ${weekendData[d]}`;
                },
                backgroundColor: '#333',
                textStyle: { color: '#fff' },
                padding: [8, 12]
            },
            legend: {
                data: ['Weekday', 'Weekend'],
                textStyle: { color: '#374151', fontWeight: 500 },
                top: 10
            },
            grid: { left: 50, right: 20, top: 60, bottom: 50 },
            xAxis: {
                type: 'category',
                data: hours,
                axisLabel: { color: '#374151', fontWeight: 500, rotate: 45 },
                axisLine: { lineStyle: { color: '#ccc' } }
            },
            yAxis: {
                type: 'value',
                name: 'Bookings',
                axisLabel: { color: '#374151', fontWeight: 500 },
                axisLine: { lineStyle: { color: '#ccc' } },
                splitLine: { lineStyle: { type: 'dashed', color: '#E5E7EB' } }
            },
            series: [
                {
                    name: 'Weekday',
                    type: 'line',
                    data: weekdayData,
                    smooth: true,
                    symbol: 'circle',
                    symbolSize: 6,
                    lineStyle: { color: '#3B82F6', width: 2 }, 
                    itemStyle: { color: '#3B82F6' }
                },
                {
                    name: 'Weekend',
                    type: 'line',
                    data: weekendData,
                    smooth: true,
                    symbol: 'circle',
                    symbolSize: 6,
                    lineStyle: { color: '#F59E0B', width: 2 },
                    itemStyle: { color: '#F59E0B' }
                }
            ]
        };
    }
}
