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

@Component({
    selector: 'app-admin-view-plans',
    templateUrl: 'admin-view-plans.component.html',
    imports: [CommonModule, AdminTableComponent]
})
export class AdminViewPlansComponent implements OnInit, OnDestroy {
    private readonly _planService = inject(PlanService);
    private readonly _toastr = inject(ToastNotificationService);

    @Output() createPlanEvent = new EventEmitter<string>();

    private _destroy$ = new Subject<void>();

    tableData$ = new BehaviorSubject<ITable>({ columns: [], rows: [] });
    pagination!: IPagination;
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
        ).subscribe(table => this.tableData$.next(table));
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

    private _togglePlanStatus(row: any) {
        this._planService.updatePlanStatus({ id: row.id, status: row.status }).pipe(
            map((res) => res.data),
            filter(plan => !!plan)
        ).subscribe({
            next: (updatedPlan) => {
                const currentTable = this.tableData$.getValue();

                const updatedRows = currentTable.rows.map(r =>
                    r['id'] === updatedPlan.id ? this._mapPlanToRow(updatedPlan) : r
                );

                this.tableData$.next({
                    ...currentTable,
                    rows: updatedRows
                });

                this._toastr.success('Plan status updated.');
            },
            error: () => {
                this._toastr.error('Failed to update plan.');
            }
        });
    }

    createPlans() {
        this.createPlanEvent.emit('create plan button clicked!');
    }

    adminTableActionTriggered(event: { action: string; row: any }) {
        console.log(event);

        switch (event.action) {
            case 'toggle':
                this._togglePlanStatus(event.row);
                break;
            case 'edit':
                // handle edit
                break;
            case 'delete':
                // handle delete
                break;
        }
    }

    onPageChange(page: number) { }
}