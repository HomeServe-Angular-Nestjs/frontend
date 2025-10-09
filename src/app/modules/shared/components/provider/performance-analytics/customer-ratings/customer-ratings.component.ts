import { CommonModule } from "@angular/common";
import { Component, inject, OnDestroy, OnInit } from "@angular/core";
import { EChartsOption } from "echarts";
import { NgxEchartsModule } from 'ngx-echarts';
import { Subject, takeUntil } from "rxjs";
import { AnalyticService } from "../../../../../../core/services/analytics.service";
import { IReviewChartData } from "../../../../../../core/models/analytics.model";

@Component({
  selector: 'app-performance-ratings',
  imports: [CommonModule, NgxEchartsModule],
  providers: [AnalyticService],
  styles: [`
    .custom-scrollbar::-webkit-scrollbar {
      width: 6px;
    }
    .custom-scrollbar::-webkit-scrollbar-track {
      background: #f1f5f9;
      border-radius: 10px;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb {
      background: #cbd5e1;
      border-radius: 10px;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb:hover {
      background: #94a3b8;
    }
  `],
  template: `
      <div class="bg-white rounded-2xl shadow-lg p-6 border border-slate-100 hover:shadow-xl transition-shadow duration-300">
        <div>
          <h2 class="text-2xl font-semibold text-slate-900">Customer Satisfaction</h2>
          <p class="text-sm text-slate-500 mt-1">Rating distribution & trends</p>
        </div>
      
        <!-- Rating Distribution -->
        <div echarts [options]="barChartOptions" class="h-64 mb-4"></div>
      
        <!-- Recent Reviews -->
        <div class="mt-6 pt-6 border-t border-slate-100">
          <h3 class="text-sm font-bold text-slate-700 mb-3 uppercase tracking-wide">Recent Reviews</h3>
          <div class="space-y-2 max-h-48 overflow-y-auto custom-scrollbar">
          <ng-container *ngIf="ratingStats.reviews.length;else noReviews">
            <div *ngFor="let review of ratingStats.reviews" 
              class="p-3 rounded-lg bg-gradient-to-r from-slate-50 to-blue-50 hover:from-blue-50 hover:to-indigo-50 transition-all duration-200 border border-slate-100">
              <div class="flex items-center justify-between mb-1">
                <span class="font-semibold text-slate-800 text-sm">{{review.name}}</span>
                <span class="text-amber-500 font-bold text-sm">{{review.rating}}★</span>
              </div>
              <p class="text-xs text-slate-600 line-clamp-2">{{review.desc}}</p>
            </div>
          </ng-container>

          <ng-template #noReviews>
            <p class="text-sm text-slate-400 italic">No reviews yet.</p>
          </ng-template>
        </div>
      </div>
    `
})
export class ProviderPerformanceRatingChartComponent implements OnInit, OnDestroy {
  private readonly _analyticService = inject(AnalyticService);
  private _destroy$ = new Subject<void>();


  barChartOptions: EChartsOption = {};
  ratingStats: IReviewChartData = {
    distributions: [],
    reviews: []
  };

  ngOnInit(): void {
    this._analyticService.getPerformanceRatingTrends()
      .pipe(takeUntil(this._destroy$))
      .subscribe(res => {
        if (res.data) {
          this.ratingStats = res.data;
          this._setChartOption();
        }
      });
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }

  private _setChartOption() {
    const yAxisRatings = [5, 4, 3, 2, 1];
    const seriesData = yAxisRatings.map(rating => {
      const found = this.ratingStats.distributions.find(d => d.rating === rating);
      return found ? found.count : 0;
    });

    this.barChartOptions = {
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        formatter: '{b}<br/>{c} reviews',
        backgroundColor: 'rgba(255,255,255,0.95)',
        borderColor: '#e5e7eb',
        borderWidth: 1,
        textStyle: { color: '#374151' }
      },
      grid: { left: '15%', right: '5%', top: '10%', bottom: '10%' },
      xAxis: {
        type: 'value',
        axisLine: { show: false },
        splitLine: { lineStyle: { color: '#f1f5f9', type: 'dashed' } },
        axisLabel: { color: '#64748b' }
      },
      yAxis: {
        type: 'category',
        data: ['5★', '4★', '3★', '2★', '1★'],
        inverse: true,
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { fontWeight: 'bold', fontSize: 13, color: '#475569' }
      },
      series: [{
        name: 'Reviews',
        type: 'bar',
        data: seriesData,
        barWidth: 18,
        label: {
          show: true,
          position: 'right',
          color: '#475569',
          fontWeight: 'bold',
          fontSize: 12,
          formatter: '{c}'
        },
        itemStyle: {
          borderRadius: [0, 10, 10, 0],
          color: (params) => {
            const colors = [
              {
                type: 'linear' as const,
                x: 0, y: 0, x2: 1, y2: 0,
                colorStops: [
                  { offset: 0, color: '#ef4444' }, // red for 1 star
                  { offset: 1, color: '#dc2626' }
                ]
              },
              {
                type: 'linear' as const,
                x: 0, y: 0, x2: 1, y2: 0,
                colorStops: [
                  { offset: 0, color: '#f97316' }, // orange for 2 stars
                  { offset: 1, color: '#ea580c' }
                ]
              },
              {
                type: 'linear' as const,
                x: 0, y: 0, x2: 1, y2: 0,
                colorStops: [
                  { offset: 0, color: '#eab308' }, // yellow for 3 stars
                  { offset: 1, color: '#ca8a04' }
                ]
              },
              {
                type: 'linear' as const,
                x: 0, y: 0, x2: 1, y2: 0,
                colorStops: [
                  { offset: 0, color: '#22c55e' }, // green for 4 stars
                  { offset: 1, color: '#16a34a' }
                ]
              },
              {
                type: 'linear' as const,
                x: 0, y: 0, x2: 1, y2: 0,
                colorStops: [
                  { offset: 0, color: '#14b8a6' }, // teal for 5 stars
                  { offset: 1, color: '#0f766e' }
                ]
              }
            ];
            return colors[params.dataIndex] as any;
          }
        }

      }]
    };
  }
}