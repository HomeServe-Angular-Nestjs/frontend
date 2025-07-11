import { Component, inject, OnDestroy, OnInit, ViewChild } from "@angular/core";
import { AdminViewPlansComponent } from "../view-plans/admin-view-plans.component";
import { AdminCreatePlansComponent } from "../create-plans/create-plans.component";
import { CommonModule } from "@angular/common";
import { IPlan } from "../../../../../../core/models/plan.model";
import { PlanService } from "../../../../../../core/services/plans.service";
import { ToastNotificationService } from "../../../../../../core/services/public/toastr.service";

@Component({
    selector: 'app-admin-sub-layout',
    templateUrl: 'admin-subscription-layout.component.html',
    imports: [CommonModule, AdminViewPlansComponent, AdminCreatePlansComponent]
})
export class AdminSubscriptionLayoutComponent implements OnInit, OnDestroy {
    private readonly _planService = inject(PlanService);
    private readonly _toastr = inject(ToastNotificationService);

    @ViewChild(AdminViewPlansComponent) viewPlansComponent!: AdminViewPlansComponent;

    isCreatePlanModalOpen = false;
    planToEdit: IPlan | null = null;

    ngOnInit(): void {

    }

    ngOnDestroy(): void {

    }

    enableEdit(planId: string) {
        this._planService.fetchOnePlan(planId).subscribe({
            next: (res) => {
                if (res.success && res.data) {
                    this.planToEdit = res.data;
                    this.isCreatePlanModalOpen = true;
                } else {
                    this._toastr.error('Oops, something went wrong.');
                }
            },
            error: (err) => {
                this._toastr.error('Oops, something went wrong.');
                console.error(err);
            }
        })
    }

    onPlanEdit(updatedPlan: IPlan) {
        this.viewPlansComponent.updateOrInsertRow(updatedPlan);
        this.closeModal();
    }

    closeModal() {
        this.isCreatePlanModalOpen = false;
        this.planToEdit = null;
    }
}
