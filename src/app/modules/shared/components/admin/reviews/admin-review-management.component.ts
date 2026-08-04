import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../../../../core/services/admin.service';
import { IAdminReviewData, IAdminReviewStats, IReviewFilters, IReviewQueryParams } from '../../../../../core/models/reviews.model';
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
    isLoading = false;
    selectedReview: IAdminReviewData | null = null;
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
        minRating: '',
        status: 'all',
        reported: 'all'
    };

    ngOnInit() {
        this._sharedService.setAdminHeader('Review Management');
        this.fetchReviews();
        this.fetchStats();
    }

    fetchReviews() {
        this.isLoading = true;
        this._adminService.getReviewData(this.buildQueryParams())
            .pipe(takeUntil(this._destroy$))
            .subscribe({
                next: (res) => {
                    if (res.data) {
                        this.reviews = res.data.reviews;
                        this.pagination = res.data.pagination;
                    }
                    this.isLoading = false;
                },
                error: (err) => {
                    this.isLoading = false;
                    this._toastr.error('Failed to fetch reviews');
                }
            });
    }

    private buildQueryParams(): IReviewQueryParams {
        const params: IReviewQueryParams = {
            page: this.filters.page,
            search: this.filters.search,
            searchBy: this.filters.searchBy,
            sortBy: this.filters.sortBy,
            minRating: this.filters.minRating,
            status: 'all',
            isReported: 'all'
        };

        if (this.filters.status === 'active') params.status = true;
        else if (this.filters.status === 'hidden') params.status = false;

        if (this.filters.reported === 'reported') params.isReported = true;
        else if (this.filters.reported === 'not reported') params.isReported = false;

        return params;
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
            status: newStatus
        }).subscribe({
            next: (res) => {
                this._toastr.success(res.message);
                review.isActive = newStatus;
                if (this.selectedReview?.reviewId === review.reviewId) {
                    this.selectedReview.isActive = newStatus;
                }
                this.fetchStats();
                this.fetchReviews();
            },
            error: (err) => this._toastr.error('Failed to update status')
        });
    }

    openDetails(review: IAdminReviewData) {
        this.selectedReview = review;
    }

    closeDetails() {
        this.selectedReview = null;
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
