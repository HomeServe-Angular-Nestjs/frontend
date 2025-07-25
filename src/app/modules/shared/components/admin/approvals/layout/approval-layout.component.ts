import { Component, inject, OnInit } from "@angular/core";
import { AdminApprovalOverviewComponent } from "../overview/overview.component";
import { AdminApprovalFilterComponent } from "../filters/approval-filter.component";
import { TableComponent } from "../../../../partials/sections/admin/tables/table.component";
import { filter, map, Observable, tap } from "rxjs";
import { ApprovalTableRow, TableData } from "../../../../../../core/models/table.model";
import { AdminService } from "../../../../../../core/services/admin.service";
import { IApprovalTableDetails } from "../../../../../../core/models/user.model";
import { CommonModule } from "@angular/common";
import { AdminTableComponent } from "../../../../partials/sections/admin/tables/admin-table/table.component";

@Component({
    selector: 'app-admin-approval-layout',
    templateUrl: './approval-layout.component.html',
    imports: [CommonModule, AdminApprovalOverviewComponent, AdminApprovalFilterComponent],
})
export class AdminApprovalLayoutComponent implements OnInit {
    private readonly _adminService = inject(AdminService);

    tableData$!: Observable<TableData<ApprovalTableRow>>;

    column: string[] = ['id', 'profile', 'documents', 'date', 'status', 'actions'];

    ngOnInit(): void {
        // this.tableData$ = this._adminService.fetchApprovalTableData().pipe(
        //     map((response => response.data)),
        //     filter((data): data is IApprovalTableDetails[] => Array.isArray(data)),
        //     map(data => createAdminApprovalsTableUI(this.column, data))
        // );
    }
}