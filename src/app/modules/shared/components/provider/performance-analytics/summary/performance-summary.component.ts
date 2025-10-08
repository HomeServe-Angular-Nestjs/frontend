import { Component, inject, OnDestroy, OnInit } from "@angular/core";
import { AnalyticService } from "../../../../../../core/services/analytics.service";
import { takeUntil, filter, Subject } from 'rxjs';
import { IProviderPerformanceOverview } from "../../../../../../core/models/user.model";
import { TimeFormatterPipe } from "../../../../../../core/pipes/time-formatter.pipe";
import { CommonModule } from "@angular/common";
import { MetricPerformanceBadgePipe } from "../../../../../../core/pipes/performance-label.pipe";

@Component({
    selector: 'app-performance-summary',
    templateUrl: './performance-summary.component.html',
    styleUrl: 'performance-summary.component.scss',
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
                filter(res => !!res.data)
            )
            .subscribe(res => this.performanceOverviewStats = res.data);
    }

}