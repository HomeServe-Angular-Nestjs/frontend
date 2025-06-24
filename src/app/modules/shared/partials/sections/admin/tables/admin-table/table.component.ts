import { CommonModule } from "@angular/common";
import { Component, Input, TemplateRef } from "@angular/core";
import { ApprovalTableActions, ApprovalTableRow, ITable } from "../../../../../../../core/models/table.model";

@Component({
    selector: 'app-admin-table-templpate',
    templateUrl: './table.component.html',
    imports: [CommonModule]
})
export class AdminTableComponent {
    @Input({ required: true }) tableData!: ITable<ApprovalTableRow, ApprovalTableActions>;

    viewDocuments() {

    }
}