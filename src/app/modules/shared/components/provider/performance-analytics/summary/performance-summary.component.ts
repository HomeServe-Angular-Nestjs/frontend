import { Component, inject, OnDestroy, OnInit } from "@angular/core";
import { AnalyticService } from "../../../../../../core/services/analytics.service";
import { takeUntil, filter, Subject } from 'rxjs';
import { TimeFormatterPipe } from "../../../../../../core/pipes/time-formatter.pipe";
import { CommonModule } from "@angular/common";
import { MetricPerformanceBadgePipe } from "../../../../../../core/pipes/performance-label.pipe";
import { IResponse } from "../../../../models/response.model";
import { IOverviewCard, IProviderPerformanceOverview } from "../../../../../../core/models/analytics.model";

@Component({
    selector: 'app-performance-summary',
    templateUrl: './performance-summary.component.html',
    imports: [CommonModule, TimeFormatterPipe, MetricPerformanceBadgePipe],
    providers: [AnalyticService]
})
export class ProviderPerformanceSummaryComponent implements OnInit, OnDestroy {
    private readonly _analyticService = inject(AnalyticService);
    private _destroy$ = new Subject<void>();

    performanceOverviewStats: IProviderPerformanceOverview = {
        avgRating: 0,
        avgResponseTime: 0,
        completionRate: 0,
        onTimePercent: 0
    };

    overviewCards: IOverviewCard<IProviderPerformanceOverview>[] = [
        {
            label: 'Completion Rate',
            valueKey: 'completionRate',
            icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
            iconColor: 'from-green-400 to-emerald-600',
            badge: 'Excellent',
            badgeColor: 'bg-green-100 text-green-700',
            unit: '%',
            description: 'Completed jobs ÷ Total bookings'
        },
        {
            label: 'Average Rating',
            valueKey: 'avgRating',
            icon: 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z',
            iconColor: 'from-amber-400 to-orange-600',
            badge: 'Top Rated',
            badgeColor: 'bg-amber-100 text-amber-700',
            unit: '★',
            description: 'Based on customer feedback'
        },
        {
            label: 'Response Time',
            valueKey: 'avgResponseTime',
            icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
            iconColor: 'from-blue-400 to-indigo-600',
            badge: 'Fast',
            badgeColor: 'bg-blue-100 text-blue-700',
            unit: 'min',
            description: 'Average time to reply'
        },
        {
            label: 'On-Time Arrival',
            valueKey: 'onTimePercent',
            icon: 'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z',
            iconColor: 'from-purple-400 to-pink-600',
            badge: 'Reliable',
            badgeColor: 'bg-purple-100 text-purple-700',
            unit: '%',
            description: 'Punctuality performance'
        }
    ];

    ngOnInit(): void {
        this._getStats();
    }

    ngOnDestroy(): void {
        this._destroy$.next();
        this._destroy$.complete();
    }

    private _getStats() {
        this._analyticService.getPerformanceSummary()
            .pipe(
                takeUntil(this._destroy$),
                filter((res): res is Required<IResponse<IProviderPerformanceOverview>> => !!res.data)
            )
            .subscribe(res => this.performanceOverviewStats = res.data);
    }

}