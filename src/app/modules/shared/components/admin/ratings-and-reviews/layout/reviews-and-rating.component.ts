import { CommonModule } from "@angular/common";
import { Component, inject, ViewChild } from "@angular/core";
import { AdminReviewsFilterComponent } from "../filter/reviews-filter.component";
import { AdminReviewsListComponent } from "../reviews-list/reviews-list.component";
import { AdminPaginationComponent } from "../../../../partials/sections/admin/pagination/pagination.component";
import { delay, map, Observable } from "rxjs";
import { AdminService } from "../../../../../../core/services/admin.service";
import { SharedDataService } from "../../../../../../core/services/public/shared-data.service";
import { IAdminReviewData, IReviewFilters, PaginatedReviewResponse } from "../../../../../../core/models/reviews.model";
import { IPagination } from "../../../../../../core/models/booking.model";
import { ToastNotificationService } from "../../../../../../core/services/public/toastr.service";
import { AdminReviewOverviewComponent } from "../overviews/reviews-overviews.component";

@Component({
    selector: 'app-admin-reviews-and-ratings-layout',
    templateUrl: './reviews-and-rating.component.html',
    imports: [CommonModule, AdminReviewsFilterComponent, AdminReviewsListComponent, AdminPaginationComponent, AdminReviewOverviewComponent]
})
export class AdminReviewsAndRatingsLayout {
    private readonly _adminService = inject(AdminService);
    private readonly _sharedData = inject(SharedDataService);
    private readonly _toastr = inject(ToastNotificationService);

    @ViewChild(AdminReviewsFilterComponent)
    private _reviewFilterComponent!: AdminReviewsFilterComponent;
    @ViewChild(AdminReviewsListComponent)
    private _reviewListComponent!: AdminReviewsListComponent;

    pagination!: IPagination;
    reviews$!: Observable<IAdminReviewData[]>;

    ngOnInit(): void {
        this._sharedData.setAdminHeader('Ratings & Reviews');
        this._loadTableData();
    }

    private _loadTableData(filter: IReviewFilters = {}) {
        const response$ = this._adminService.getReviewData(filter).pipe(
            // delay(600),
            map(res => res.data ?? { reviews: [], pagination: {} })
        );

        this.reviews$ = response$.pipe(
            map(data => data.reviews)
        );

        response$.pipe(
            map(data => data.pagination as IPagination)
        ).subscribe(pagination => this.pagination = pagination);
    }

    onFilterChange(filters: IReviewFilters) {
        this._loadTableData(filters);
    }

    changePage(page: number) {
        const filters = { ...this._reviewFilterComponent.reviewFilter, page };
        this._loadTableData(filters);
    }

    onToggleStatus(data: { reviewId: string, providerId: string, status: boolean }) {
        this._adminService.updateReviewStatus(data).subscribe({
            next: (res) => {
                if (res.success) {
                    this._reviewListComponent.afterSuccessToggle(data.reviewId);
                    this._toastr.success(res.message);
                }
            },
            error: (err) => {
                console.error(err);
            }
        })
    }

}