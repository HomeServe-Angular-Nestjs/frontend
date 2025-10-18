import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { EChartsOption } from 'echarts';
import { NgxEchartsModule } from 'ngx-echarts';
import { Subject, takeUntil } from 'rxjs';
import { AnalyticService } from '../../../../../../core/services/analytics.service';
import { IComparisonChartData } from '../../../../../../core/models/analytics.model';

@Component({
  selector: 'app-performance-comparison',
  imports: [NgxEchartsModule],
  providers: [AnalyticService],
  template: `
  <div class="pt-4 pb-6">
    <div class="bg-white shadow-md rounded-lg p-4 border border-slate-100">
      <div echarts [options]="monthTrendLineOptions" class="h-96"></div>
    </div>
  </div>
  `
})
export class ProviderPerformanceComparisonChartComponent implements OnInit, OnDestroy {
  private readonly _analyticService = inject(AnalyticService);
  private readonly _destroy$ = new Subject<void>();

  monthTrendLineOptions: EChartsOption = {};
  monthTrendLineData: IComparisonChartData[] = [];

  ngOnInit(): void {
    this._analyticService.getComparisonStats()
      .pipe(takeUntil(this._destroy$))
      .subscribe(res => {
        this.monthTrendLineData = res.data ?? [];
        this._setMonthTrendLineData();
      });
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }

  private _setMonthTrendLineData() {
    const months = this.monthTrendLineData.map(d => d.month);
    const yourPerformanceData = this.monthTrendLineData.map(d => d.performance);
    const platformAvgData = this.monthTrendLineData.map(d => d.platformAvg);

    this.monthTrendLineOptions = {
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(255,255,255,0.95)',
        borderColor: '#d1fae5', // light green border
        borderWidth: 1,
        textStyle: { color: '#065f46' }, // dark green text
        formatter: function (params: any) {
          let tooltipText = `<div style="font-weight: bold; margin-bottom: 8px;">${params[0].axisValue}</div>`;
          params.forEach((item: any) => {
            const trend = item.dataIndex > 0 && params[0].data ?
              (item.data > params[0].data[item.dataIndex - 1] ? '📈 +' : '📉 ') : '';
            tooltipText += `
              <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
                <span style="display: inline-block; width: 10px; height: 10px; border-radius: 50%; background: ${item.color};"></span>
                <span style="font-weight: 600;">${item.seriesName}:</span>
                <span style="font-weight: bold;">${item.data}</span>
                <span style="font-size: 11px; color: #065f46;">${trend}</span>
              </div>`;
          });
          return tooltipText;
        }
      },
      legend: {
        data: ['Your Performance', 'Platform Average'],
        top: 10,
        textStyle: { fontSize: 13, color: '#065f46', fontWeight: 600 },
        itemGap: 20
      },
      grid: {
        top: 60,
        left: 60,
        right: 40,
        bottom: 50
      },
      xAxis: {
        type: 'category',
        data: months,
        axisLine: { lineStyle: { color: '#bbf7d0', width: 2 } },
        axisLabel: { fontSize: 12, color: '#047857', fontWeight: 500 },
        axisTick: { show: false }
      },
      yAxis: {
        type: 'value',
        name: 'Bookings',
        nameTextStyle: { color: '#047857', fontSize: 13, fontWeight: 600 },
        axisLine: { show: true, lineStyle: { color: '#bbf7d0', width: 2 } },
        splitLine: { lineStyle: { color: '#d1fae5', type: 'dashed' } },
        axisLabel: { color: '#047857', fontSize: 12, fontWeight: 500 }
      },
      series: [
        {
          name: 'Your Performance',
          type: 'line',
          data: yourPerformanceData,
          smooth: true,
          lineStyle: { color: '#10b981', width: 4, shadowColor: 'rgba(16,185,129,0.3)', shadowBlur: 10, shadowOffsetY: 5 },
          symbol: 'circle',
          symbolSize: 10,
          itemStyle: { color: '#10b981', borderColor: '#fff', borderWidth: 3, shadowColor: 'rgba(16,185,129,0.5)', shadowBlur: 8 },
          emphasis: { scale: true, focus: 'series' },
          areaStyle: {
            color: {
              type: 'linear',
              x: 0, y: 0, x2: 0, y2: 1,
              colorStops: [
                { offset: 0, color: 'rgba(16,185,129,0.25)' },
                { offset: 1, color: 'rgba(16,185,129,0.02)' }
              ]
            }
          },
          label: {
            show: true,
            position: 'top',
            formatter: '{c}',
            fontSize: 11,
            fontWeight: 'bold',
            color: '#065f46',
            backgroundColor: '#d1fae5',
            padding: [4, 8],
            borderRadius: 6,
            borderColor: '#10b981',
            borderWidth: 1
          }
        },
        {
          name: 'Platform Average',
          type: 'line',
          data: platformAvgData,
          smooth: true,
          lineStyle: { type: 'dashed', color: '#6ee7b7', width: 3 },
          symbol: 'circle',
          symbolSize: 7,
          itemStyle: { color: '#a7f3d0', borderColor: '#fff', borderWidth: 2 },
          emphasis: { scale: true },
          label: { show: false }
        }
      ]
    };
  }
}
