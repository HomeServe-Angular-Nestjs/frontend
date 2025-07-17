import { Component, EventEmitter, inject, OnDestroy, OnInit, Output } from "@angular/core";
import { ITable, ITableAction, ITableRow } from "../../../../../../core/models/table.model";
import { IPagination } from "../../../../../../core/models/booking.model";
import { BehaviorSubject, filter, map, Observable, Subject, takeUntil } from "rxjs";
import { CommonModule } from "@angular/common";
import { PlanService } from "../../../../../../core/services/plans.service";
import { ToastNotificationService } from "../../../../../../core/services/public/toastr.service";
import { IPlan } from "../../../../../../core/models/plan.model";
import { createPlansTable } from "../../../../../../core/utils/generate-tables.utils";
import { AdminTableComponent } from "../../../../partials/sections/admin/tables/admin-table/table.component";
import { MatDialog } from "@angular/material/dialog";
import { ConfirmDialogComponent } from "../../../../partials/shared/confirm-dialog-box/confirm-dialog.component";

@Component({
    selector: 'app-admin-view-plans',
    templateUrl: 'admin-view-plans.component.html',
    imports: [CommonModule, AdminTableComponent]
})
export class AdminViewPlansComponent implements OnInit, OnDestroy {
    private readonly _planService = inject(PlanService);
    private readonly _toastr = inject(ToastNotificationService);
    private _dialog = inject(MatDialog);

    @Output() createPlanEvent = new EventEmitter<string>();
    @Output() editPlanEvent = new EventEmitter<any>();

    private _destroy$ = new Subject<void>();

    tableData$ = this._planService.tableData$;
    columns: string[] = ['id', 'plan name', 'pricing', 'role', 'billing cycle', 'created date', 'status'];

    ngOnInit(): void {
        this._loadTableData();
    }

    ngOnDestroy(): void {
        this._destroy$.next();
        this._destroy$.complete();
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
            actions: [
                {
                    toolTip: plan.isActive ? 'Deactivate Plan' : 'Activate Plan',
                    icon: plan.isActive ? 'visibility_off' : 'visibility',
                    styles: plan.isActive ? 'text-yellow-500' : 'text-green-500',
                    action: 'toggle',
                },
                {
                    toolTip: 'Edit Plan',
                    icon: 'edit',
                    styles: 'text-blue-600',
                    action: 'edit',
                },
                {
                    toolTip: 'Delete Plan',
                    icon: 'delete',
                    styles: 'text-red-600',
                    action: 'delete',
                }
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

    private _deletePlan(planId: string) {
        this._planService.deletePlan(planId).subscribe({
            next: (res) => {
                if (res.success) {
                    const currentTable = this._planService.getTableData;
                    const updatedRows = currentTable.rows.filter(r => r['id'] !== planId);
                    this._planService.setTableData = {
                        ...currentTable,
                        rows: updatedRows
                    };
                    this._toastr.success(res.message);
                } else {
                    this._toastr.error(res.message);
                }
            },
            error: (err) => {
                console.error(err);
                this._toastr.error('Server error while deleting plan');
            }
        });
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

    createPlans() {
        this.createPlanEvent.emit('create plan button clicked!');
    }

    adminTableActionTriggered(event: { action: string; row: any }) {
        console.log(event);
        let action = event.action;
        if (action === 'toggle') {
            action = event.row.status ? 'inactivate' : 'activate';
        }

        this._openConfirmationDialog(`Are you sure you want to ${action} the plan?`, 'Confirm Action')
            .afterClosed()
            .subscribe(confirmed => {
                if (!confirmed) return;

                switch (event.action) {
                    case 'toggle':
                        this._togglePlanStatus(event.row);
                        break;
                    case 'edit':
                        this.editPlanEvent.emit(event.row.id);
                        break;
                    case 'delete':
                        this._deletePlan(event.row.id);
                        break;
                }
            });
    }

    onPageChange(page: number) { }
}