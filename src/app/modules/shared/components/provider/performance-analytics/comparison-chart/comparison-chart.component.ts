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
  <div class="pt-4 pb-6 ">
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
        borderColor: '#e5e7eb',
        borderWidth: 1,
        textStyle: { color: '#374151' },
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
            <span style="font-size: 11px; color: #6b7280;">${trend}</span>
          </div>`;
          });
          return tooltipText;
        }
      },
      legend: {
        data: ['Your Performance', 'Platform Average'],
        top: 10,
        textStyle: { fontSize: 13, color: '#475569', fontWeight: 600 },
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
        axisLine: { lineStyle: { color: '#e5e7eb', width: 2 } },
        axisLabel: {
          fontSize: 12,
          color: '#64748b',
          fontWeight: 500
        },
        axisTick: { show: false }
      },
      yAxis: {
        type: 'value',
        name: 'Bookings',
        nameTextStyle: {
          color: '#64748b',
          fontSize: 13,
          fontWeight: 600,
          padding: [0, 0, 0, 0]
        },
        axisLine: { show: true, lineStyle: { color: '#e5e7eb', width: 2 } },
        splitLine: { lineStyle: { color: '#f1f5f9', type: 'dashed' } },
        axisLabel: {
          color: '#64748b',
          fontSize: 12,
          fontWeight: 500
        }
      },
      series: [
        {
          name: 'Your Performance',
          type: 'line',
          data: yourPerformanceData,
          smooth: true,
          lineStyle: {
            color: '#8b5cf6',
            width: 4,
            shadowColor: 'rgba(139, 92, 246, 0.3)',
            shadowBlur: 10,
            shadowOffsetY: 5
          },
          symbol: 'circle',
          symbolSize: 10,
          itemStyle: {
            color: '#8b5cf6',
            borderColor: '#fff',
            borderWidth: 3,
            shadowColor: 'rgba(139, 92, 246, 0.5)',
            shadowBlur: 8
          },
          emphasis: {
            scale: true,
            focus: 'series',
          },
          areaStyle: {
            color: {
              type: 'linear',
              x: 0, y: 0, x2: 0, y2: 1,
              colorStops: [
                { offset: 0, color: 'rgba(139, 92, 246, 0.25)' },
                { offset: 1, color: 'rgba(139, 92, 246, 0.02)' }
              ]
            }
          },
          label: {
            show: true,
            position: 'top',
            formatter: '{c}',
            fontSize: 11,
            fontWeight: 'bold',
            color: '#7c3aed',
            backgroundColor: '#f5f3ff',
            padding: [4, 8],
            borderRadius: 6,
            borderColor: '#ddd6fe',
            borderWidth: 1
          }
        },
        {
          name: 'Platform Average',
          type: 'line',
          data: platformAvgData,
          smooth: true,
          lineStyle: {
            type: 'dashed',
            color: '#94a3b8',
            width: 3
          },
          symbol: 'circle',
          symbolSize: 7,
          itemStyle: {
            color: '#cbd5e1',
            borderColor: '#fff',
            borderWidth: 2
          },
          emphasis: {
            scale: true,
          },
          label: {
            show: false
          }
        }
      ]
    };
  }
}
