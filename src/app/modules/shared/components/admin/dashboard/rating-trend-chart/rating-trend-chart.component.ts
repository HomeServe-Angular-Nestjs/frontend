import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxEchartsModule } from 'ngx-echarts';
import { EChartsOption } from 'echarts';
import { AdminService } from '../../../../../../core/services/admin.service';
import { ToastrService } from 'ngx-toastr';
import { Subject, filter, map, takeUntil } from 'rxjs';
import { AdminChartCardComponent } from '../../../../partials/sections/admin/chart-card/admin-chart-card.component';

@Component({
    selector: 'app-admin-rating-trend-chart',
    standalone: true,
    imports: [CommonModule, NgxEchartsModule, AdminChartCardComponent],
    templateUrl: './rating-trend-chart.component.html',
})
export class RatingTrendChartComponent implements OnInit, OnDestroy {
    private readonly _adminService = inject(AdminService);
    private readonly _toastr = inject(ToastrService);
    private readonly _destroy$ = new Subject<void>();

    chartOptions: EChartsOption = {};
    isLoading = true;
    isEmpty = false;

    ngOnInit(): void {
        this._adminService.getRatingTrend(30).pipe(
            map(res => res.data),
            filter(Boolean),
            takeUntil(this._destroy$)
        ).subscribe({
            next: (data) => {
                this.isEmpty = data.length === 0;
                this._setupChart(data);
                this.isLoading = false;
            },
            error: () => {
                this._toastr.error('Failed to fetch rating trend');
                this.isLoading = false;
            }
        });
    }

    private _setupChart(data: { date: string; avgRating: number; count: number }[]): void {
        const last30Days = Array.from({ length: 30 }, (_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - (29 - i));
            return d.toISOString().slice(0, 10);
        });

        const ratingByDate = new Map(data.map(p => [p.date, p.avgRating]));
        const dates = last30Days.map(day => {
            const [, month, date] = day.split('-');
            return `${date}/${month}`;
        });
        const values = last30Days.map(day => ratingByDate.get(day) ?? null);

        this.chartOptions = {
            tooltip: {
                trigger: 'axis',
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                borderRadius: 12,
                padding: [10, 15],
                textStyle: { color: '#1e293b', fontSize: 13 },
                axisPointer: {
                    lineStyle: { color: '#f59e0b', width: 2, type: 'dashed' }
                },
                formatter: (params: any) => {
                    const p = params[0];
                    return `
                        <div class="flex flex-col gap-1">
                            <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">${p.name}</span>
                            <div class="flex items-center gap-2 pt-1">
                                <span class="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                                <span class="text-slate-500 font-medium">Avg Rating:</span>
                                <span class="text-amber-600 font-black">${p.value ?? '—'}</span>
                            </div>
                        </div>
                    `;
                }
            },
            grid: { top: '10%', left: '3%', right: '4%', bottom: '5%', containLabel: true },
            xAxis: {
                type: 'category',
                data: dates,
                axisTick: { show: false },
                axisLine: { lineStyle: { color: '#f1f5f9' } },
                axisLabel: { color: '#94a3b8', fontSize: 11, fontWeight: 600, margin: 15 }
            },
            yAxis: {
                type: 'value',
                min: 0,
                max: 5,
                splitLine: { lineStyle: { type: 'dashed', color: '#f1f5f9' } },
                axisLabel: { color: '#94a3b8', fontSize: 11 }
            },
            series: [
                {
                    name: 'Avg Rating',
                    type: 'line',
                    showSymbol: false,
                    connectNulls: true,
                    smooth: true,
                    data: values,
                    lineStyle: { color: '#f59e0b', width: 3 },
                    itemStyle: { color: '#f59e0b' },
                    areaStyle: {
                        color: {
                            type: 'linear',
                            x: 0, y: 0, x2: 0, y2: 1,
                            colorStops: [
                                { offset: 0, color: 'rgba(245, 158, 11, 0.2)' },
                                { offset: 1, color: 'rgba(245, 158, 11, 0)' }
                            ]
                        }
                    },
                    markLine: {
                        silent: true,
                        symbol: 'none',
                        lineStyle: { type: 'dashed', color: '#cbd5e1' },
                        label: { color: '#64748b', fontSize: 10 },
                        data: [{ yAxis: 4 }]
                    }
                }
            ]
        };
    }

    ngOnDestroy(): void {
        this._destroy$.next();
        this._destroy$.complete();
    }
}
