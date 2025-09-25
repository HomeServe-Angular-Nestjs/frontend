import { Component, inject, OnDestroy, OnInit, ViewChild } from "@angular/core";
import { AdminViewPlansComponent } from "../view-plans/admin-view-plans.component";
import { AdminPlanDetailsComponent } from "../plans-details/plans-setails.component";
import { CommonModule } from "@angular/common";
import { IPlan } from "../../../../../../core/models/plan.model";
import { PlanService } from "../../../../../../core/services/plans.service";
import { ToastNotificationService } from "../../../../../../core/services/public/toastr.service";
import { SharedDataService } from "../../../../../../core/services/public/shared-data.service";
import { Subject, takeUntil } from "rxjs";

@Component({
    selector: 'app-admin-sub-layout',
    templateUrl: 'admin-subscription-layout.component.html',
    imports: [CommonModule, AdminViewPlansComponent, AdminPlanDetailsComponent]
})
export class AdminSubscriptionLayoutComponent implements OnInit, OnDestroy {
    private readonly _planService = inject(PlanService);
    private readonly _toastr = inject(ToastNotificationService);
    private readonly _sharedData = inject(SharedDataService);

    private _destroy$ = new Subject<void>();

    @ViewChild(AdminViewPlansComponent) viewPlansComponent!: AdminViewPlansComponent;

    isViewPlanModalOpen = false;
    planToView!: IPlan;

    ngOnInit(): void {
        this._sharedData.setAdminHeader('Subscription & Plans');
    }

    ngOnDestroy(): void {
        this._destroy$.next();
        this._destroy$.complete();
    }

    viewPlan(planId: string) {
        this._planService.fetchOnePlan(planId)
            .pipe(takeUntil(this._destroy$))
            .subscribe({
                next: (res) => {
                    if (res.success && res.data) {
                        this.planToView = res.data;
                        this.isViewPlanModalOpen = true;
                    } else {
                        this._toastr.error('Oops, something went wrong.');
                    }
                },
            });
    }

    closeViewPlan(updatedPlan: IPlan) {
        this.viewPlansComponent.updateOrInsertRow(updatedPlan);
        this.closeModal();
    }

    closeModal() {
        this.isViewPlanModalOpen = false;
    }
}
