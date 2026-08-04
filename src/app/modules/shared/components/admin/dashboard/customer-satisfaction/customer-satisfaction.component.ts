import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../../../../../core/services/admin.service';
import { IAdminReviewStats, IReviewDistribution } from '../../../../../../core/models/reviews.model';
import { ToastrService } from 'ngx-toastr';
import { Subject, filter, map, takeUntil } from 'rxjs';
import { OverviewCardComponent } from '../../../../partials/sections/admin/overview-card/admin-overview-card.component';
import { LowestRatedProvidersComponent } from '../lowest-rated-providers/lowest-rated-providers.component';
import { RatingTrendChartComponent } from '../rating-trend-chart/rating-trend-chart.component';

@Component({
    selector: 'app-admin-customer-satisfaction',
    standalone: true,
    imports: [CommonModule, OverviewCardComponent, LowestRatedProvidersComponent, RatingTrendChartComponent],
    templateUrl: './customer-satisfaction.component.html',
})
export class CustomerSatisfactionComponent implements OnInit, OnDestroy {
    private readonly _adminService = inject(AdminService);
    private readonly _toastr = inject(ToastrService);
    private readonly _destroy$ = new Subject<void>();

    stats: IAdminReviewStats | null = null;
    isLoading = true;

    ngOnInit(): void {
        this._adminService.getReviewStats().pipe(
            map(res => res.data),
            filter(Boolean),
            takeUntil(this._destroy$)
        ).subscribe({
            next: (data) => {
                this.stats = data;
                this.isLoading = false;
            },
            error: () => {
                this._toastr.error('Failed to fetch review stats');
                this.isLoading = false;
            }
        });
    }

    getStarLabel(rating: number): string {
        return '★'.repeat(rating) + '☆'.repeat(5 - rating);
    }

    getMaxCount(distribution: IReviewDistribution[]): number {
        return Math.max(1, ...distribution.map(d => d.count));
    }

    ngOnDestroy(): void {
        this._destroy$.next();
        this._destroy$.complete();
    }
}
