import { Component, inject, OnInit } from "@angular/core";
import { AnalyticService } from "../../../../../../core/services/analytics.service";
import { Subject, takeUntil } from "rxjs";
import { IComparisonOverviewData } from "../../../../../../core/models/analytics.model";

@Component({
  selector: 'app-performance-comparison-overview',
  imports: [],
  providers: [AnalyticService],
  template: `
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-4 my-6">

        <!-- Growth Rate -->
        <div class="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200">
            <div class="flex items-center justify-between mb-2">
                <span class="text-xs font-semibold text-green-700 uppercase tracking-wide">Growth Rate</span>
                <svg class="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clip-rule="evenodd"/>
                </svg>
            </div>
            <div class="text-3xl font-bold text-green-700">+{{overViewData.growthRate.toFixed(0)}}%</div>
            <p class="text-xs text-green-600 mt-1">Above platform average</p> 
        </div>

        <!-- Monthly Trend -->
        <div class="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200">
            <div class="flex items-center justify-between mb-2">
                <span class="text-xs font-semibold text-green-700 uppercase tracking-wide">Monthly Trend</span>
                <svg class="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z"/>
                </svg>
            </div>
            <div class="text-3xl font-bold text-green-700">↗ {{overViewData.monthlyTrend.growthPercentage.toFixed(0)}}%</div>
            <p class="text-xs text-green-600 mt-1">
                Increase from {{monthNames[overViewData.monthlyTrend.previousMonth - 1]}} to {{monthNames[overViewData.monthlyTrend.currentMonth - 1]}}
            </p>
        </div>

        <!-- Ranking -->
        <div class="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200">
            <div class="flex items-center justify-between mb-2">
                <span class="text-xs font-semibold text-green-700 uppercase tracking-wide">Ranking</span>
                <svg class="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                </svg>
            </div>
            <div class="text-3xl font-bold text-green-700">Top {{overViewData.providerRank}}%</div>
            <p class="text-xs text-green-600 mt-1">Among all providers</p>
        </div>

    </div>
    `
})
export class ProviderPerformanceComparisonOverviewComponent implements OnInit {
  private readonly _analyticService = inject(AnalyticService);
  private _destroy$ = new Subject<void>();

  monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  overViewData: IComparisonOverviewData = {
    growthRate: 0,
    monthlyTrend: {
      previousMonth: 0,
      currentMonth: 0,
      previousRevenue: 0,
      currentRevenue: 0,
      growthPercentage: 0,
    },
    providerRank: 0,
  }

  ngOnInit(): void {
    this._analyticService.getComparisonOverviewData()
      .pipe(takeUntil(this._destroy$))
      .subscribe(res => this.overViewData = res.data || this.overViewData)
  }
}
