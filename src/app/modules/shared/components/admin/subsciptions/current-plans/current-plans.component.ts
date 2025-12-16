import { Component, EventEmitter, inject, OnDestroy, OnInit, Output } from "@angular/core";
import { ITableRow } from "../../../../../../core/models/table.model";
import { filter, map, Subject, takeUntil } from "rxjs";
import { CommonModule } from "@angular/common";
import { PlanService } from "../../../../../../core/services/plans.service";
import { ToastNotificationService } from "../../../../../../core/services/public/toastr.service";
import { IPlan } from "../../../../../../core/models/plan.model";
import { createPlansTable } from "../../../../../../core/utils/generate-tables.utils";
import { AdminTableComponent } from "../../../../partials/sections/admin/tables/admin-table/table.component";
import { MatDialog } from "@angular/material/dialog";
import { ConfirmDialogComponent } from "../../../../partials/shared/confirm-dialog-box/confirm-dialog.component";
import { AdminPlanDetailsComponent } from "../plans-details/plans-details.component";
import { SharedDataService } from "../../../../../../core/services/public/shared-data.service";

@Component({
    selector: 'app-admin-view-plans',
    templateUrl: 'current-plans.component.html',
    imports: [CommonModule, AdminTableComponent, AdminPlanDetailsComponent]
})
export class CurrentPlansComponent implements OnInit, OnDestroy {
    private readonly _planService = inject(PlanService);
    private readonly _toastr = inject(ToastNotificationService);
    private readonly _sharedService = inject(SharedDataService);
    private _dialog = inject(MatDialog);
    private _destroy$ = new Subject<void>();

    tableData$ = this._planService.tableData$;
    columns: string[] = ['id', 'plan name', 'pricing', 'role', 'billing cycle', 'created date', 'status'];
    isViewPlanModalOpen = false;
    planToView!: IPlan;
    isEditMode = false;

    ngOnInit(): void {
        this._sharedService.setAdminHeader('Subscriptions & Plans');
        this._loadTableData();
    }

    public updateOrInsertRow(plan: IPlan) {
        const currentTable = this._planService.getTableData;
        const newRow = this._mapPlanToRow(plan);
        const index = currentTable.rows.findIndex(r => r['id'] === plan.id);

        let updatedRows;
        if (index > -1) {
            updatedRows = currentTable.rows.map(r => r['id'] === plan.id ? newRow : r);
        } else {
            updatedRows = [newRow, ...currentTable.rows];
        }

        this._planService.setTableData = {
            ...currentTable,
            rows: updatedRows,
        };
    }

    private _loadTableData() {
        this._planService.fetchPlans().pipe(
            map(response => response.data),
            filter(plans => !!plans),
            map(plans => createPlansTable(this.columns, plans)),
            takeUntil(this._destroy$)
        ).subscribe(table => this._planService.setTableData = table);
    }

    private _mapPlanToRow(plan: IPlan): ITableRow {
        return {
            id: plan.id,
            'plan name': plan.name,
            pricing: `₹${plan.price}`,
            role: plan.role,
            'billing cycle': plan.duration,
            'created date': plan.createdAt,
            status: plan.isActive,
            createdAt: plan.createdAt,
            actions: [
                {
                    toolTip: plan.isActive ? 'Deactivate Plan' : 'Activate Plan',
                    icon: plan.isActive ? 'fas fa-circle-check' : 'fas fa-circle-xmark',
                    styles: plan.isActive ? 'text-green-500' : 'text-red-400',
                    action: 'toggle',
                },
                {
                    toolTip: 'View Plan',
                    icon: 'fas fa-eye',
                    styles: 'text-blue-600',
                    action: 'view',
                },
                {
                    toolTip: 'Edit Plan',
                    icon: 'fas fa-edit',
                    styles: 'text-green-600',
                    action: 'edit',
                },
            ]
        };
    }

    private _openConfirmationDialog(message: string, title: string) {
        return this._dialog.open(ConfirmDialogComponent, {
            data: { title, message },
        });
    }

    private _togglePlanStatus(row: any) {
        this._planService.updatePlanStatus({ id: row.id, status: row.status }).pipe(
            map((res) => res.data),
            filter(plan => !!plan)
        ).subscribe({
            next: (updatedPlan) => {
                const currentTable = this._planService.getTableData;

                const updatedRows = currentTable.rows.map(r =>
                    r['id'] === updatedPlan.id ? this._mapPlanToRow(updatedPlan) : r
                );

                this._planService.setTableData = {
                    ...currentTable,
                    rows: updatedRows
                };

                this._toastr.success('Plan status updated.');
            },
            error: () => {
                this._toastr.error('Failed to update plan.');
            }
        });
    }

    private _viewPlan(planId: string) {
        this._planService.fetchOnePlan(planId)
            .pipe(takeUntil(this._destroy$))
            .subscribe({
                next: (res) => {
                    if (res.success && res.data) {
                        this.planToView = res.data;
                        this.isViewPlanModalOpen = true;
                    }
                },
            });
    }

    adminTableActionTriggered(event: { action: string; row: any }) {
        let action = event.action;

        if (action === 'view') {
            this._viewPlan(event.row.id);
            return;
        }

        if (action === 'toggle') {
            action = event.row.status ? 'deactivate' : 'activate';
        }

        this._openConfirmationDialog(`Are you sure you want to ${action} the plan?`, 'Confirm Action')
            .afterClosed()
            .subscribe(confirmed => {
                if (!confirmed) return;

                switch (event.action) {
                    case 'toggle':
                        this._togglePlanStatus(event.row);
                        break;
                    case 'edit': {
                        this.isEditMode = true;
                        this._viewPlan(event.row.id);
                        break;
                    }
                    default:
                        break;
                }
            });
    }

    updatePlan(newPlan: IPlan) {
        this._planService.updatePlan(newPlan)
            .pipe(takeUntil(this._destroy$))
            .subscribe({
                next: (res) => {
                    const currentTable = this._planService.getTableData;

                    const updatedRows = currentTable.rows.map(row =>
                        row['id'] === newPlan.id ? this._mapPlanToRow(newPlan) : row
                    );

                    this._planService.setTableData = {
                        ...currentTable,
                        rows: updatedRows
                    };

                    this._toastr.success(res.message);
                },
            });
    }

    closeModal() {
        this.isViewPlanModalOpen = false;
    }

    ngOnDestroy(): void {
        this._destroy$.next();
        this._destroy$.complete();
    }

}