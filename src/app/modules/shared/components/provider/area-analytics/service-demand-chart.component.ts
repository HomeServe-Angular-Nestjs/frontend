import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxEchartsModule } from 'ngx-echarts';
import type { EChartsOption } from 'echarts';
import { Subject, take, takeUntil } from 'rxjs';
import { AnalyticService } from '../../../../../core/services/analytics.service';

@Component({
    selector: 'app-area-service-demand-chart',
    standalone: true,
    imports: [CommonModule, NgxEchartsModule],
    providers: [AnalyticService],
    template: `
    <section class="bg-white rounded-2xl shadow-lg p-6 w-full">
      <header class="flex items-center justify-between mb-6">
        <div>
          <h2 class="text-xl font-semibold text-gray-800">Service Demand Heatmap</h2>
          <p class="text-sm text-gray-500 mt-1">
            Visualizes when services are most in demand throughout the week.
          </p>
        </div>
      </header>

      <div *ngIf="chartOption" echarts [options]="chartOption" class="h-[500px] w-full"></div>

      <div *ngIf="!chartOption" class="flex items-center justify-center h-[500px] text-gray-400 text-sm">
        Loading heatmap data...
      </div>
    </section>
  `
})
export class ServiceDemandHeatmapComponent implements OnInit {
    private readonly _analyticService = inject(AnalyticService);
    private _destroy$ = new Subject<void>();

    chartOption!: EChartsOption;

    private readonly days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    private readonly hours = Array.from({ length: 18 }, (_, i) => `${i + 6}:00`); // 6 AM to 11 PM

    ngOnInit() {
        this._analyticService.getServiceDemandHeatmapData()
            .pipe(takeUntil(this._destroy$)) 
            .subscribe({
                next: (data:any) => this.setupChart(data),
                error: () => console.error('Failed to load heatmap data.')
            });
    }

    private setupChart(rawData: { day: string; hour: string; count: number }[]) {
        const data = rawData.map(d => [
            this.days.indexOf(d.day),
            this.hours.indexOf(d.hour),
            d.count
        ]);

        this.chartOption = {
            tooltip: {
                position: 'top',
                backgroundColor: '#1B5E20',
                textStyle: { color: '#fff' },
                borderWidth: 0,
                formatter: ({ value }: any) =>
                    `<b>${this.days[value[0]]}, ${this.hours[value[1]]}</b><br/>Bookings: ${value[2]}`
            },
            grid: { top: 40, left: 70, bottom: 60 },
            xAxis: {
                type: 'category',
                data: this.days,
                splitArea: { show: true },
                axisLabel: { color: '#374151', fontWeight: 600 },
                axisLine: { lineStyle: { color: '#ccc' } }
            },
            yAxis: {
                type: 'category',
                data: this.hours,
                splitArea: { show: true },
                axisLabel: { color: '#374151', fontWeight: 600 },
                axisLine: { lineStyle: { color: '#ccc' } }
            },
            visualMap: {
                min: 0,
                max: Math.max(...data.map(d => d[2]), 1),
                calculable: true,
                orient: 'horizontal',
                left: 'center',
                bottom: 10,
                inRange: { color: ['#E8F5E9', '#1B5E20'] },
                textStyle: { color: '#374151', fontWeight: 600 }
            },
            series: [{
                name: 'Service Demand',
                type: 'heatmap',
                data,
                label: { show: false },
                emphasis: {
                    itemStyle: {
                        shadowBlur: 10,
                        shadowColor: 'rgba(0, 0, 0, 0.4)'
                    }
                }
            }]
        };
    }
}
