import { Component } from "@angular/core";
import { AdminApprovalOverviewComponent } from "../overview/overview.component";
import { AdminApprovalFilterComponent } from "../filters/approval-filter.component";

@Component({
    selector: 'app-admin-approval-layout',
    templateUrl: './approval-layout.component.html',
    imports: [AdminApprovalOverviewComponent, AdminApprovalFilterComponent],
})
export class AdminApprovalLayoutComponent { }