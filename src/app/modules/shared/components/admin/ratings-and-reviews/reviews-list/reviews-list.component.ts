import { CommonModule } from "@angular/common";
import { Component, EventEmitter, inject, Input, OnInit, Output } from "@angular/core";
import { AdminService } from "../../../../../../core/services/admin.service";
import { map, Observable, of } from "rxjs";
import { FormsModule } from "@angular/forms";
import { AdminPaginationComponent } from "../../../../partials/sections/admin/pagination/pagination.component";
import { IAdminReviewData } from "../../../../../../core/models/reviews.model";
import { ToastNotificationService } from "../../../../../../core/services/public/toastr.service";

@Component({
    selector: 'app-admin-reviews-list',
    templateUrl: './reviews-list.component.html',
    imports: [CommonModule, FormsModule]
})
export class AdminReviewsListComponent {

    @Input() reviews: IAdminReviewData[] = [];
    @Output() toggleStatusEvent = new EventEmitter<{ reviewId: string, providerId: string, status: boolean }>();

    onToggleStatus(reviewId: string, providerId: string, status: boolean): void {
        this.toggleStatusEvent.emit({ reviewId, providerId, status });
    }

    public afterSuccessToggle(reviewId: string) {
        this.reviews = this.reviews.map(r => ({
            ...r,
            isActive: reviewId === r.reviewId
                ? !r.isActive
                : r.isActive
        }));
    }
}