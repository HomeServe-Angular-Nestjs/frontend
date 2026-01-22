import { Component, inject, OnDestroy, OnInit } from "@angular/core";
import { filter, map, Subject, takeUntil } from "rxjs";
import { CommonModule } from "@angular/common";
import { PlanService } from "../../../../../../core/services/plans.service";
import { ToastNotificationService } from "../../../../../../core/services/public/toastr.service";
import { IPlan, ICreatePlan, FEATURE_REGISTRY } from "../../../../../../core/models/plan.model";
import { MatDialog } from "@angular/material/dialog";
import { ConfirmDialogComponent } from "../../../../partials/shared/confirm-dialog-box/confirm-dialog.component";
import { AdminPlanDetailsComponent } from "../plans-details/plans-details.component";
import { SharedDataService } from "../../../../../../core/services/public/shared-data.service";

import { MatDialogModule } from "@angular/material/dialog";

@Component({
    selector: 'app-admin-view-plans',
    templateUrl: 'current-plans.component.html',
    standalone: true,
    imports: [CommonModule, AdminPlanDetailsComponent, MatDialogModule]
})
export class CurrentPlansComponent implements OnInit, OnDestroy {
    private readonly _planService = inject(PlanService);
    private readonly _toastr = inject(ToastNotificationService);
    private readonly _sharedService = inject(SharedDataService);
    private _dialog = inject(MatDialog);
    private _destroy$ = new Subject<void>();

    plans: IPlan[] = [];
    isViewPlanModalOpen = false;
    planToView?: IPlan;
    isEditMode = false;
    isCreateMode = false;

    readonly featureRegistry = Object.values(FEATURE_REGISTRY);

    ngOnInit(): void {
        this._sharedService.setAdminHeader('Subscriptions & Plans');
        this._loadPlans();
    }

    private _loadPlans() {
        this._planService.fetchPlans().pipe(
            map(response => response.data || []),
            takeUntil(this._destroy$)
        ).subscribe(plans => this.plans = plans);
    }

    openCreateModal() {
        this.planToView = undefined;
        this.isEditMode = true;
        this.isCreateMode = true;
        this.isViewPlanModalOpen = true;
    }

    viewPlan(plan: IPlan) {
        this.planToView = plan;
        this.isEditMode = false;
        this.isCreateMode = false;
        this.isViewPlanModalOpen = true;
    }

    editPlan(plan: IPlan) {
        this.planToView = plan;
        this.isEditMode = true;
        this.isCreateMode = false;
        this.isViewPlanModalOpen = true;
    }

    togglePlanStatus(plan: IPlan) {
        const action = plan.isActive ? 'deactivate' : 'activate';
        this._openConfirmationDialog(`Are you sure you want to ${action} this plan?`, 'Confirm Status Change')
            .afterClosed()
            .subscribe(confirmed => {
                if (!confirmed) return;

                this._planService.updatePlanStatus({ id: plan.id, status: plan.isActive }).subscribe({
                    next: (res) => {
                        if (res.success && res.data) {
                            const index = this.plans.findIndex(p => p.id === res.data!.id);
                            if (index !== -1) {
                                this.plans[index] = res.data!;
                            }
                            this._toastr.success(`Plan ${action}d successfully.`);
                        }
                    },
                    error: () => this._toastr.error('Failed to update status.')
                });
            });
    }

    handlePlanSave(planData: IPlan | ICreatePlan) {
        if (this.isCreateMode) {
            this._planService.createPlan(planData as ICreatePlan).subscribe({
                next: (res) => {
                    if (res.success && res.data) {
                        this.plans = [res.data, ...this.plans];
                        this._toastr.success('Plan created successfully.');
                        this.closeModal();
                    }
                },
                error: (err) => this._toastr.error(err.error?.message || 'Failed to create plan.')
            });
        } else {
            this._planService.updatePlan(planData as IPlan).subscribe({
                next: (res) => {
                    if (res.success && res.data) {
                        const index = this.plans.findIndex(p => p.id === res.data!.id);
                        if (index !== -1) {
                            this.plans[index] = res.data!;
                        }
                        this._toastr.success('Plan updated successfully.');
                        this.closeModal();
                    }
                },
                error: (err) => this._toastr.error(err.error?.message || 'Failed to update plan.')
            });
        }
    }

    handlePlanDelete(planId: string, modal: boolean = false) {
        this._openConfirmationDialog('Are you sure you want to delete this plan? This action cannot be undone.', 'Delete Plan')
            .afterClosed()
            .subscribe(confirmed => {
                if (!confirmed) return;

                this._planService.deletePlan(planId).subscribe({
                    next: (res) => {
                        if (res.success) {
                            this.plans = this.plans.filter(p => p.id !== planId);
                            this._toastr.success('Plan deleted successfully.');
                            if (modal) this.closeModal();
                        }
                    }
                });
            });
    }

    private _openConfirmationDialog(message: string, title: string) {
        return this._dialog.open(ConfirmDialogComponent, {
            data: { title, message },
        });
    }

    closeModal() {
        this.isViewPlanModalOpen = false;
        this.planToView = undefined;
        this.isEditMode = false;
        this.isCreateMode = false;
    }

    ngOnDestroy(): void {
        this._destroy$.next();
        this._destroy$.complete();
    }
}
