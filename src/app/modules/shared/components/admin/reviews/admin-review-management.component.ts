import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../../../../core/services/admin.service';
import { IAdminReviewData, IAdminReviewStats, IReviewFilters } from '../../../../../core/models/reviews.model';
import { ToastrService } from 'ngx-toastr';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { OverviewCardComponent } from '../../../partials/sections/admin/overview-card/admin-overview-card.component';
import { AdminPaginationComponent } from "../../../partials/sections/admin/pagination/pagination.component";
import { SharedDataService } from '../../../../../core/services/public/shared-data.service';

@Component({
    selector: 'app-admin-review-management',
    standalone: true,
    imports: [CommonModule, FormsModule, OverviewCardComponent, AdminPaginationComponent],
    templateUrl: './admin-review-management.component.html',
    styleUrl: './admin-review-management.component.css'
})
export class AdminReviewManagementComponent implements OnInit, OnDestroy {
    private readonly _adminService = inject(AdminService);
    private readonly _toastr = inject(ToastrService);
    private readonly _sharedService = inject(SharedDataService);
    private readonly _destroy$ = new Subject<void>();

    reviews: IAdminReviewData[] = [];
    stats: IAdminReviewStats | null = null;
    pagination = {
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0
    };

    filters: IReviewFilters = {
        page: 1,
        search: '',
        searchBy: 'content' as any,
        sortBy: 'latest' as any,
        minRating: ''
    };

    ngOnInit() {
        this._sharedService.setAdminHeader('Review Management');
        this.fetchReviews();
        this.fetchStats();
    }

    fetchReviews() {
        this._adminService.getReviewData(this.filters)
            .pipe(takeUntil(this._destroy$))
            .subscribe({
                next: (res) => {
                    if (res.data) {
                        this.reviews = res.data.reviews;
                        this.pagination = res.data.pagination;
                    }
                },
                error: (err) => this._toastr.error('Failed to fetch reviews')
            });
    }

    fetchStats() {
        this._adminService.getReviewStats()
            .pipe(takeUntil(this._destroy$))
            .subscribe({
                next: (res) => {
                    if (res.data) this.stats = res.data;
                },
                error: (err) => this._toastr.error('Failed to fetch stats')
            });
    }

    onFilterChange() {
        this.filters.page = 1;
        this.fetchReviews();
    }

    onPageChange(page: number) {
        this.filters.page = page;
        this.fetchReviews();
    }

    toggleReviewStatus(review: IAdminReviewData) {
        const newStatus = !review.isActive;
        this._adminService.updateReviewStatus({
            reviewId: review.reviewId,
            providerId: review.providerId,
            status: newStatus
        }).subscribe({
            next: (res) => {
                this._toastr.success(res.message);
                review.isActive = newStatus;
                this.fetchStats();
            },
            error: (err) => this._toastr.error('Failed to update status')
        });
    }

    getStarArray(rating: number): number[] {
        return Array(Math.floor(rating)).fill(0);
    }

    getEmptyStarArray(rating: number): number[] {
        return Array(5 - Math.floor(rating)).fill(0);
    }

    ngOnDestroy() {
        this._destroy$.next();
        this._destroy$.complete();
    }
}
